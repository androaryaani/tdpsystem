"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import { Loader2, User, BookOpen, Clock, AlertTriangle, LogOut } from "lucide-react";

export default function StudentDashboard() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [student, setStudent] = useState<any>(null);
    const [myFaculty, setMyFaculty] = useState<any>(null);
    const [myBatch, setMyBatch] = useState<any>(null);
    const [classmates, setClassmates] = useState<any[]>([]);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            const mobile = localStorage.getItem("user_mobile");
            if (!mobile) {
                router.push("/login");
                return;
            }

            try {
                // 1. Get Student Details
                const { data: studentData, error: sError } = await supabase
                    .from("students")
                    .select("*")
                    .eq("mobile_number", mobile)
                    .single();
                if (sError) throw sError;
                setStudent(studentData);

                // 2. Get Mapping (to find Batch & Faculty)
                const { data: mappingData, error: mError } = await supabase
                    .from("student_batch_mapping")
                    .select("batch_id, faculty_id")
                    .eq("student_id", studentData.student_id)
                    .eq("status", "Active")
                    .maybeSingle();

                if (mappingData) {
                    // 3. Get Faculty Details
                    if (mappingData.faculty_id) {
                        const { data: facultyData } = await supabase
                            .from("faculty")
                            .select("*")
                            .eq("faculty_id", mappingData.faculty_id)
                            .single();
                        setMyFaculty(facultyData);
                    }

                    // 4. Get Batch Details & Classmates
                    if (mappingData.batch_id) {
                        const { data: batchData } = await supabase
                            .from("batches")
                            .select("*")
                            .eq("batch_id", mappingData.batch_id)
                            .single();
                        setMyBatch(batchData);

                        // get other students in same batch
                        const { data: batchMapping } = await supabase
                            .from("student_batch_mapping")
                            .select("student_id")
                            .eq("batch_id", mappingData.batch_id);

                        if (batchMapping && batchMapping.length > 0) {
                            const studentIds = batchMapping.map((m: any) => m.student_id);
                            const { data: classData } = await supabase
                                .from("students")
                                .select("student_name, branch, mobile_number, email")
                                .in("student_id", studentIds);
                            setClassmates(classData || []);
                        }
                    }
                }

            } catch (err: any) {
                console.error("Error fetching data:", err);
                // Don't show error on every poll, maybe just log it?
                // setError("Failed to load dashboard data. " + err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData(); // Initial load
    }, [router]);

    const handleLogout = () => {
        localStorage.clear();
        router.push("/login"); // or root
    };

    // ... (Loading & Error states remain same) ...

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-12">
            <div className="mx-auto max-w-6xl space-y-8">
                {/* Header */}
                <div className="rounded-2xl bg-white p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="bg-gray-50 p-2 rounded-xl hidden sm:block">
                            <Image src="/logo.png" alt="VGU Logo" width={60} height={60} className="h-14 w-auto object-contain" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Student Portal</h1>
                            <p className="text-gray-500 mt-1">Welcome back, <span className="font-semibold text-blue-600">{student?.student_name}</span></p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium text-sm"
                    >
                        <LogOut className="h-4 w-4" />
                        Logout
                    </button>
                </div>

                {/* 3.1 - Student Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Personal & Academic Info */}
                    <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                            <User className="h-5 w-5 text-blue-600" />
                            <h2 className="text-lg font-semibold text-gray-900">My Information</h2>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-gray-400 uppercase">Student ID</p>
                                <p className="font-medium text-gray-900">{student?.student_id}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 uppercase">Enrollment</p>
                                <p className="font-medium text-gray-900">{student?.enrollment_number}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 uppercase">Phone</p>
                                <p className="font-medium text-gray-900">{student?.mobile_number}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 uppercase">Email</p>
                                <p className="font-medium truncate text-gray-900">{student?.email}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 uppercase">Year</p>
                                <p className="font-medium text-gray-900">{student?.academic_year}</p>
                            </div>
                        </div>
                    </div>

                    {/* Faculty Info */}
                    <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                            <BookOpen className="h-5 w-5 text-indigo-600" />
                            <h2 className="text-lg font-semibold text-gray-900">Assigned Faculty</h2>
                        </div>
                        {myFaculty ? (
                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs text-gray-400 uppercase">Faculty Name</p>
                                    <p className="text-lg font-bold text-gray-900">{myFaculty.faculty_name}</p>
                                    <p className="text-sm text-blue-600">{myFaculty.designation}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase">Phone</p>
                                        <p className="font-medium text-gray-900">{myFaculty.mobile_number}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase">Email</p>
                                        <p className="font-medium truncate text-gray-900">{myFaculty.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase">Faculty ID</p>
                                        <p className="font-mono text-sm text-gray-900">{myFaculty.faculty_id}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase">Emp ID</p>
                                        <p className="font-mono text-sm text-gray-900">{myFaculty.employee_number}</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-400">
                                No faculty assigned yet.
                            </div>
                        )}
                    </div>
                </div>

                {/* Batch Info */}
                {myBatch && (
                    <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between gap-3 mb-6 border-b border-gray-100 pb-4">
                            <div className="flex items-center gap-3">
                                <Clock className="h-5 w-5 text-emerald-600" />
                                <h2 className="text-lg font-semibold text-gray-900">My Batch Details</h2>
                            </div>
                            <div className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-sm font-medium">
                                Batch ID: {myBatch.batch_id} • Total Students: {myBatch.total_students}
                            </div>
                        </div>

                        <h3 className="text-sm font-semibold text-gray-500 mb-4 uppercase">Batch Members</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 text-gray-500">
                                    <tr>
                                        <th className="px-4 py-3 rounded-l-lg">Name</th>
                                        <th className="px-4 py-3">Branch</th>
                                        <th className="px-4 py-3">Phone</th>
                                        <th className="px-4 py-3 rounded-r-lg">Email</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {classmates.map((mate, i) => (
                                        <tr key={i} className="hover:bg-gray-50/50">
                                            <td className="px-4 py-3 font-medium text-gray-900">{mate.student_name}</td>
                                            <td className="px-4 py-3 text-gray-500">{mate.branch}</td>
                                            <td className="px-4 py-3 text-gray-500">{mate.mobile_number}</td>
                                            <td className="px-4 py-3 text-gray-500">{mate.email}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Admin Help Section */}
            <div className="mt-12 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-sm font-medium">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Need Help? Contact Admin</span>
                </div>
                <p className="mt-2 text-gray-500">
                    For any issues, please email us at <a href="mailto:vgutdp@gmail.com" className="font-semibold text-blue-600 hover:text-blue-700 hover:underline">vgutdp@gmail.com</a>
                </p>
            </div>
        </div>
    );
}
