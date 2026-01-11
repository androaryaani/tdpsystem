"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import { Loader2, Briefcase, Users, LayoutGrid, AlertTriangle, LogOut, Mail, Phone } from "lucide-react";

export default function FacultyDashboard() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [faculty, setFaculty] = useState<any>(null);
    const [batches, setBatches] = useState<any[]>([]);
    // Map batch_id -> Array of Students
    const [batchStudents, setBatchStudents] = useState<Record<string, any[]>>({});
    const [error, setError] = useState("");

    // Toggle for Collapsible Batch View
    const [expandedBatch, setExpandedBatch] = useState<string | null>(null);

    const toggleBatch = (batchId: string) => {
        setExpandedBatch(expandedBatch === batchId ? null : batchId);
    };

    useEffect(() => {
        const fetchData = async () => {
            const mobile = localStorage.getItem("user_mobile");
            if (!mobile) {
                router.push("/login");
                return;
            }

            try {
                // 1. Get Faculty Details
                const { data: facultyData, error: fError } = await supabase
                    .from("faculty")
                    .select("*")
                    .eq("mobile_number", mobile)
                    .single();
                if (fError) throw fError;
                setFaculty(facultyData);

                // 2. Get Batches for this Faculty
                const { data: batchesData, error: bError } = await supabase
                    .from("batches")
                    .select("*")
                    .eq("faculty_id", facultyData.faculty_id);

                if (bError) throw bError;
                setBatches(batchesData || []);

                // 3. For each batch, get Student Mappings and Student Details
                const studentsMap: Record<string, any[]> = {};

                if (batchesData && batchesData.length > 0) {
                    for (const batch of batchesData) {
                        const { data: mappingData } = await supabase
                            .from("student_batch_mapping")
                            .select("student_id")
                            .eq("batch_id", batch.batch_id);

                        if (mappingData && mappingData.length > 0) {
                            const ids = mappingData.map((m: any) => m.student_id);
                            const { data: studentsData } = await supabase
                                .from("students")
                                .select("*") // Fetching full details as requested
                                .in("student_id", ids);

                            studentsMap[batch.batch_id] = studentsData || [];
                        } else {
                            studentsMap[batch.batch_id] = [];
                        }
                    }
                }
                setBatchStudents(studentsMap);

            } catch (err: any) {
                console.error("Error fetching faculty data:", err);
                // setError("Failed to load dashboard. " + err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [router]);

    const handleLogout = () => {
        localStorage.clear();
        router.push("/login");
    };

    // ... (Loading/Error states) ...

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-12">
            <div className="mx-auto max-w-7xl space-y-8">

                {/* Header */}
                <div className="rounded-2xl bg-white p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-6">
                        <div className="bg-gray-50 p-2 rounded-xl hidden md:block">
                            <Image src="/logo.png" alt="VGU Logo" width={70} height={70} className="h-16 w-auto object-contain" />
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="h-16 w-16 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 text-2xl font-bold shrink-0">
                                {faculty?.faculty_name?.charAt(0)}
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">{faculty?.faculty_name}</h1>
                                <p className="text-gray-500">{faculty?.designation} • {faculty?.branch}</p>

                                {/* Updated Contact Info Section */}
                                <div className="flex flex-col gap-1 mt-2">
                                    <div className="flex gap-4 text-xs font-mono text-gray-400">
                                        <span>ID: {faculty?.faculty_id}</span>
                                        <span>EMP: {faculty?.employee_number}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                        <span className="flex items-center gap-1.5">
                                            <Mail className="h-3.5 w-3.5 text-gray-400" />
                                            {faculty?.email}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <Phone className="h-3.5 w-3.5 text-gray-400" />
                                            {faculty?.mobile_number}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3 bg-green-50 px-4 py-2 rounded-full border border-green-100">
                            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                            <span className="text-sm font-medium text-green-700">{faculty?.status || 'Active'}</span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium text-sm"
                        >
                            <LogOut className="h-4 w-4" />
                            Logout
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-gray-500 font-medium">My Batches</h3>
                            <LayoutGrid className="h-5 w-5 text-blue-500" />
                        </div>
                        <p className="text-3xl font-bold text-gray-900">{faculty?.total_batches}</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-gray-500 font-medium">Total Students</h3>
                            <Users className="h-5 w-5 text-purple-500" />
                        </div>
                        <p className="text-3xl font-bold text-gray-900">{faculty?.total_students}</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-gray-500 font-medium">Department</h3>
                            <Briefcase className="h-5 w-5 text-gray-400" />
                        </div>
                        <p className="text-lg font-bold text-gray-900 truncate">{faculty?.branch}</p>
                    </div>
                </div>

                {/* Batches & Students List */}
                <h2 className="text-xl font-bold text-gray-900">My Assigned Batches</h2>
                <div className="space-y-4">
                    {batches.map((batch) => (
                        <div key={batch.batch_id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">

                            {/* Batch Header / Toggle */}
                            <div
                                onClick={() => toggleBatch(batch.batch_id)}
                                className="p-6 cursor-pointer hover:bg-gray-50 transition-colors flex items-center justify-between"
                            >
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-lg font-bold text-gray-900">Batch {batch.batch_number || batch.batch_id}</h3>
                                        <span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600 font-medium">
                                            {batch.academic_year}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1">ID: {batch.batch_id}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-gray-900">{batch.total_students}</p>
                                        <p className="text-xs text-gray-500">Students</p>
                                    </div>
                                    <div className={`transform transition-transform ${expandedBatch === batch.batch_id ? 'rotate-180' : ''}`}>
                                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                    </div>
                                </div>
                            </div>

                            {/* Batch Students Table (Collapsible) */}
                            {expandedBatch === batch.batch_id && (
                                <div className="border-t border-gray-100">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-gray-50/50 text-gray-500 uppercase tracking-wider text-xs">
                                                <tr>
                                                    <th className="px-6 py-3">Student Name</th>
                                                    <th className="px-6 py-3">Enrollment</th>
                                                    <th className="px-6 py-3">Student ID</th>
                                                    <th className="px-6 py-3">Branch</th>
                                                    <th className="px-6 py-3">Contact</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {batchStudents[batch.batch_id]?.map((student) => (
                                                    <tr key={student.student_id} className="hover:bg-gray-50/50">
                                                        <td className="px-6 py-4 font-medium text-gray-900">{student.student_name}</td>
                                                        <td className="px-6 py-4 text-gray-600">{student.enrollment_number}</td>
                                                        <td className="px-6 py-4 font-mono text-xs text-gray-500">{student.student_id}</td>
                                                        <td className="px-6 py-4 text-gray-600">
                                                            <div>{student.programme}</div>
                                                            <div className="text-xs text-gray-400">{student.branch}</div>
                                                        </td>
                                                        <td className="px-6 py-4 text-gray-600">
                                                            <div>{student.mobile_number}</div>
                                                            <div className="text-xs text-gray-400">{student.email}</div>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {(!batchStudents[batch.batch_id] || batchStudents[batch.batch_id].length === 0) && (
                                                    <tr>
                                                        <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                                                            No students found in this batch.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                    {batches.length === 0 && (
                        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                            <p className="text-gray-500">No batches assigned to you yet.</p>
                        </div>
                    )}
                </div>

                {/* Admin Help Section */}
                <div className="mt-12 text-center pb-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-sm font-medium">
                        <AlertTriangle className="h-4 w-4" />
                        <span>Need Help? Contact Admin</span>
                    </div>
                    <p className="mt-2 text-gray-500">
                        For any issues, please email us at <a href="mailto:vgutdp@gmail.com" className="font-semibold text-blue-600 hover:text-blue-700 hover:underline">vgutdp@gmail.com</a>
                    </p>
                </div>
            </div>
        </div>
    );
}
