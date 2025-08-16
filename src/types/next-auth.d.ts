declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      firstName: string;
      lastName: string;
      subscriptionTier: string;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    firstName: string;
    lastName: string;
    subscriptionTier: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    firstName: string;
    lastName: string;
    subscriptionTier: string;
  }
}
