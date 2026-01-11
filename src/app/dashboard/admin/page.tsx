"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import { ShieldCheck, Users, GraduationCap, Server, LogOut, LayoutGrid, FileText, Activity, UserX, UserCheck } from "lucide-react";

import StudentManagement from "./components/StudentManagement";
import FacultyManagement from "./components/FacultyManagement";
import BatchManagement from "./components/BatchManagement";
import SystemLogs from "./components/SystemLogs";

export default function AdminDashboard() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<"overview" | "students" | "faculty" | "batches" | "logs" | "about">("overview");

    // Stats State
    const [stats, setStats] = useState({
        studentCount: 0,
        facultyCount: 0,
        batchCount: 0
    });

    const [statusStats, setStatusStats] = useState({
        students: { active: 0, inactive: 0 },
        faculty: { active: 0, inactive: 0 },
        batches: { active: 0, inactive: 0 }
    });

    useEffect(() => {
        // 1. Auth Check
        const mobile = localStorage.getItem("user_mobile");
        if (!mobile) {
            router.push("/login"); // Redirect if not logged in
            return;
        }

        const fetchCounts = async () => {
            // General Counts
            const { count: sCount } = await supabase.from('students').select('*', { count: 'exact', head: true });
            const { count: fCount } = await supabase.from('faculty').select('*', { count: 'exact', head: true });
            const { count: bCount } = await supabase.from('batches').select('*', { count: 'exact', head: true });

            setStats({
                studentCount: sCount || 0,
                facultyCount: fCount || 0,
                batchCount: bCount || 0
            });

            // Status Breakdown
            const fetchStatusCount = async (table: string, status: string) => {
                const { count } = await supabase.from(table).select('*', { count: 'exact', head: true }).eq('status', status);
                return count || 0;
            };

            const [sActive, sInactive] = await Promise.all([fetchStatusCount('students', 'Active'), fetchStatusCount('students', 'Inactive')]);
            const [fActive, fInactive] = await Promise.all([fetchStatusCount('faculty', 'Active'), fetchStatusCount('faculty', 'Inactive')]);
            const [bActive, bInactive] = await Promise.all([fetchStatusCount('batches', 'Active'), fetchStatusCount('batches', 'Inactive')]);

            setStatusStats({
                students: { active: sActive, inactive: sInactive },
                faculty: { active: fActive, inactive: fInactive },
                batches: { active: bActive, inactive: bInactive }
            });
        };

        if (activeTab === 'overview') {
            fetchCounts();
            // Removed auto-refresh interval to prevent unnecessary re-renders
        }
    }, [activeTab, router]);

    const handleLogout = () => {
        localStorage.clear();
        router.push("/login");
    };

    const StatusCard = ({ title, active, inactive, icon: Icon, colorClass, bgClass, total }: any) => {
        const activePercent = total > 0 ? (active / total) * 100 : 0;

        return (
            <div className={`p-6 rounded-xl border border-gray-700 bg-gray-800 flex flex-col justify-between ${bgClass}`}>
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h4 className="text-gray-400 font-medium text-sm uppercase">{title} Status</h4>
                        <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-2xl font-bold text-white">{active}</span>
                            <span className="text-xs text-green-400">Active</span>
                        </div>
                    </div>
                    <div className={`p-2 rounded-lg ${colorClass} bg-opacity-20`}>
                        <Icon className={`h-5 w-5 ${colorClass.replace('bg-', 'text-')}`} />
                    </div>
                </div>

                <div className="space-y-3">
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden flex">
                        <div className="bg-green-500 h-full" style={{ width: `${activePercent}%` }}></div>
                        <div className="bg-red-500 h-full" style={{ width: `${100 - activePercent}%` }}></div>
                    </div>

                    <div className="flex justify-between text-xs font-medium">
                        <div className="text-gray-400">
                            <span className="text-red-400">{inactive}</span> Inactive
                        </div>
                        <div className="text-gray-500">
                            Total: <span className="text-white">{total}</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col">
            {/* Navbar */}
            <header className="bg-gray-800 border-b border-gray-700 p-4 sticky top-0 z-50">
                <div className="mx-auto max-w-7xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-white p-1 rounded-lg">
                            <Image src="/logo.png" alt="VGU Logo" width={40} height={40} className="h-8 w-auto object-contain" />
                        </div>
                        <h1 className="text-xl font-bold">Admin Console</h1>
                    </div>
                    <div className="flex items-center gap-6">
                        <nav className="hidden md:flex gap-1">
                            {[
                                { id: 'overview', label: 'Home' },
                                { id: 'students', label: 'Students' },
                                { id: 'faculty', label: 'Faculty' },
                                { id: 'batches', label: 'Batches' },
                                { id: 'logs', label: 'Logs' },
                                { id: 'about', label: 'About Me' }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id
                                        ? 'bg-blue-600 text-white'
                                        : 'text-gray-400 hover:text-white hover:bg-gray-700'
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-3 py-1.5 bg-red-900/30 text-red-400 rounded hover:bg-red-900/50 transition-colors text-sm border border-red-900/50"
                        >
                            <LogOut className="h-4 w-4" />
                            <span className="hidden md:inline">Logout</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Tab Nav (Visible only on small screens) */}
            <div className="md:hidden bg-gray-800 border-b border-gray-700 overflow-x-auto">
                <div className="flex p-2 gap-2 min-w-max">
                    {[
                        { id: 'overview', label: 'Home' },
                        { id: 'students', label: 'Students' },
                        { id: 'faculty', label: 'Faculty' },
                        { id: 'batches', label: 'Batches' },
                        { id: 'logs', label: 'Logs' },
                        { id: 'about', label: 'About' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${activeTab === tab.id
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-400 hover:text-white hover:bg-gray-700'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                <div className="mx-auto max-w-7xl">
                    {activeTab === 'overview' && (
                        <div className="space-y-8">
                            {/* KPI Cards */}
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                                <div onClick={() => setActiveTab('students')} className="cursor-pointer rounded-xl bg-gray-800 p-6 border border-gray-700 hover:border-blue-500/50 transition-colors">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-gray-400 font-medium">Students</h3>
                                        <GraduationCap className="h-6 w-6 text-blue-400" />
                                    </div>
                                    <p className="text-4xl font-bold text-white mb-2">{stats.studentCount}</p>
                                    <p className="text-xs text-blue-400">Total Registered</p>
                                </div>

                                <div onClick={() => setActiveTab('faculty')} className="cursor-pointer rounded-xl bg-gray-800 p-6 border border-gray-700 hover:border-purple-500/50 transition-colors">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-gray-400 font-medium">Faculty</h3>
                                        <Users className="h-6 w-6 text-purple-400" />
                                    </div>
                                    <p className="text-4xl font-bold text-white mb-2">{stats.facultyCount}</p>
                                    <p className="text-xs text-purple-400">Active Staff</p>
                                </div>

                                <div onClick={() => setActiveTab('batches')} className="cursor-pointer rounded-xl bg-gray-800 p-6 border border-gray-700 hover:border-emerald-500/50 transition-colors">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-gray-400 font-medium">Batches</h3>
                                        <LayoutGrid className="h-6 w-6 text-emerald-400" />
                                    </div>
                                    <p className="text-4xl font-bold text-white mb-2">{stats.batchCount}</p>
                                    <p className="text-xs text-emerald-400">Active Classes</p>
                                </div>

                                <div onClick={() => setActiveTab('logs')} className="cursor-pointer rounded-xl bg-gray-800 p-6 border border-gray-700 hover:border-orange-500/50 transition-colors">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-gray-400 font-medium">System Logs</h3>
                                        <FileText className="h-6 w-6 text-orange-400" />
                                    </div>
                                    <p className="text-xl font-bold text-orange-400 mb-2">View Activity</p>
                                    <p className="text-sm text-gray-500">Track Changes</p>
                                </div>
                            </div>

                            {/* Status Breakdown Section */}
                            <div>
                                <h3 className="text-xl font-bold text-white mb-4">System Health & Status</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <StatusCard
                                        title="Students"
                                        active={statusStats.students.active}
                                        inactive={statusStats.students.inactive}
                                        total={stats.studentCount}
                                        icon={UserCheck}
                                        colorClass="text-blue-400"
                                        bgClass="hover:border-blue-500/30 transition-colors"
                                    />
                                    <StatusCard
                                        title="Faculty"
                                        active={statusStats.faculty.active}
                                        inactive={statusStats.faculty.inactive}
                                        total={stats.facultyCount}
                                        icon={Users}
                                        colorClass="text-purple-400"
                                        bgClass="hover:border-purple-500/30 transition-colors"
                                    />
                                    <StatusCard
                                        title="Batches"
                                        active={statusStats.batches.active}
                                        inactive={statusStats.batches.inactive}
                                        total={stats.batchCount}
                                        icon={LayoutGrid}
                                        colorClass="text-emerald-400"
                                        bgClass="hover:border-emerald-500/30 transition-colors"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'students' && <StudentManagement />}
                    {activeTab === 'faculty' && <FacultyManagement />}
                    {activeTab === 'batches' && <BatchManagement />}
                    {activeTab === 'logs' && <SystemLogs />}

                    {activeTab === 'about' && (
                        <div className="flex flex-col items-center justify-center h-[60vh] gap-6">
                            <div className="bg-white p-6 rounded-3xl shadow-2xl shadow-blue-500/20">
                                <Image src="/logo.png" alt="VGU Logo" width={300} height={150} className="h-32 w-auto object-contain" />
                            </div>
                            <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-emerald-400 animate-pulse">
                                VGU-TDP
                            </h1>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
