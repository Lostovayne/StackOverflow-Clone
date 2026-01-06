import Account from "@/database/account.model";
import User from "@/database/user.model";
import handleError from "@/lib/handlers/error";
import { ValidationError } from "@/lib/http-errors";
import dbConnect from "@/lib/mongoose";
import { SignInWithOAuthSchema } from "@/lib/validations";
import { APIErrorResponse } from "@/types/global";
import mongoose from "mongoose";
import slugify from "slugify";

export async function POST(request: Request) {
  const { provider, providerAccountId, user } = await request.json();

  await dbConnect();
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const validateData = SignInWithOAuthSchema.safeParse({
      provider,
      providerAccountId,
      user,
    });

    if (!validateData.success)
      throw new ValidationError(validateData.error.flatten().fieldErrors);

    const { name, username, email, image } = user;

    // User data verified with slugify
    const slugifiedUsername = slugify(username, {
      lower: true,
      strict: true,
      trim: true,
    });

    let existingUser = await User.findOne({ email }).session(session);

    if (!existingUser) {
      [existingUser] = await User.create(
        [{ name, username: slugifiedUsername, email, image }],
        { session },
      );
    } else {
      const updatedData: { name?: string; image?: string } = {};

      // Update only if the fields are provided differently
      if (existingUser.name !== name) updatedData.name = name;
      if (existingUser.image !== image) updatedData.image = image;

      if (Object.keys(updatedData).length > 0) {
        await User.updateOne(
          { _id: existingUser._id },
          { $set: updatedData },
          { session },
        );
      }

      // Account existing, no need to create a new one
      const existingAccount = await Account.findOne({
        provider,
        providerAccountId,
        userId: existingUser._id,
      }).session(session);

      if (!existingAccount) {
        await Account.create(
          [{ userId: existingUser._id, name, provider, providerAccountId }],
          { session },
        );
      }

      await session.commitTransaction();
    }
  } catch (error: unknown) {
    await session.abortTransaction();
    return handleError(error, "api") as APIErrorResponse;
  } finally {
    await session.endSession();
  }
}
