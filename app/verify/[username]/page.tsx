"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function VerifyPage() {
    const { username } = useParams();
    const router = useRouter();

    const [code, setCode] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/verifyCode", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, code }),
            });

            const data = await res.json();

            if (!data.success) {
                setError(data.message || "Verification failed");
                return;
            }

            router.push("/sign-in");
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
            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="px-8 pt-8 text-center">
                    <h1 className="font-bold text-3xl text-gray-900">Verify Your Account</h1>
                    <p className="mt-3 text-indigo-800 text-sm">
                        Enter the code sent to your email
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="px-8 py-6">
                    <div className="mb-5">
                        <Label htmlFor="code" className="font-semibold text-gray-800">
                            Verification Code
                        </Label>
                        <input
                            id="code"
                            type="text"
                            placeholder="Enter 6-digit code"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            required
                            maxLength={6}
                            className="mt-2 w-full border border-gray-400 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[#574f87] focus:border-[#574f87] text-center text-lg tracking-widest"
                        />
                    </div>

                    {error && (
                        <p className="text-red-500 text-sm text-center mt-3">{error}</p>
                    )}

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full h-12 mt-4 text-white shadow-md"
                        style={{ backgroundColor: "#574f87" }}
                    >
                        {loading ? "Verifying..." : "Verify Account"}
                    </Button>
                </form>
            </div>
        </div>
    );
}