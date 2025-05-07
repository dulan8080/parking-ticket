import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import prisma from "./prisma";

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
              roles: user.roles.map((ur: any) => ur.role.name),
            };
          } else {
            console.log("Attempting email/password authentication");
            // Email/password authentication
            const { email, password } = credentials;

            if (!email || !password) {
              console.log("Missing email or password");
              return null;
            }

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
              roles: user.roles.map((ur: any) => ur.role.name),
            };
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
        token.roles = user.roles;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.roles = token.roles as string[];
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
  debug: process.env.NODE_ENV === 'development',
}); 