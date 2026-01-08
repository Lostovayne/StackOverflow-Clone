"use client";

import { authenticate, Provider } from "@/app/actions/auth";
import Image from "next/image";
import { unstable_rethrow } from "next/navigation";
import { toast } from "sonner";
import { Button } from "../ui/button";

const SocialAuthForm = () => {
  const buttonClassName =
    "background-dark400_light900 body-medium text-dark200_light800 min-h-12 flex-1 rounded-2 px-4 py-3.5 ";

  const handleSignIn = async (provider: Provider) => {
    try {
      await authenticate(provider);
    } catch (error) {
      unstable_rethrow(error);

      toast.warning("Sign-in Failed", {
        description: error instanceof Error ? error.message : "An error occurred while signing in.",
        descriptionClassName: "text-sm text-dark400_light900",
        duration: 5000,
      });
    }
  };

  return (
    <div className="mt-10 flex flex-wrap gap-2.5">
      <Button className={buttonClassName} onClick={() => handleSignIn("github")}>
        <Image
          src={"/icons/github.svg"}
          width={20}
          height={20}
          alt={"Github Icon"}
          className="invert-colors mr-2.5 object-contain"
        />
        <span>Log in with Github</span>
      </Button>
      <Button className={buttonClassName} onClick={() => handleSignIn("google")}>
        <Image
          src={"/icons/google.svg"}
          width={20}
          height={20}
          alt={"Google Icon"}
          className="mr-2.5 object-contain"
        />
        <span>Log in with Google</span>
      </Button>
    </div>
  );
};
export default SocialAuthForm;
