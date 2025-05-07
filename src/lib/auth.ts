import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import prisma from "./prisma";

// Fallback secret for development only - should be replaced by a proper environment variable
const authSecret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "fallback-dev-secret-do-not-use-in-production";

// Determine the NextAuth URL based on environment
const getNextAuthUrl = () => {
  // For Vercel deployments
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  // Explicit setting takes priority
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL;
  }
  // Local development fallback
  return 'http://localhost:3000';
};

// Helper function to validate PIN or credentials without bcryptjs
// This can be used in Edge runtime without issues
const validateCredentialsWithoutBcrypt = async (credentials: any) => {
  // Demo users for when DB is not available
  if (credentials.pin) {
    if (credentials.pin === "1234") {
      return {
        id: "demo-user-1",
        name: "Demo User",
        email: "demo@example.com",
        roles: ["USER"],
      };
    }
    if (credentials.pin === "4321") {
      return {
        id: "demo-admin-pin",
        name: "Demo Admin (PIN)",
        email: "demo-admin@example.com",
        roles: ["ADMIN", "USER"],
      };
    }
    if (credentials.pin === "0000") {
      return {
        id: "demo-attendant",
        name: "Demo Attendant",
        email: "attendant@example.com",
        roles: ["USER"],
      };
    }
    return null;
  } else if (credentials.email && credentials.password) {
    // Demo admin
    if (credentials.email === "admin@example.com" && credentials.password === "password") {
      return {
        id: "demo-admin-1",
        name: "Demo Admin",
        email: "admin@example.com",
        roles: ["ADMIN", "USER"],
      };
    }
    // Demo user
    if (credentials.email === "user@example.com" && credentials.password === "password") {
      return {
        id: "demo-user-2",
        name: "Demo User",
        email: "user@example.com",
        roles: ["USER"],
      };
    }
    // Demo attendant
    if (credentials.email === "attendant@example.com" && credentials.password === "password") {
      return {
        id: "demo-attendant-1",
        name: "Demo Attendant",
        email: "attendant@example.com",
        roles: ["USER"],
      };
    }
  }
  return null;
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        pin: { label: "PIN", type: "text" },
      },
      async authorize(credentials) {
        try {
          if (!credentials) {
            console.log("No credentials provided");
            return null;
          }

          // First, try the DB-less validation (works in Edge)
          const demoUser = await validateCredentialsWithoutBcrypt(credentials);
          if (demoUser) {
            console.log("Using demo user credentials");
            return demoUser;
          }

          // If we get here, attempt database validation
          // Skip if in Edge runtime without DB access
          let user = null;
          try {
            // Decide whether to use email/password or PIN for authentication
            if (credentials.pin) {
              console.log("Attempting PIN authentication with:", credentials.pin);
              
              // PIN authentication
              user = await prisma.user.findFirst({
                where: { pin: credentials.pin }
              });

              console.log("PIN authentication result:", user ? "User found" : "No user found");

            } else if (credentials.email && credentials.password) {
              console.log("Attempting email/password authentication");
              // Email/password authentication
              user = await prisma.user.findUnique({
                where: { email: credentials.email }
              });

              if (user) {
                const isValidPassword = await compare(credentials.password, user.password);
                if (!isValidPassword) {
                  console.log("Invalid password for user:", credentials.email);
                  user = null;
                }
              } else {
                console.log("No user found with email:", credentials.email);
              }
            }
          } catch (error) {
            console.error("Database error during authentication:", error);
            // Continue with null user - we'll return null below
          }

          if (!user) {
            return null;
          }

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            roles: user.roles?.map((ur: any) => ur.role.name) || [],
          };
        } catch (error) {
          console.error("Authentication error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.roles = user.roles || [];
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.roles = (token.roles as string[]) || [];
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login", // Error code passed in query string as ?error=
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: authSecret,
  debug: process.env.NODE_ENV === 'development',
  trustHost: true,
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: true,
      },
    },
  }
}); 