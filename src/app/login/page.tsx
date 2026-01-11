
"use client";

import { useState, useEffect, useCallback, useMemo, memo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import { GraduationCap, Users, ShieldCheck, Phone, Lock, ArrowRight, Loader2, AlertCircle, ArrowLeft } from "lucide-react";

type Role = "student" | "faculty" | "admin";

// Password constants outside component to prevent re-creation
const PASSWORDS = {
    student: "vgutdparyaanistu",
    faculty: "vgutdparyaanifac",
    admin: "vgutdparyaaniadmin"
} as const;

function LoginPage() {
    const router = useRouter();
    const [role, setRole] = useState<Role>("student");
    const [mobile, setMobile] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Memoized login handler to prevent re-creation on every render
    const handleLogin = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        e.stopPropagation();

        setLoading(true);
        setError("");

        try {
            // 1. Password Verification
            if (password !== PASSWORDS[role]) {
                throw new Error(`Invalid password for ${role.charAt(0).toUpperCase() + role.slice(1)}.`);
            }

            // 2. User Verification (Check if mobile exists in DB)
            if (role === "student") {
                const { data, error: dbError } = await supabase
                    .from("students")
                    .select("mobile_number, student_name")
                    .eq("mobile_number", mobile)
                    .single();

                if (dbError || !data) {
                    if (dbError?.code === 'PGRST116') {
                        throw new Error("Mobile number not found in Student records.");
                    } else {
                        console.error("DB Error:", dbError);
                        throw new Error("Database connection error or user not found.");
                    }
                }
            } else if (role === "faculty") {
                const { data, error: dbError } = await supabase
                    .from("faculty")
                    .select("mobile_number, faculty_name")
                    .eq("mobile_number", mobile)
                    .single();

                if (dbError || !data) {
                    if (dbError?.code === 'PGRST116') {
                        throw new Error("Mobile number not found in Faculty records.");
                    } else {
                        console.error("DB Error:", dbError);
                        throw new Error("Database connection error or user not found.");
                    }
                }
            }

            // 3. Success - Set Session
            localStorage.setItem("user_role", role);
            localStorage.setItem("user_mobile", mobile);

            // 4. Redirect
            router.push(`/dashboard/${role}`);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [role, mobile, password, router]);

    // Memoized role change handlers
    const handleRoleChange = useCallback((newRole: Role) => {
        setRole(newRole);
        setError(""); // Clear error when changing role
    }, []);

    // Memoized input change handlers
    const handleMobileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setMobile(e.target.value);
    }, []);

    const handlePasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
    }, []);

    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-gray-50 p-4 dark:bg-black relative">
            <Link
                href="/"
                className="absolute top-6 left-6 flex items-center gap-2 text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors font-medium"
            >
                <ArrowLeft className="h-4 w-4" /> Back to Home
            </Link>
            <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800">

                {/* Header Section */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-center text-white">
                    <div className="flex justify-center mb-4">
                        <div className="bg-white p-2 rounded-xl shadow-lg">
                            <Image src="/logo.png" alt="VGU Logo" width={120} height={60} className="h-12 w-auto object-contain" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">VGU-TDP</h1>
                </div>

                {/* Role Selection Tabs */}
                <div className="flex border-b border-gray-100 dark:border-zinc-800">
                    <button
                        type="button"
                        onClick={() => handleRoleChange("student")}
                        className={`flex-1 flex flex-col items-center gap-2 py-4 text-sm font-medium transition-colors ${role === "student"
                            ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50 dark:bg-blue-900/10"
                            : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            }`}
                    >
                        <GraduationCap className="h-5 w-5" />
                        Student
                    </button>
                    <button
                        type="button"
                        onClick={() => handleRoleChange("faculty")}
                        className={`flex-1 flex flex-col items-center gap-2 py-4 text-sm font-medium transition-colors ${role === "faculty"
                            ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50 dark:bg-blue-900/10"
                            : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            }`}
                    >
                        <Users className="h-5 w-5" />
                        Faculty
                    </button>
                    <button
                        type="button"
                        onClick={() => handleRoleChange("admin")}
                        className={`flex-1 flex flex-col items-center gap-2 py-4 text-sm font-medium transition-colors ${role === "admin"
                            ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50 dark:bg-blue-900/10"
                            : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            }`}
                    >
                        <ShieldCheck className="h-5 w-5" />
                        Admin
                    </button>
                </div>

                {/* Login Form */}
                <div className="p-8">
                    <form onSubmit={handleLogin} className="space-y-6">

                        {/* Mobile Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Mobile Number
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Phone className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="tel"
                                    required
                                    value={mobile}
                                    onChange={handleMobileChange}
                                    className="block w-full rounded-lg border border-gray-300 bg-gray-50 pl-10 p-2.5 text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 transition-all font-mono"
                                    placeholder="Enter 10-digit number"
                                    autoComplete="tel"
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Passcode
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={handlePasswordChange}
                                    className="block w-full rounded-lg border border-gray-300 bg-gray-50 pl-10 p-2.5 text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 transition-all"
                                    placeholder="Enter passcode"
                                    autoComplete="current-password"
                                />
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="flex items-center gap-2 rounded-lg bg-red-50 p-4 text-sm text-red-800 dark:bg-red-900/30 dark:text-red-300 animate-pulse">
                                <AlertCircle className="h-4 w-4 shrink-0" />
                                <p>{error}</p>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative flex w-full justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Verifying...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    Access Dashboard
                                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </span>
                            )}
                        </button>
                    </form>
                </div>

                {/* Help Footer */}
                <div className="bg-gray-50 border-t border-gray-100 p-4 text-center dark:bg-zinc-900 dark:border-zinc-800">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Need help logging in? <a href="mailto:vgutdp@gmail.com" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">Contact Support</a>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;
