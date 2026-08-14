import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",

      credentials: {
        identifier: {
          label: "Email, Phone or Username",
          type: "text",
        },
        otpVerified: {
          label: "OTP Verified",
          type: "text",
        },
      },

      async authorize(credentials) {
        try {
          if (
            !credentials?.identifier ||
            credentials?.otpVerified !== "true"
          ) {
            return null;
          }

          await dbConnect();

          const user = await UserModel.findOne({
            $or: [
              { phone: credentials.identifier },
              { email: credentials.identifier },
              { username: credentials.identifier },
            ],
          });

          if (!user) {
            return null;
          }

          if (!user.isVerified) {
            return null;
          }

          if (!user.loginOtpVerified) {
            return null;
          }

          // OTP verification ko one-time use banao
          user.loginOtpVerified = false;
          await user.save();

          return {
            id: user._id.toString(),
            _id: user._id.toString(),
            username: user.username,
            email: user.email,
            phone: user.phone,
            role: user.role,
            isVerified: user.isVerified,
          };
        } catch (error) {
          console.error("NextAuth authorize error:", error);
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user._id = token._id as string;
        session.user.isVerified = token.isVerified as boolean;
        session.user.username = token.username as string;
        session.user.email = token.email as string;
        session.user.phone = token.phone as string;
        session.user.role = token.role as string;
      }

      return session;
    },

    async jwt({ token, user }) {
      if (user) {
        token._id = user._id?.toString();
        token.isVerified = user.isVerified;
        token.username = user.username;
        token.email = user.email;
        token.phone = user.phone;
        token.role = user.role;
      }

      return token;
    },
  },

  pages: {
    signIn: "/sign-in",
  },

  session: {
    strategy: "jwt",
  },

  secret: process.env.NEXTAUTH_SECRET,
};