"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { FcGoogle } from "react-icons/fc";

type ApiResponse = {
  success?: boolean;
  message?: string;
  user?: {
    id?: string;
    username?: string;
    email?: string;
    role?: string;
  };
};

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<"login" | "otp">("login");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  // ==========================================
  // SAFE API RESPONSE PARSER
  // ==========================================
  async function getApiResponse(
    response: Response
  ): Promise<ApiResponse> {
    const text = await response.text();

    try {
      return JSON.parse(text);
    } catch {
      console.error("SERVER RETURNED NON-JSON:", text);

      // 404 route error ko clearly show karega
      if (response.status === 404) {
        throw new Error(
          "API route not found. Please check app/api/verify-login-otp/route.ts"
        );
      }

      throw new Error(
        "Server returned an invalid response"
      );
    }
  }

  // ==========================================
  // STEP 1: PHONE/PASSWORD VERIFY
  // SEND LOGIN OTP
  // ==========================================
  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setError("");
    setMessage("");

    const cleanPhone = phone.trim();

    if (!cleanPhone) {
      setError("Please enter your phone number");
      return;
    }

    if (!password) {
      setError("Please enter your password");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/send-login-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier: cleanPhone,
          password: password,
        }),
      });

      const data = await getApiResponse(response);

      if (!response.ok || !data.success) {
        setError(
          data.message || "Invalid phone number or password"
        );
        return;
      }

      setPhone(cleanPhone);
      setOtp("");

      setMessage(
        data.message || "OTP sent to your registered email"
      );

      setStep("otp");
    } catch (error) {
      console.error("LOGIN ERROR:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  // ==========================================
  // STEP 2: VERIFY LOGIN OTP
  // ==========================================
  async function handleVerifyOtp(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setError("");
    setMessage("");

    const cleanOtp = otp.trim();

    if (cleanOtp.length !== 6) {
      setError("Please enter a valid 6 digit OTP");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/verify-login-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },

        // IMPORTANT:
        // Backend expects identifier + otp
        body: JSON.stringify({
          identifier: phone.trim(),
          otp: cleanOtp,
        }),
      });

      const data = await getApiResponse(response);

      if (!response.ok || !data.success) {
        setError(data.message || "Invalid OTP");
        return;
      }

      // ======================================
      // OTP VERIFIED SUCCESSFULLY
      // CREATE NEXTAUTH SESSION
      // ======================================
      const res = await signIn("credentials", {
        identifier: phone.trim(),
        otpVerified: "true",
        redirect: false,
      });

      if (res?.error) {
        console.error("NEXTAUTH LOGIN ERROR:", res.error);

        setError(
          "OTP verified successfully, but session login failed. Please try again."
        );
        return;
      }

      // ======================================
      // REDIRECT BASED ON USER ROLE
      // ======================================
      if (data.user?.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }

      router.refresh();
    } catch (error) {
      console.error("VERIFY OTP ERROR:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong while verifying OTP."
      );
    } finally {
      setLoading(false);
    }
  }

  // ==========================================
  // RESEND OTP
  // ==========================================
  async function handleResendOtp() {
    setError("");
    setMessage("");

    if (!phone.trim() || !password) {
      setError(
        "Please go back and enter your phone number and password again."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/send-login-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier: phone.trim(),
          password: password,
        }),
      });

      const data = await getApiResponse(response);

      if (!response.ok || !data.success) {
        setError(data.message || "Could not resend OTP");
        return;
      }

      setOtp("");

      setMessage(
        data.message || "A new OTP has been sent to your email."
      );
    } catch (error) {
      console.error("RESEND OTP ERROR:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Could not resend OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  // ==========================================
  // GOOGLE LOGIN
  // ==========================================
  async function handleGoogleLogin() {
    setError("");

    try {
      await signIn("google", {
        callbackUrl: "/dashboard",
      });
    } catch (error) {
      console.error("GOOGLE LOGIN ERROR:", error);
      setError("Google login failed. Please try again.");
    }
  }

  // ==========================================
  // BACK TO LOGIN
  // ==========================================
  function handleBackToLogin() {
    setStep("login");
    setOtp("");
    setError("");
    setMessage("");
  }

  return (
    <div
      className="min-h-screen w-full bg-gray-100 flex flex-col items-center justify-center px-4 py-8"
      style={{
        fontFamily: '"Archivo Black", sans-serif',
      }}
    >
      {/* SCHOOL NAME */}
      <div className="text-center mb-6">
        <span
          className="font-bold text-4xl"
          style={{
            fontFamily: '"Archivo Black", sans-serif',
            color: "#574f87",
          }}
        >
          KISAN INTER COLLEGE
        </span>
      </div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* HEADER */}
        <div className="px-8 pt-8 text-center">
          <h1 className="font-bold text-3xl text-gray-900">
            {step === "login" ? "Welcome Back!" : "Verify OTP"}
          </h1>

          <div className="mt-3 text-indigo-800 text-sm font-sans">
            {step === "login" ? (
              <>
                <p>Log in to your School account</p>
                <p>and manage your student&apos;s information.</p>
              </>
            ) : (
              <>
                <p>
                  Enter the 6 digit OTP sent to your registered email.
                </p>

                <p className="font-bold mt-2">
                  Login Number: {phone}
                </p>
              </>
            )}
          </div>
        </div>

        {/* ======================================
            LOGIN FORM
        ====================================== */}
        {step === "login" ? (
          <form
            onSubmit={handleSubmit}
            className="px-8 py-6"
          >
            {/* PHONE */}
            <div className="mb-5">
              <Label
                htmlFor="phone"
                className="font-semibold text-gray-800"
              >
                Enter Your Phone
              </Label>

              <input
                id="phone"
                type="tel"
                inputMode="numeric"
                placeholder="Enter your phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                disabled={loading}
                className="mt-2 w-full border border-gray-400 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[#574f87] focus:border-[#574f87] disabled:bg-gray-100"
              />
            </div>

            {/* PASSWORD */}
            <div className="mb-3">
              <Label
                htmlFor="password"
                className="font-semibold text-gray-800"
              >
                Enter Your Password
              </Label>

              <div className="relative mt-2">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full border border-gray-400 rounded-lg px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-[#574f87] focus:border-[#574f87] disabled:bg-gray-100"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((previous) => !previous)
                  }
                  disabled={loading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800"
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>
            </div>

            {/* ERROR */}
            {error && (
              <p className="text-red-500 text-sm text-center mt-3">
                {error}
              </p>
            )}

            {/* CONTINUE */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 mt-7 text-white shadow-md"
              style={{
                backgroundColor: "#574f87",
                fontFamily: '"Archivo Black", sans-serif',
              }}
            >
              {loading ? "Please wait..." : "Continue"}
            </Button>

            {/* OR */}
            <div className="flex items-center gap-3 my-6">
              <div className="h-px bg-gray-300 flex-1" />

              <span className="text-gray-500 text-sm font-sans">
                OR
              </span>

              <div className="h-px bg-gray-300 flex-1" />
            </div>

            {/* GOOGLE LOGIN */}
            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full h-12 border border-gray-400 shadow-sm"
            >
              <FcGoogle size={20} />

              <span className="font-semibold">
                Continue with Google
              </span>
            </Button>

            {/* SIGN UP */}
            <div className="text-center mt-6 font-sans text-sm text-gray-600">
              Don&apos;t have an account?{" "}

              <Link
                href="/sign-up"
                className="text-indigo-600 font-semibold hover:underline"
              >
                Sign Up
              </Link>
            </div>
          </form>
        ) : (
          /* ======================================
              OTP FORM
          ====================================== */
          <form
            onSubmit={handleVerifyOtp}
            className="px-8 py-6"
          >
            <div className="mb-4">
              <Label
                htmlFor="otp"
                className="font-semibold text-gray-800"
              >
                Enter 6 Digit OTP
              </Label>

              <input
                id="otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) =>
                  setOtp(
                    e.target.value.replace(/\D/g, "")
                  )
                }
                required
                disabled={loading}
                className="mt-2 w-full border border-gray-400 rounded-lg px-4 py-3 text-center text-xl tracking-[0.5em] outline-none focus:ring-2 focus:ring-[#574f87] focus:border-[#574f87] disabled:bg-gray-100"
              />
            </div>

            {/* SUCCESS MESSAGE */}
            {message && (
              <p className="text-green-600 text-sm text-center mt-3">
                {message}
              </p>
            )}

            {/* ERROR MESSAGE */}
            {error && (
              <p className="text-red-500 text-sm text-center mt-3">
                {error}
              </p>
            )}

            {/* VERIFY OTP */}
            <Button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full h-12 mt-6 text-white shadow-md"
              style={{
                backgroundColor: "#574f87",
                fontFamily: '"Archivo Black", sans-serif',
              }}
            >
              {loading
                ? "Verifying..."
                : "Verify OTP & Log In"}
            </Button>

            {/* RESEND OTP */}
            <button
              type="button"
              disabled={loading}
              onClick={handleResendOtp}
              className="w-full text-center mt-4 text-indigo-600 font-semibold hover:underline disabled:text-gray-400"
            >
              Resend OTP
            </button>

            {/* CHANGE PHONE */}
            <button
              type="button"
              disabled={loading}
              onClick={handleBackToLogin}
              className="w-full text-center mt-3 text-gray-600 hover:underline disabled:text-gray-400"
            >
              Change Phone Number
            </button>
          </form>
        )}
      </div>
    </div>
  );
}