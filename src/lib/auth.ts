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
        pin: { label: "PIN", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) {
          return null;
        }

        // Decide whether to use email/password or PIN for authentication
        if (credentials.pin) {
          // PIN authentication
          const user = await prisma.user.findFirst({
            where: { pin: credentials.pin },
            include: {
              roles: {
                include: {
                  role: true,
                },
              },
            },
          });

          if (!user) {
            return null;
          }

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            roles: user.roles.map((ur) => ur.role.name),
          };
        } else {
          // Email/password authentication
          const { email, password } = credentials;

          if (!email || !password) {
            return null;
          }

          const user = await prisma.user.findUnique({
            where: { email },
            include: {
              roles: {
                include: {
                  role: true,
                },
              },
            },
          });

          if (!user) {
            return null;
          }

          const isValidPassword = await compare(password, user.password);

          if (!isValidPassword) {
            return null;
          }

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            roles: user.roles.map((ur) => ur.role.name),
          };
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
  secret: process.env.AUTH_SECRET,
}); 