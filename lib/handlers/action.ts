"use server";

import { auth } from "@/auth";
import { Session } from "next-auth";
import { ZodType } from "zod";
import { UnauthorizedError, ValidationError } from "../http-errors";
import dbConnect from "../mongoose";

type ActionResult<T> =
  | { success: true; params: T; session: Session | null }
  | { success: false; error: ValidationError | UnauthorizedError | Error };

type ActionOptions<T> = {
  params?: unknown;
  schema?: ZodType<T>;
  authorize?: boolean;
};

async function action<T>({
  params,
  schema,
  authorize,
}: ActionOptions<T>): Promise<ActionResult<T>> {
  // 1. Validation
  if (schema) {
    const result = schema.safeParse(params);
    if (!result.success) {
      return {
        success: false,
        error: new ValidationError(result.error.flatten().fieldErrors as Record<string, string[]>),
      };
    }
    params = result.data;
  }

  // 2. Authorization
  let session: Session | null = null;
  if (authorize) {
    session = await auth();
    if (!session) {
      return { success: false, error: new UnauthorizedError() };
    }
  }

  // 3. Database Connection
  await dbConnect();

  return { success: true, params: params as T, session };
}

export default action;
