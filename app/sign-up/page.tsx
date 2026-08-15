"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

export default function SignUpPage() {
  const [username, setUsername] = useState("");
   const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/sign-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, phone, password }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.message || "Something went wrong");
        return;
      }

      // route to a verify-code page, passing username so it knows who to verify
      router.push(`/verify/${username}`);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen w-full bg-gray-100 flex flex-col items-center justify-center px-4 py-8"
      style={{ fontFamily: '"Archivo Black", sans-serif' }}
    >
      <div className="text-center mb-6">
        <span
          className="font-bold text-4xl"
          style={{
            fontFamily: '"Archivo Black", sans-serif',
            color: "#574f87",
          }}
        >
          Kisan Inter College
        </span>
      </div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="px-8 pt-8 text-center">
          <h1 className="font-bold text-3xl text-gray-900">Create Account</h1>

          <div
            className="mt-3 text-indigo-800 text-sm font-sans"
            style={{ fontFamily: '"Archivo Black", sans-serif' }}
          >
            <p>Sign up for KIC</p>
            <p>and manage your School account with ease.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-8 py-6">
          <div className="mb-5">
            <Label htmlFor="username" className="font-semibold text-gray-800">
              Username
            </Label>
            <input
              id="username"
              type="text"
              placeholder="Choose a username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="mt-2 w-full border border-gray-400 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[#574f87] focus:border-[#574f87]"
            />
          </div>

          <div className="mb-5">
  <Label htmlFor="phone" className="font-semibold text-gray-800">
    Phone Number
  </Label>
  <input
    id="phone"
    type="text"
    placeholder="Enter your phone number"
    value={phone}
    onChange={(e) => setPhone(e.target.value)}
    required
    className="mt-2 w-full border border-gray-400 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[#574f87] focus:border-[#574f87]"
  />
</div>

          <div className="mb-5">
            <Label htmlFor="email" className="font-semibold text-gray-800">
              Email
            </Label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-2 w-full border border-gray-400 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[#574f87] focus:border-[#574f87]"
            />
          </div>

          <div className="mb-3">
            <Label htmlFor="password" className="font-semibold text-gray-800">
              Password
            </Label>

            <div className="relative mt-2">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full border border-gray-400 rounded-lg px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-[#574f87] focus:border-[#574f87]"
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center mt-3">{error}</p>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 mt-7 text-white shadow-md"
            style={{
              backgroundColor: "#574f87",
              fontFamily: '"Archivo Black", sans-serif',
            }}
          >
            {loading ? "Creating account..." : "Sign Up"}
          </Button>

          <div className="text-center mt-6 font-sans text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              href="/sign-in"
              className="text-indigo-600 font-semibold hover:underline"
            >
              Log In
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}