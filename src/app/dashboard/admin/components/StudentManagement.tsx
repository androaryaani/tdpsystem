"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Search, Plus, Trash2, Edit, Download, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { logActivity } from "@/lib/logger";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";

export default function StudentManagement() {
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [view, setView] = useState<"list" | "form">("list");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);

    // Delete Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [studentToDelete, setStudentToDelete] = useState<any>(null);

    const [formData, setFormData] = useState({
        student_id: "",
        student_name: "",
        enrollment_number: "",
        email: "",
        mobile_number: "",
        programme: "B.Tech",
        branch: "CSE",
        academic_year: "2023-2027",
        status: "Active"
    });

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        setLoading(true);
        const { data } = await supabase
            .from("students")
            .select("*")
            .order("created_date", { ascending: false });
        if (data) setStudents(data);
        setLoading(false);
    };

    const handleSave = async () => {
        if (!editingId) {
            const { data: existing } = await supabase
                .from("students")
                .select("student_id")
                .or(`email.eq.${formData.email},mobile_number.eq.${formData.mobile_number}`);

            if (existing && existing.length > 0) {
                alert("Student with this Email or Mobile already exists!");
                return;
            }
        }

        try {
            if (editingId) {
                const { error } = await supabase
                    .from("students")
                    .update(formData)
                    .eq("student_id", editingId);
                if (error) throw error;
                await logActivity("UPDATE", "STUDENT", editingId, `Updated student: ${formData.student_name}`);
            } else {
                const payload = {
                    ...formData,
                    student_id: formData.student_id || `STU${Math.floor(Math.random() * 10000)}`
                };
                const { error } = await supabase.from("students").insert([payload]);
                if (error) throw error;
                await logActivity("CREATE", "STUDENT", payload.student_id, `Created student: ${payload.student_name}`);
            }
            setView("list");
            setEditingId(null);
            setFormData({
                student_id: "",
                student_name: "",
                enrollment_number: "",
                email: "",
                mobile_number: "",
                programme: "B.Tech",
                branch: "CSE",
                academic_year: "2023-2027",
                status: "Active"
            });
            fetchStudents();
        } catch (err: any) {
            alert("Error saving: " + err.message);
        }
    };

    const initiateDelete = (student: any) => {
        setStudentToDelete(student);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!studentToDelete) return;
        const { error } = await supabase.from("students").delete().eq("student_id", studentToDelete.student_id);
        if (error) {
            alert("Error deleting: " + error.message);
        } else {
            await logActivity("DELETE", "STUDENT", studentToDelete.student_id, `Deleted student: ${studentToDelete.student_name} (${studentToDelete.enrollment_number})`);
            fetchStudents();
        }
    };

    const handleEdit = (student: any) => {
        setFormData(student);
        setEditingId(student.student_id);
        setView("form");
    };

    const toggleStatus = async (student: any) => {
        const newStatus = student.status === "Active" ? "Inactive" : "Active";
        const { error } = await supabase
            .from("students")
            .update({ status: newStatus })
            .eq("student_id", student.student_id);
        if (error) alert("Error updating status");
        else {
            await logActivity("UPDATE", "STUDENT", student.student_id, `Changed status to ${newStatus}`);
            fetchStudents();
        }
    };

    // Sorting Logic
    const handleSort = (key: string) => {
        let direction: "asc" | "desc" = "asc";
        if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
            direction = "desc";
        }
        setSortConfig({ key, direction });
    };

    const filteredStudents = useMemo(() => {
        let result = [...students];

        if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            result = result.filter(s =>
                s.student_name?.toLowerCase().includes(lower) ||
                s.email?.toLowerCase().includes(lower) ||
                s.enrollment_number?.toLowerCase().includes(lower) ||
                s.branch?.toLowerCase().includes(lower) ||
                s.mobile_number?.includes(lower)
            );
        }

        if (sortConfig) {
            result.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === "asc" ? -1 : 1;
                if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === "asc" ? 1 : -1;
                return 0;
            });
        }
        return result;
    }, [students, searchTerm, sortConfig]);

    const SortIcon = ({ columnKey }: { columnKey: string }) => {
        if (sortConfig?.key !== columnKey) return <ArrowUpDown className="h-4 w-4 text-gray-600 opacity-50" />;
        return sortConfig.direction === 'asc'
            ? <ArrowUp className="h-4 w-4 text-blue-400" />
            : <ArrowDown className="h-4 w-4 text-blue-400" />;
    };

    // Download CSV Logic
    const downloadCSV = () => {
        if (filteredStudents.length === 0) {
            alert("No data to download.");
            return;
        }

        const headers = ["Student ID", "Name", "Enrollment", "Email", "Mobile", "Branch", "Year", "Status"];
        const rows = filteredStudents.map(s => [
            s.student_id,
            s.student_name,
            s.enrollment_number,
            s.email,
            s.mobile_number,
            s.branch,
            s.academic_year,
            s.status
        ]);

        const csvContent = [
            headers.join(","),
            ...rows.map(row => row.map(cell => `"${(cell || "").toString().replace(/"/g, '""')}"`).join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `students_export_${new Date().toISOString().slice(0, 10)}.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Student Management</h2>
                {view === "list" && (
                    <button
                        onClick={() => {
                            setEditingId(null);
                            setFormData({
                                student_id: "",
                                student_name: "",
                                enrollment_number: "",
                                email: "",
                                mobile_number: "",
                                programme: "B.Tech",
                                branch: "CSE",
                                academic_year: "2023-2027",
                                status: "Active"
                            });
                            setView("form");
                        }}
                        className="flex items-center gap-2 bg-blue-600 px-4 py-2 rounded-lg text-white hover:bg-blue-700"
                    >
                        <Plus className="h-4 w-4" /> Add Student
                    </button>
                )}
            </div>

            {view === "list" ? (
                <>
                    <div className="flex gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by Name, Email, Enrollment..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full rounded-xl bg-gray-800 border-gray-700 p-2.5 pl-10 text-white focus:ring-blue-500"
                            />
                        </div>
                        <button
                            onClick={downloadCSV}
                            className="flex items-center gap-2 bg-gray-700 px-4 py-2 rounded-xl text-white hover:bg-gray-600 border border-gray-600"
                            title="Download current view as CSV"
                        >
                            <Download className="h-4 w-4" /> <span className="hidden sm:inline">Export CSV</span>
                        </button>
                    </div>

                    <div className="rounded-xl border border-gray-700 bg-gray-800 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-gray-400">
                                <thead className="bg-gray-900 text-gray-200 uppercase">
                                    <tr>
                                        <th className="px-6 py-3 cursor-pointer hover:bg-gray-800" onClick={() => handleSort('student_id')}>
                                            <div className="flex items-center gap-2">ID <SortIcon columnKey="student_id" /></div>
                                        </th>
                                        <th className="px-6 py-3 cursor-pointer hover:bg-gray-800" onClick={() => handleSort('student_name')}>
                                            <div className="flex items-center gap-2">Name <SortIcon columnKey="student_name" /></div>
                                        </th>
                                        <th className="px-6 py-3 cursor-pointer hover:bg-gray-800" onClick={() => handleSort('enrollment_number')}>
                                            <div className="flex items-center gap-2">Enrollment <SortIcon columnKey="enrollment_number" /></div>
                                        </th>
                                        <th className="px-6 py-3 cursor-pointer hover:bg-gray-800" onClick={() => handleSort('email')}>
                                            <div className="flex items-center gap-2">Contact <SortIcon columnKey="email" /></div>
                                        </th>
                                        <th className="px-6 py-3 cursor-pointer hover:bg-gray-800" onClick={() => handleSort('status')}>
                                            <div className="flex items-center gap-2">Status <SortIcon columnKey="status" /></div>
                                        </th>
                                        <th className="px-6 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700">
                                    {loading ? (
                                        <tr><td colSpan={6} className="p-8 text-center">Loading...</td></tr>
                                    ) : filteredStudents.map((student) => (
                                        <tr key={student.student_id} className="hover:bg-gray-750">
                                            <td className="px-6 py-4 font-mono text-xs text-gray-500">{student.student_id}</td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-white">{student.student_name}</div>
                                                <div className="text-xs">{student.branch} • {student.academic_year}</div>
                                            </td>
                                            <td className="px-6 py-4">{student.enrollment_number}</td>
                                            <td className="px-6 py-4">
                                                <div>{student.email}</div>
                                                <div className="text-xs">{student.mobile_number}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    onClick={() => toggleStatus(student)}
                                                    className={`cursor-pointer px-2 py-1 rounded-full text-xs font-medium ${student.status === 'Active' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
                                                        }`}>
                                                    {student.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                                                <button onClick={() => handleEdit(student)} className="p-2 hover:bg-gray-700 rounded-lg text-blue-400">
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button onClick={() => initiateDelete(student)} className="p-2 hover:bg-gray-700 rounded-lg text-red-400">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            ) : (
                <div className="rounded-xl border border-gray-700 bg-gray-800 p-6 max-w-2xl mx-auto">
                    <h3 className="text-lg font-bold text-white mb-6">{editingId ? 'Edit Student' : 'New Student'}</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2 md:col-span-1">
                            <label className="block text-sm text-gray-400 mb-1">Student ID</label>
                            <input
                                className="w-full bg-gray-900 border border-gray-600 rounded-lg p-2 text-white"
                                value={formData.student_id}
                                onChange={e => setFormData({ ...formData, student_id: e.target.value })}
                                disabled={!!editingId}
                                placeholder="STU1234"
                            />
                        </div>
                        <div className="col-span-2 md:col-span-1">
                            <label className="block text-sm text-gray-400 mb-1">Name</label>
                            <input
                                className="w-full bg-gray-900 border border-gray-600 rounded-lg p-2 text-white"
                                value={formData.student_name}
                                onChange={e => setFormData({ ...formData, student_name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Email</label>
                            <input
                                className="w-full bg-gray-900 border border-gray-600 rounded-lg p-2 text-white"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Mobile</label>
                            <input
                                className="w-full bg-gray-900 border border-gray-600 rounded-lg p-2 text-white"
                                value={formData.mobile_number}
                                onChange={e => setFormData({ ...formData, mobile_number: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Branch</label>
                            <input
                                className="w-full bg-gray-900 border border-gray-600 rounded-lg p-2 text-white"
                                value={formData.branch}
                                onChange={e => setFormData({ ...formData, branch: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Year</label>
                            <input
                                className="w-full bg-gray-900 border border-gray-600 rounded-lg p-2 text-white"
                                value={formData.academic_year}
                                onChange={e => setFormData({ ...formData, academic_year: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Status</label>
                            <select
                                className="w-full bg-gray-900 border border-gray-600 rounded-lg p-2 text-white"
                                value={formData.status}
                                onChange={e => setFormData({ ...formData, status: e.target.value })}
                            >
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                        </div>
                    </div>
                    <div className="mt-8 flex gap-4">
                        <button onClick={handleSave} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">Save Student</button>
                        <button onClick={() => setView("list")} className="bg-gray-700 text-white px-6 py-2 rounded-lg hover:bg-gray-600">Cancel</button>
                    </div>
                </div>
            )}

            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Student"
                message={`This action will permanently delete ${studentToDelete?.student_name} from the system. This cannot be undone.`}
                expectedValue={studentToDelete?.mobile_number}
                expectedLabel="Student Mobile Number"
            />
        </div>
    );
}
