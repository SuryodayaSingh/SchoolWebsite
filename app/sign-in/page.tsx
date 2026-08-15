"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { FcGoogle } from "react-icons/fc";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();

  // ==========================================
  // LOGIN
  // ==========================================
  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setError("");

    const cleanIdentifier = identifier.trim();

    if (!cleanIdentifier) {
      setError("Please enter your phone number");
      return;
    }

    if (!password) {
      setError("Please enter your password");
      return;
    }

    setLoading(true);

    try {
      const result = await signIn("credentials", {
        identifier: cleanIdentifier,
        password: password,
        redirect: false,
      });

      console.log("LOGIN RESULT:", result);

      if (!result) {
        setError("Unable to login. Please try again.");
        return;
      }

      if (result.error) {
        setError(
          result.error === "CredentialsSignin"
            ? "Invalid phone number or password"
            : result.error
        );
        return;
      }

      // Credentials successfully verified
      router.push("/dashboard");
      router.refresh();
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
            Welcome Back!
          </h1>

          <div className="mt-3 text-indigo-800 text-sm font-sans">
            <p>Log in to your School account</p>
            <p>
              and manage your student&apos;s information.
            </p>
          </div>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="px-8 py-6"
        >
          {/* PHONE */}
          <div className="mb-5">
            <Label
              htmlFor="identifier"
              className="font-semibold text-gray-800"
            >
              Enter Your Phone
            </Label>

            <input
              id="identifier"
              type="tel"
              inputMode="numeric"
              placeholder="Enter your phone number"
              value={identifier}
              onChange={(e) =>
                setIdentifier(e.target.value)
              }
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
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder="Enter your password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                required
                disabled={loading}
                className="w-full border border-gray-400 rounded-lg px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-[#574f87] focus:border-[#574f87] disabled:bg-gray-100"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    (previous) => !previous
                  )
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

          {/* LOGIN BUTTON */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 mt-7 text-white shadow-md"
            style={{
              backgroundColor: "#574f87",
              fontFamily:
                '"Archivo Black", sans-serif',
            }}
          >
            {loading ? "Logging in..." : "Log In"}
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
      </div>
    </div>
  );
}