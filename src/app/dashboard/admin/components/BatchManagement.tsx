"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Search, Plus, Trash2, Edit, Users, X, ArrowUpDown, ArrowUp, ArrowDown, Download } from "lucide-react";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";
import { logActivity } from "@/lib/logger";

export default function BatchManagement() {
    const [batches, setBatches] = useState<any[]>([]);
    const [facultyList, setFacultyList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<"list" | "form" | "students">("list");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [selectedBatch, setSelectedBatch] = useState<any>(null);

    // Sort & Filter
    const [searchTerm, setSearchTerm] = useState("");
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);

    // Delete Helpers
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [batchToDelete, setBatchToDelete] = useState<any>(null);

    const [formData, setFormData] = useState({
        batch_id: "",
        batch_number: "",
        faculty_id: "",
        academic_year: "2023-2024",
        status: "Active"
    });

    // Student Management Data
    const [batchStudents, setBatchStudents] = useState<any[]>([]);
    const [studentSearch, setStudentSearch] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);

    useEffect(() => {
        fetchBatches();
        fetchFaculty();
    }, []);

    const fetchBatches = async () => {
        setLoading(true);
        const { data } = await supabase
            .from("batches")
            .select(`
                *,
                faculty:faculty_id (faculty_name, email)
            `)
            .order("created_date", { ascending: false });
        if (data) setBatches(data);
        setLoading(false);
    };

    const fetchFaculty = async () => {
        const { data } = await supabase.from("faculty").select("faculty_id, faculty_name").eq("status", "Active");
        if (data) setFacultyList(data);
    };

    const handleSaveBatch = async () => {
        try {
            const payload = {
                ...formData,
                batch_id: formData.batch_id || `BATCH${Math.floor(Math.random() * 10000)}`,
                faculty_id: formData.faculty_id || null
            };

            if (editingId) {
                const { error } = await supabase
                    .from("batches")
                    .update(payload)
                    .eq("batch_id", editingId);
                if (error) throw error;
                await logActivity("UPDATE", "BATCH", editingId, `Updated batch: ${formData.batch_number}`);
            } else {
                const { error } = await supabase.from("batches").insert([payload]);
                if (error) throw error;
                await logActivity("CREATE", "BATCH", payload.batch_id, `Created batch: ${payload.batch_number}`);
            }
            setView("list");
            setEditingId(null);
            setFormData({
                batch_id: "",
                batch_number: "",
                faculty_id: "",
                academic_year: "2023-2024",
                status: "Active"
            });
            fetchBatches();
        } catch (err: any) {
            alert("Error saving batch: " + err.message);
        }
    };

    const initiateDelete = (batch: any) => {
        setBatchToDelete(batch);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!batchToDelete) return;
        const id = batchToDelete.batch_id;

        // Delete mappings first
        await supabase.from("student_batch_mapping").delete().eq("batch_id", id);

        const { error } = await supabase.from("batches").delete().eq("batch_id", id);
        if (error) alert("Error: " + error.message);
        else {
            await logActivity("DELETE", "BATCH", id, `Deleted batch: ${batchToDelete.batch_number}. Removed student mappings.`);
            fetchBatches();
        }
    };

    // --- Sort --
    const handleSort = (key: string) => {
        let direction: "asc" | "desc" = "asc";
        if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
            direction = "desc";
        }
        setSortConfig({ key, direction });
    };

    const sortedBatches = useMemo(() => {
        let sortableBatches = [...batches];

        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            sortableBatches = sortableBatches.filter(b =>
                b.batch_number?.toLowerCase().includes(lowerTerm) ||
                b.batch_id?.toLowerCase().includes(lowerTerm) ||
                b.faculty?.faculty_name?.toLowerCase().includes(lowerTerm) ||
                b.academic_year?.toLowerCase().includes(lowerTerm)
            );
        }

        if (sortConfig) {
            sortableBatches.sort((a, b) => {
                let aValue = a[sortConfig.key];
                let bValue = b[sortConfig.key];

                if (sortConfig.key === 'faculty_name') {
                    aValue = a.faculty?.faculty_name || '';
                    bValue = b.faculty?.faculty_name || '';
                }

                if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
                return 0;
            });
        }
        return sortableBatches;
    }, [batches, searchTerm, sortConfig]);

    const SortIcon = ({ columnKey }: { columnKey: string }) => {
        if (sortConfig?.key !== columnKey) return <ArrowUpDown className="h-4 w-4 text-gray-600 opacity-50" />;
        return sortConfig.direction === 'asc'
            ? <ArrowUp className="h-4 w-4 text-blue-400" />
            : <ArrowDown className="h-4 w-4 text-blue-400" />;
    };

    // Download CSV
    const downloadCSV = () => {
        if (sortedBatches.length === 0) {
            alert("No data to download.");
            return;
        }

        const headers = ["Batch ID", "Batch Name", "Faculty", "Academic Year", "Total Students", "Status"];
        const rows = sortedBatches.map(b => [
            b.batch_id,
            b.batch_number,
            b.faculty?.faculty_name || "Unassigned",
            b.academic_year,
            b.total_students || 0,
            b.status
        ]);

        const csvContent = [
            headers.join(","),
            ...rows.map(row => row.map(cell => `"${(cell || "").toString().replace(/"/g, '""')}"`).join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `batches_export_${new Date().toISOString().slice(0, 10)}.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // --- Student Assignment Logic ---

    const openStudentManager = async (batch: any) => {
        setSelectedBatch(batch);
        setView("students");
        const { data } = await supabase
            .from("student_batch_mapping")
            .select(`
                mapping_id,
                mapping_id,
                student:student_id (*)
            `)
            .eq("batch_id", batch.batch_id);

        if (data) {
            setBatchStudents(data.map((d: any) => ({ ...d.student, mapping_id: d.mapping_id })));
        }
    };

    const searchStudentsToAdd = async () => {
        if (!studentSearch) return;
        const { data } = await supabase
            .from("students")
            .select("student_id, student_name, enrollment_number")
            .ilike("student_name", `%${studentSearch}%`)
            .limit(5);
        if (data) setSearchResults(data);
    };

    const addStudentToBatch = async (studentId: string) => {
        const { data: existing } = await supabase
            .from("student_batch_mapping")
            .select("batch_id, status")
            .eq("student_id", studentId)
            .eq("status", "Active");

        if (existing && existing.length > 0) {
            alert(`This student is already assigned to another active batch (ID: ${existing[0].batch_id}).`);
            return;
        }

        const { error } = await supabase
            .from("student_batch_mapping")
            .insert([{
                mapping_id: `MAP${Date.now()}`,
                student_id: studentId,
                batch_id: selectedBatch.batch_id,
                faculty_id: selectedBatch.faculty_id,
                status: "Active"
            }]);

        if (error) alert("Error adding student: " + error.message);
        else {
            await logActivity("UPDATE", "BATCH", selectedBatch.batch_id, `Added student ${studentId} to batch`);
            openStudentManager(selectedBatch);
            setSearchResults([]);
            setStudentSearch("");
            fetchBatches();
        }
    };

    const removeStudentFromBatch = async (mappingId: string) => {
        if (!confirm("Remove student from batch?")) return;
        const { error } = await supabase.from("student_batch_mapping").delete().eq("mapping_id", mappingId);
        if (error) alert("Error removing: " + error.message);
        else {
            await logActivity("UPDATE", "BATCH", selectedBatch.batch_id, `Removed student via map ${mappingId} from batch`);
            openStudentManager(selectedBatch);
            fetchBatches();
        }
    };

    // --- Student Edit Logic ---
    const [editingStudent, setEditingStudent] = useState<any>(null);

    const handleUpdateStudent = async () => {
        if (!editingStudent) return;
        try {
            const { error } = await supabase
                .from("students")
                .update({
                    student_name: editingStudent.student_name,
                    enrollment_number: editingStudent.enrollment_number,
                    mobile_number: editingStudent.mobile_number,
                    email: editingStudent.email,
                    branch: editingStudent.branch,
                    academic_year: editingStudent.academic_year,
                    status: editingStudent.status
                })
                .eq("student_id", editingStudent.student_id);

            if (error) throw error;

            await logActivity("UPDATE", "STUDENT", editingStudent.student_id, `Updated student ${editingStudent.student_name} from Batch Manager`);

            // Refresh list
            openStudentManager(selectedBatch);
            setEditingStudent(null);
        } catch (err: any) {
            alert("Error updating student: " + err.message);
        }
    };

    return (
        <div className="space-y-6">
            {view === 'list' && (
                <>
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-white">Batch Management</h2>
                        <button
                            onClick={() => {
                                setEditingId(null);
                                setFormData({
                                    batch_id: "",
                                    batch_number: "",
                                    faculty_id: "",
                                    academic_year: "2023-2024",
                                    status: "Active"
                                });
                                setView("form");
                            }}
                            className="flex items-center gap-2 bg-emerald-600 px-4 py-2 rounded-lg text-white hover:bg-emerald-700"
                        >
                            <Plus className="h-4 w-4" /> Create Batch
                        </button>
                    </div>

                    <div className="flex gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search batches..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full rounded-xl bg-gray-800 border-gray-700 p-2.5 pl-10 text-white focus:ring-emerald-500"
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
                                        <th className="px-6 py-3 cursor-pointer hover:bg-gray-800" onClick={() => handleSort('batch_number')}>
                                            <div className="flex items-center gap-2">Batch Name <SortIcon columnKey="batch_number" /></div>
                                        </th>
                                        <th className="px-6 py-3 cursor-pointer hover:bg-gray-800" onClick={() => handleSort('batch_id')}>
                                            <div className="flex items-center gap-2">Batch ID <SortIcon columnKey="batch_id" /></div>
                                        </th>
                                        <th className="px-6 py-3 cursor-pointer hover:bg-gray-800" onClick={() => handleSort('faculty_name')}>
                                            <div className="flex items-center gap-2">Faculty <SortIcon columnKey="faculty_name" /></div>
                                        </th>
                                        <th className="px-6 py-3 cursor-pointer hover:bg-gray-800" onClick={() => handleSort('academic_year')}>
                                            <div className="flex items-center gap-2">Year <SortIcon columnKey="academic_year" /></div>
                                        </th>
                                        <th className="px-6 py-3 cursor-pointer hover:bg-gray-800" onClick={() => handleSort('total_students')}>
                                            <div className="flex items-center gap-2">Students <SortIcon columnKey="total_students" /></div>
                                        </th>
                                        <th className="px-6 py-3 cursor-pointer hover:bg-gray-800" onClick={() => handleSort('status')}>
                                            <div className="flex items-center gap-2">Status <SortIcon columnKey="status" /></div>
                                        </th>
                                        <th className="px-6 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700">
                                    {loading ? (
                                        <tr><td colSpan={7} className="p-8 text-center">Loading batches...</td></tr>
                                    ) : sortedBatches.map((batch) => (
                                        <tr key={batch.batch_id} className="hover:bg-gray-750">
                                            <td className="px-6 py-4 font-medium text-white">{batch.batch_number}</td>
                                            <td className="px-6 py-4 font-mono text-xs">{batch.batch_id}</td>
                                            <td className="px-6 py-4">
                                                <span className={batch.faculty?.faculty_name ? "text-white" : "text-red-400 italic"}>
                                                    {batch.faculty?.faculty_name || "Unassigned"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">{batch.academic_year}</td>
                                            <td className="px-6 py-4 font-bold text-white">{batch.total_students || 0}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${batch.status === 'Active' ? 'bg-green-900 text-green-300' : 'bg-gray-700 text-gray-400'}`}>
                                                    {batch.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                                                <button
                                                    title="Manage Students"
                                                    onClick={() => openStudentManager(batch)}
                                                    className="p-2 hover:bg-gray-700 rounded-lg text-emerald-400"
                                                >
                                                    <Users className="h-4 w-4" />
                                                </button>
                                                <button title="Edit" onClick={() => { setEditingId(batch.batch_id); setFormData(batch); setView("form"); }} className="p-2 hover:bg-gray-700 rounded-lg text-blue-400">
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button title="Delete" onClick={() => initiateDelete(batch)} className="p-2 hover:bg-gray-700 rounded-lg text-red-400">
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
            )}

            {/* Form and Students View - largely same as before, simplified for char limit */}
            {view === 'form' && (
                <div className="rounded-xl border border-gray-700 bg-gray-800 p-6 max-w-2xl mx-auto">
                    <h3 className="text-lg font-bold text-white mb-6">{editingId ? 'Edit Batch' : 'New Batch'}</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm text-gray-400 mb-1">Batch ID</label>
                            <input
                                className="w-full bg-gray-900 border border-gray-600 rounded-lg p-2 text-white"
                                value={formData.batch_id}
                                onChange={e => setFormData({ ...formData, batch_id: e.target.value })}
                                disabled={!!editingId}
                                placeholder="BATCH2024-A"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Batch Number</label>
                            <input
                                className="w-full bg-gray-900 border border-gray-600 rounded-lg p-2 text-white"
                                value={formData.batch_number}
                                onChange={e => setFormData({ ...formData, batch_number: e.target.value })}
                                placeholder="Group A"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Academic Year</label>
                            <input
                                className="w-full bg-gray-900 border border-gray-600 rounded-lg p-2 text-white"
                                value={formData.academic_year}
                                onChange={e => setFormData({ ...formData, academic_year: e.target.value })}
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm text-gray-400 mb-1">Assign Faculty</label>
                            <select
                                className="w-full bg-gray-900 border border-gray-600 rounded-lg p-2 text-white"
                                value={formData.faculty_id}
                                onChange={e => setFormData({ ...formData, faculty_id: e.target.value })}
                            >
                                <option value="">-- Select Faculty --</option>
                                {facultyList.map(f => (
                                    <option key={f.faculty_id} value={f.faculty_id}>{f.faculty_name}</option>
                                ))}
                            </select>
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
                        <button onClick={handleSaveBatch} className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700">Save Batch</button>
                        <button onClick={() => setView("list")} className="bg-gray-700 text-white px-6 py-2 rounded-lg hover:bg-gray-600">Cancel</button>
                    </div>
                </div>
            )}

            {view === 'students' && selectedBatch && (
                <div className="rounded-xl border border-gray-700 bg-gray-800 p-6">
                    <div className="flex items-center justify-between mb-6 border-b border-gray-700 pb-4">
                        <div>
                            <h3 className="text-xl font-bold text-white">Manage Students</h3>
                            <p className="text-emerald-400">Batch: {selectedBatch.batch_number}</p>
                        </div>
                        <button onClick={() => setView('list')} className="text-gray-400 hover:text-white">
                            <X className="h-6 w-6" />
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Add Student Section */}
                        <div className="md:col-span-1 border-r border-gray-700 pr-6">
                            <h4 className="text-sm font-bold text-gray-300 uppercase mb-4">Add Student</h4>
                            <div className="flex gap-2 mb-4">
                                <input
                                    className="w-full bg-gray-900 border border-gray-600 rounded-lg p-2 text-white text-sm"
                                    placeholder="Search name..."
                                    value={studentSearch}
                                    onChange={e => setStudentSearch(e.target.value)}
                                />
                                <button onClick={searchStudentsToAdd} className="bg-blue-600 p-2 rounded-lg text-white">
                                    <Search className="h-4 w-4" />
                                </button>
                            </div>
                            <div className="space-y-2">
                                {searchResults.map(s => (
                                    <div key={s.student_id} className="flex items-center justify-between bg-gray-700 p-2 rounded text-sm">
                                        <div className="text-gray-300">
                                            <p className="font-medium">{s.student_name}</p>
                                            <p className="text-xs text-gray-500">{s.enrollment_number}</p>
                                        </div>
                                        <button onClick={() => addStudentToBatch(s.student_id)} className="text-emerald-400 hover:text-emerald-300">
                                            <Plus className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* List Students Section */}
                        <div className="md:col-span-2">
                            <h4 className="text-sm font-bold text-gray-300 uppercase mb-4">Current Students ({batchStudents.length})</h4>
                            <div className="rounded-lg border border-gray-700 overflow-hidden">
                                <table className="w-full text-left text-sm text-gray-400">
                                    <thead className="bg-gray-900 text-gray-200">
                                        <tr>
                                            <th className="px-4 py-3">Name</th>
                                            <th className="px-4 py-3">Enrollment</th>
                                            <th className="px-4 py-3 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-700 bg-gray-800">
                                        {batchStudents.map(s => (
                                            <tr key={s.mapping_id} className="hover:bg-gray-750">
                                                <td className="px-4 py-3 text-white font-medium">{s.student_name}</td>
                                                <td className="px-4 py-3">{s.enrollment_number}</td>
                                                <td className="px-4 py-3 text-right flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => setEditingStudent({ ...s, original_mapping_id: s.mapping_id })} // Preserve mapping_id if needed, though we edit student directly
                                                        className="text-blue-400 hover:text-blue-300"
                                                        title="Edit Student Details"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </button>
                                                    <button onClick={() => removeStudentFromBatch(s.mapping_id)} className="text-red-500 hover:text-red-400" title="Remove from Batch">
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {batchStudents.length === 0 && (
                                            <tr>
                                                <td colSpan={3} className="px-4 py-8 text-center text-gray-500 italic">No students in this batch.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Edit Student Modal Overlay */}
                    {editingStudent && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                            <div className="w-full max-w-2xl bg-gray-900 rounded-xl border border-gray-700 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                                <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                                    <h3 className="text-lg font-bold text-white">Edit Student</h3>
                                    <button onClick={() => setEditingStudent(null)} className="text-gray-400 hover:text-white">
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="col-span-1">
                                            <label className="block text-xs font-medium text-gray-400 uppercase mb-1">Student ID</label>
                                            <input
                                                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white cursor-not-allowed opacity-60"
                                                value={editingStudent.student_id || ''}
                                                disabled
                                            />
                                        </div>
                                        <div className="col-span-1">
                                            <label className="block text-xs font-medium text-gray-400 uppercase mb-1">Name</label>
                                            <input
                                                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                                value={editingStudent.student_name || ''}
                                                onChange={(e) => setEditingStudent({ ...editingStudent, student_name: e.target.value })}
                                            />
                                        </div>

                                        <div className="col-span-1">
                                            <label className="block text-xs font-medium text-gray-400 uppercase mb-1">Email</label>
                                            <input
                                                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                                value={editingStudent.email || ''}
                                                onChange={(e) => setEditingStudent({ ...editingStudent, email: e.target.value })}
                                            />
                                        </div>
                                        <div className="col-span-1">
                                            <label className="block text-xs font-medium text-gray-400 uppercase mb-1">Mobile</label>
                                            <input
                                                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                                value={editingStudent.mobile_number || ''}
                                                onChange={(e) => setEditingStudent({ ...editingStudent, mobile_number: e.target.value })}
                                            />
                                        </div>

                                        <div className="col-span-1">
                                            <label className="block text-xs font-medium text-gray-400 uppercase mb-1">Branch</label>
                                            <input
                                                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                                value={editingStudent.branch || ''}
                                                onChange={(e) => setEditingStudent({ ...editingStudent, branch: e.target.value })}
                                            />
                                        </div>
                                        <div className="col-span-1">
                                            <label className="block text-xs font-medium text-gray-400 uppercase mb-1">Year</label>
                                            <input
                                                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                                value={editingStudent.academic_year || ''}
                                                onChange={(e) => setEditingStudent({ ...editingStudent, academic_year: e.target.value })}
                                            />
                                        </div>

                                        <div className="col-span-2">
                                            <label className="block text-xs font-medium text-gray-400 uppercase mb-1">Status</label>
                                            <select
                                                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                                value={editingStudent.status || 'Active'}
                                                onChange={(e) => setEditingStudent({ ...editingStudent, status: e.target.value })}
                                            >
                                                <option value="Active">Active</option>
                                                <option value="Inactive">Inactive</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="pt-4 flex gap-3">
                                        <button
                                            onClick={handleUpdateStudent}
                                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors"
                                        >
                                            Save Changes
                                        </button>
                                        <button
                                            onClick={() => setEditingStudent(null)}
                                            className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium py-2.5 rounded-lg border border-gray-700 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Batch"
                message={`This action will permanently delete Batch ${batchToDelete?.batch_number} and remove all student mappings.`}
                expectedValue={batchToDelete?.batch_id}
                expectedLabel="Batch ID"
            />
        </div>
    );
}
