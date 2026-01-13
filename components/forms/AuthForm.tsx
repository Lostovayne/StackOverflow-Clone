"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { Resolver } from "react-hook-form";
import { DefaultValues, FieldValues, Path, SubmitHandler, useForm } from "react-hook-form";
import type { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import ROUTES from "@/constants/routes";
import Link from "next/link";

interface AuthFormProps<T extends FieldValues> {
  schema: z.ZodObject<z.ZodRawShape>;
  defaultValues: T;
  onSubmit: (data: T) => Promise<{ success: boolean; data: T }>;
  formType: "SIGN_IN" | "SIGN_UP";
}

const AuthForm = <T extends FieldValues>({
  schema,
  defaultValues,
  onSubmit,
  formType,
}: AuthFormProps<T>) => {
  const form = useForm<T>({
    resolver: zodResolver(schema) as Resolver<T>,
    defaultValues: defaultValues as DefaultValues<T>,
  });

  const handleSubmit: SubmitHandler<T> = async (data) => {
    await onSubmit(data);
  };

  const buttonText = formType === "SIGN_IN" ? "Sign In" : "Sign Up";

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 mt-10">
        {Object.keys(defaultValues).map((field) => (
          <FormField
            key={field}
            control={form.control}
            name={field as Path<T>}
            render={({ field }) => (
              <FormItem className="flex w-full flex-col gap-2.5">
                <FormLabel className="paragraph-medium text-dark400_light700">
                  {field.name === "email"
                    ? "Email"
                    : field.name.charAt(0).toUpperCase() + field.name.slice(1)}
                </FormLabel>
                <FormControl>
                  <Input
                    required
                    type={field.name === "password" ? "password" : "text"}
                    {...field}
                    className="paragraph-regular background-light900_dark300 light-border-2 text-dark300_light700 no-focus min-h-12 rounded-1.5 border"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}

        <Button
          disabled={form.formState.isSubmitting}
          className="primary-gradient cursor-pointer paragraph-medium min-h-12 w-full rounded-2 px-4 py-3 font-inter text-light-900!"
        >
          {form.formState.isSubmitting
            ? buttonText === "Sign In"
              ? "Signing In..."
              : "Signing Up..."
            : buttonText}
        </Button>
        {formType === "SIGN_IN" ? (
          <p>
            Don&apos;t have an account?{" "}
            <Link href={ROUTES.SIGN_UP} className="paragraph-semibold primary-text-gradient">
              Sign up
            </Link>
          </p>
        ) : (
          <p>
            Already have an account?{" "}
            <Link href={ROUTES.SIGN_IN} className="paragraph-semibold primary-text-gradient">
              Sign in
            </Link>
          </p>
        )}
      </form>
    </Form>
  );
};

export default AuthForm;
