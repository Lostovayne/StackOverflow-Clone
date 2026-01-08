import Account from "@/database/account.model";
import User from "@/database/user.model";
import handleError from "@/lib/handlers/error";
import { ValidationError } from "@/lib/http-errors";
import dbConnect from "@/lib/mongoose";
import { SignInWithOAuthSchema } from "@/lib/validations";
import { APIErrorResponse, APIResponse } from "@/types/global";
import mongoose from "mongoose";
import { NextResponse } from "next/server";
import slugify from "slugify";

export async function POST(request: Request): Promise<APIResponse<{ userId: string }>> {
  let session: mongoose.ClientSession | null = null;

  try {
    await dbConnect();
    session = await mongoose.startSession();
    session.startTransaction();

    const payload = await request.json();
    const validateData = SignInWithOAuthSchema.safeParse(payload);
    if (!validateData.success) throw new ValidationError(validateData.error.flatten().fieldErrors);

    const {
      provider,
      providerAccountId,
      user: { name, username, email, image },
    } = validateData.data;

    const slugifiedUsername = slugify(username, {
      lower: true,
      strict: true,
      trim: true,
    });

    let userDoc = await User.findOne({ email }).session(session);
    const isNewUser = !userDoc;

    if (!userDoc) {
      [userDoc] = await User.create([{ name, username: slugifiedUsername, email, image }], { session });
    } else {
      const updatedData: { name?: string; image?: string } = {};
      if (userDoc.name !== name) updatedData.name = name;
      if (userDoc.image !== image && image) updatedData.image = image;

      if (Object.keys(updatedData).length > 0) {
        await User.updateOne({ _id: userDoc._id }, { $set: updatedData }, { session });
      }
    }

    const existingAccount = await Account.findOne({
      provider,
      providerAccountId,
      userId: userDoc!._id,
    }).session(session);

    if (!existingAccount) {
      await Account.create([{ userId: userDoc!._id, name, provider, providerAccountId }], { session });
    }

    await session.commitTransaction();

    return NextResponse.json(
      {
        success: true,
        data: { userId: userDoc!._id.toString() },
      },
      { status: isNewUser ? 201 : 200 }
    );
  } catch (error: unknown) {
    if (session) await session.abortTransaction();
    return handleError(error, "api") as APIErrorResponse;
  } finally {
    if (session) await session.endSession();
  }
}
