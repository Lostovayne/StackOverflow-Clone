type User = {
  email: string;
  name: string;
  image: string;
  username: string;
};

interface SignInWithOAuthParams {
  provider: "github" | "google";
  providerAccountId: string;
  user: User;
}
