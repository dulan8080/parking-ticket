import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import prisma from "./prisma";

// Fallback secret for development only - should be replaced by a proper environment variable
const authSecret = process.env.AUTH_SECRET || "fallback-dev-secret-do-not-use-in-production";

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

          // Decide whether to use email/password or PIN for authentication
          if (credentials.pin) {
            console.log("Attempting PIN authentication with:", credentials.pin);
            
            try {
              // PIN authentication
              const user = await prisma.user.findFirst({
                where: { pin: credentials.pin }
              });

              console.log("PIN authentication result:", user ? "User found" : "No user found");

              if (!user) {
                return null;
              }

              console.log("PIN authentication successful for user:", user.email);
              return {
                id: user.id,
                name: user.name,
                email: user.email,
                roles: user.roles?.map((ur: any) => ur.role.name) || [],
              };
            } catch (error) {
              console.error("Database error during PIN authentication:", error);
              // Fallback for demo purposes when DB isn't available
              if (credentials.pin === "1234") {
                console.log("Using fallback demo user for PIN auth");
                return {
                  id: "demo-user-1",
                  name: "Demo User",
                  email: "demo@example.com",
                  roles: ["USER"],
                };
              }
              return null;
            }
          } else {
            console.log("Attempting email/password authentication");
            // Email/password authentication
            const { email, password } = credentials;

            if (!email || !password) {
              console.log("Missing email or password");
              return null;
            }

            try {
              const user = await prisma.user.findUnique({
                where: { email }
              });

              if (!user) {
                console.log("No user found with email:", email);
                return null;
              }

              const isValidPassword = await compare(password, user.password);

              if (!isValidPassword) {
                console.log("Invalid password for user:", email);
                return null;
              }

              console.log("Email/password authentication successful for user:", email);
              return {
                id: user.id,
                name: user.name,
                email: user.email,
                roles: user.roles?.map((ur: any) => ur.role.name) || [],
              };
            } catch (error) {
              console.error("Database error during email auth:", error);
              // Fallback for demo purposes when DB isn't available
              if (email === "admin@example.com" && password === "password") {
                console.log("Using fallback demo admin user");
                return {
                  id: "demo-admin-1",
                  name: "Demo Admin",
                  email: "admin@example.com",
                  roles: ["ADMIN", "USER"],
                };
              } else if (email === "user@example.com" && password === "password") {
                console.log("Using fallback demo regular user");
                return {
                  id: "demo-user-2",
                  name: "Demo User",
                  email: "user@example.com",
                  roles: ["USER"],
                };
              }
              return null;
            }
          }
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