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
          label: "Phone / Email / Username",
          type: "text",
        },

        password: {
          label: "Password",
          type: "password",
        },
      },

      async authorize(credentials) {
        try {

          const identifier = credentials?.identifier?.trim();
          const password = credentials?.password;

          if (!identifier || !password) {
            console.log("LOGIN ERROR: Missing identifier or password");
            return null;
          }

          console.log("LOGIN ATTEMPT:", identifier);

          // ==========================================
          // DATABASE CONNECT
          // ==========================================
          await dbConnect();

          // ==========================================
          // FIND USER
          // ==========================================
          const user = await UserModel.findOne({
            $or: [
              { phone: identifier },
              { email: identifier.toLowerCase() },
              { username: identifier },
            ],
          });

          // ==========================================
          // USER NOT FOUND
          // ==========================================
          if (!user) {
            console.log("LOGIN ERROR: User not found");
            return null;
          }

          console.log("USER FOUND:", {
            id: user._id.toString(),
            username: user.username,
            email: user.email,
            phone: user.phone,
            isVerified: user.isVerified,
            role: user.role,
          });

          // ==========================================
          // ACCOUNT VERIFICATION
          // ==========================================
          if (user.isVerified !== true) {
            console.log(
              "LOGIN ERROR: Account is not verified"
            );
            return null;
          }

          // ==========================================
          // CHECK PASSWORD
          // ==========================================
          if (!user.password) {
            console.log(
              "LOGIN ERROR: User password does not exist"
            );
            return null;
          }

          const passwordCorrect = await bcrypt.compare(
            password,
            user.password
          );

          console.log(
            "PASSWORD MATCH:",
            passwordCorrect
          );

          if (!passwordCorrect) {
            console.log("LOGIN ERROR: Incorrect password");
            return null;
          }

          // ==========================================
          // LOGIN SUCCESS
          // ==========================================
          console.log(
            "LOGIN SUCCESS:",
            user.username
          );

          return {
            id: user._id.toString(),
            name: user.username,
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
  // JWT + SESSION
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

  pages: {
    signIn: "/sign-in",
  },


  secret: process.env.NEXTAUTH_SECRET,

  debug: process.env.NODE_ENV === "development",
};