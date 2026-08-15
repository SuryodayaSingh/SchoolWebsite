import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";

import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";

export const authOptions: NextAuthOptions = {
  providers: [
    // ==========================================
    // CREDENTIALS LOGIN
    // ==========================================
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",

      credentials: {
        identifier: {
          label: "Phone",
          type: "text",
        },

        password: {
          label: "Password",
          type: "password",
        },
      },

      async authorize(credentials) {
        try {
          // -------------------------------
          // CHECK INPUT
          // -------------------------------
          if (
            !credentials?.identifier ||
            !credentials?.password
          ) {
            throw new Error(
              "Phone number and password are required"
            );
          }

          const identifier =
            credentials.identifier.trim();

          const password =
            credentials.password;

          // -------------------------------
          // DATABASE
          // -------------------------------
          await dbConnect();

          // -------------------------------
          // FIND USER
          // -------------------------------
          const user = await UserModel.findOne({
            $or: [
              {
                phone: identifier,
              },
              {
                email: identifier.toLowerCase(),
              },
              {
                username: identifier,
              },
            ],
          });

          if (!user) {
            throw new Error(
              "Invalid phone number or password"
            );
          }

          // -------------------------------
          // CHECK ACCOUNT VERIFICATION
          // -------------------------------
          if (!user.isVerified) {
            throw new Error(
              "Please verify your account first"
            );
          }

          // -------------------------------
          // PASSWORD CHECK
          // -------------------------------
          const passwordCorrect =
            await bcrypt.compare(
              password,
              user.password
            );

          if (!passwordCorrect) {
            throw new Error(
              "Invalid phone number or password"
            );
          }

          // -------------------------------
          // RETURN USER
          // -------------------------------
          return {
            id: user._id.toString(),
            username: user.username,
            email: user.email,
            phone: user.phone,
            role: user.role,
          };
        } catch (error) {
          console.error(
            "NEXTAUTH AUTHORIZE ERROR:",
            error
          );

          return null;
        }
      },
    }),

    // ==========================================
    // GOOGLE LOGIN
    // ==========================================
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  // ==========================================
  // SESSION
  // ==========================================
  session: {
    strategy: "jwt",
  },

  // ==========================================
  // JWT
  // ==========================================
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.email = user.email;
        token.phone = user.phone;
        token.role = user.role;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.username =
          token.username as string;
        session.user.email =
          token.email as string;
        session.user.phone =
          token.phone as string;
        session.user.role =
          token.role as "student" | "admin";
      }

      return session;
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }

      if (url.startsWith(baseUrl)) {
        return url;
      }

      return baseUrl;
    },
  },

  // ==========================================
  // CUSTOM PAGES
  // ==========================================
  pages: {
    signIn: "/sign-in",
  },

  // ==========================================
  // SECRET
  // ==========================================
  secret: process.env.NEXTAUTH_SECRET,

  // ==========================================
  // DEBUG
  // ==========================================
  debug: process.env.NODE_ENV === "development",
};