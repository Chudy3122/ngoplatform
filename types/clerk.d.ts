// types/clerk.d.ts
import { UserResource } from "@clerk/types";

declare module "@clerk/nextjs/server" {
  interface AuthObject {
    sessionClaims: {
      metadata: {
        role?: string;
      };
    };
    userId?: string;
  }
}

declare module "@clerk/nextjs" {
  interface ClerkMiddlewareAuthObject {
    sessionClaims: {
      metadata: {
        role?: string;
      };
    };
    userId?: string;
  }
}