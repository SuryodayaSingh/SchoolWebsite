import mongoose, { Schema, Document, Model } from "mongoose";

export interface Grade {
  subject: string;
  marks: number;
}

export interface User extends Document {
  username: string;
  email: string;
  phone: string;
  password: string;

  // OTP
  verifyCode: string;
  verifyCodeExpiry: Date;

  // Signup verification
  isVerified: boolean;

  // Login OTP verification
  loginOtpVerified: boolean;

  role: "student" | "admin";

  rollNumber?: string;
  class?: string;

  // Yearly Examination Marks
  grades?: Grade[];

  // Half Yearly Examination Marks
  halfYearlyGrades?: Grade[];
}

const GradeSchema = new Schema<Grade>(
  {
    subject: {
      type: String,
      required: true,
      trim: true,
    },

    marks: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
  },
  {
    _id: false,
  }
);

const UserSchema = new Schema<User>(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      trim: true,
      unique: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    // =========================
    // OTP FOR SIGNUP / LOGIN
    // =========================
    verifyCode: {
      type: String,
      required: true,
    },

    verifyCodeExpiry: {
      type: Date,
      required: true,
    },

    // =========================
    // ACCOUNT VERIFIED AFTER SIGNUP
    // =========================
    isVerified: {
      type: Boolean,
      default: false,
    },

    // =========================
    // TEMPORARY LOGIN OTP STATUS
    // =========================
    loginOtpVerified: {
      type: Boolean,
      default: false,
    },

    role: {
      type: String,
      enum: ["student", "admin"],
      default: "student",
    },

    rollNumber: {
      type: String,
      default: "",
      trim: true,
    },

    class: {
      type: String,
      default: "",
      trim: true,
    },

    // ========================================
    // YEARLY EXAMINATION MARKS
    // ========================================
    grades: {
      type: [GradeSchema],
      default: [],
    },

    // ========================================
    // HALF YEARLY EXAMINATION MARKS
    // ========================================
    halfYearlyGrades: {
      type: [GradeSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const UserModel: Model<User> =
  mongoose.models.User ||
  mongoose.model<User>("User", UserSchema);

export default UserModel;