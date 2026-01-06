import NextAuth from "next-auth";
import Github from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { IAccountDoc } from "./database/account.model";
import { api } from "./lib/api";
import { ActionResponse } from "./types/global";

export const PROVIDERS = ["github", "google"] as const;

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Github, Google],
  callbacks: {
    async session({ session, token }) {
      session.user.id = token.sub as string;
      return session;
    },
    async jwt({ token, account }) {
      if (account) {
        const { data: existingAccount, success } = (await api.accounts.getByProvider(
          account.type === "credentials" ? token.email! : account.providerAccountId
        )) as ActionResponse<IAccountDoc>;

        if (!success || !existingAccount) return token;
        const userId = existingAccount.userId;
        if (userId) token.sub = userId.toString();
      }
      return token;
    },
    async signIn({ user, account, profile }) {
      if (account?.type === "credentials") return true;
      if (!account || !user) return false;

      const userInfo = {
        name: user.name!,
        email: user.email!,
        image: user.image!,
        username:
          account.provider === "github" ? (profile?.login as string) : (user.name?.toLowerCase() as string),
      };

      const { success } = (await api.auth.oAuthSignIn({
        user: userInfo,
        provider: account.provider as (typeof PROVIDERS)[number],
        providerAccountId: account.providerAccountId,
      })) as ActionResponse;

      if (!success) return false;
      return true;
    },
  },
});
