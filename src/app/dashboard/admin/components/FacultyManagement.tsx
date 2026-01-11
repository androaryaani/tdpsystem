"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Search, Plus, Trash2, Edit, Mail, Phone, ArrowUpDown, ArrowUp, ArrowDown, Download } from "lucide-react";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";
import { logActivity } from "@/lib/logger";

export default function FacultyManagement() {
    const [faculty, setFaculty] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [view, setView] = useState<"list" | "form">("list");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);

    // Helper for delete
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [facultyToDelete, setFacultyToDelete] = useState<any>(null);

    const [formData, setFormData] = useState({
        faculty_id: "",
        employee_number: "",
        faculty_name: "",
        email: "",
        mobile_number: "",
        branch: "Engineering",
        designation: "Assistant Professor",
        status: "Active"
    });

    useEffect(() => {
        fetchFaculty();
    }, []);

    const fetchFaculty = async () => {
        setLoading(true);
        const { data } = await supabase
            .from("faculty")
            .select("*")
            .order("created_date", { ascending: false });
        if (data) setFaculty(data);
        setLoading(false);
    };

    const handleSave = async () => {
        if (!editingId) {
            const { data: existing } = await supabase
                .from("faculty")
                .select("faculty_id")
                .or(`email.eq.${formData.email},mobile_number.eq.${formData.mobile_number}`);

            if (existing && existing.length > 0) {
                alert("Faculty with this Email or Mobile already exists!");
                return;
            }
        }

        try {
            if (editingId) {
                const { error } = await supabase
                    .from("faculty")
                    .update(formData)
                    .eq("faculty_id", editingId);
                if (error) throw error;
                await logActivity("UPDATE", "FACULTY", editingId, `Updated faculty: ${formData.faculty_name}`);
            } else {
                const payload = {
                    ...formData,
                    faculty_id: formData.faculty_id || `FAC${Math.floor(Math.random() * 10000)}`
                };
                const { error } = await supabase.from("faculty").insert([payload]);
                if (error) throw error;
                await logActivity("CREATE", "FACULTY", payload.faculty_id, `Created faculty: ${payload.faculty_name}`);
            }
            setView("list");
            setEditingId(null);
            setFormData({
                faculty_id: "",
                employee_number: "",
                faculty_name: "",
                email: "",
                mobile_number: "",
                branch: "Engineering",
                designation: "Assistant Professor",
                status: "Active"
            });
            fetchFaculty();
        } catch (err: any) {
            alert("Error saving: " + err.message);
        }
    };

    const initiateDelete = (fac: any) => {
        setFacultyToDelete(fac);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!facultyToDelete) return;
        const id = facultyToDelete.faculty_id;

        try {
            const { error: batchError } = await supabase
                .from("batches")
                .update({ faculty_id: null, status: 'Inactive' })
                .eq("faculty_id", id);

            if (batchError) throw batchError;

            const { error } = await supabase.from("faculty").delete().eq("faculty_id", id);
            if (error) throw error;

            await logActivity("DELETE", "FACULTY", id, `Deleted faculty: ${facultyToDelete.faculty_name}. Unassigned related batches.`);
            fetchFaculty();
        } catch (err: any) {
            alert("Error deleting: " + err.message);
        }
    };

    const handleEdit = (fac: any) => {
        setFormData(fac);
        setEditingId(fac.faculty_id);
        setView("form");
    };

    const toggleStatus = async (fac: any) => {
        const newStatus = fac.status === "Active" ? "Inactive" : "Active";
        const { error } = await supabase
            .from("faculty")
            .update({ status: newStatus })
            .eq("faculty_id", fac.faculty_id);

        if (error) alert("Error updating status");
        else {
            await logActivity("UPDATE", "FACULTY", fac.faculty_id, `Changed status to ${newStatus}`);
            fetchFaculty();
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

    const filteredFaculty = useMemo(() => {
        let result = [...faculty];

        if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            result = result.filter(f =>
                f.faculty_name?.toLowerCase().includes(lower) ||
                f.email?.toLowerCase().includes(lower) ||
                f.employee_number?.toLowerCase().includes(lower) ||
                f.branch?.toLowerCase().includes(lower) ||
                f.designation?.toLowerCase().includes(lower)
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
    }, [faculty, searchTerm, sortConfig]);

    const SortIcon = ({ columnKey }: { columnKey: string }) => {
        if (sortConfig?.key !== columnKey) return <ArrowUpDown className="h-4 w-4 text-gray-600 opacity-50" />;
        return sortConfig.direction === 'asc'
            ? <ArrowUp className="h-4 w-4 text-blue-400" />
            : <ArrowDown className="h-4 w-4 text-blue-400" />;
    };

    // Download CSV Logic
    const downloadCSV = () => {
        if (filteredFaculty.length === 0) {
            alert("No data to download.");
            return;
        }

        const headers = ["Faculty ID", "Name", "Emp Number", "Designation", "Department", "Email", "Mobile", "Status"];
        const rows = filteredFaculty.map(f => [
            f.faculty_id,
            f.faculty_name,
            f.employee_number,
            f.designation,
            f.branch,
            f.email,
            f.mobile_number,
            f.status
        ]);

        const csvContent = [
            headers.join(","),
            ...rows.map(row => row.map(cell => `"${(cell || "").toString().replace(/"/g, '""')}"`).join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `faculty_export_${new Date().toISOString().slice(0, 10)}.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Faculty Management</h2>
                {view === "list" && (
                    <button
                        onClick={() => {
                            setEditingId(null);
                            setFormData({
                                faculty_id: "",
                                employee_number: "",
                                faculty_name: "",
                                email: "",
                                mobile_number: "",
                                branch: "Engineering",
                                designation: "Assistant Professor",
                                status: "Active"
                            });
                            setView("form");
                        }}
                        className="flex items-center gap-2 bg-purple-600 px-4 py-2 rounded-lg text-white hover:bg-purple-700"
                    >
                        <Plus className="h-4 w-4" /> Add Faculty
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
                                placeholder="Search faculty..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full rounded-xl bg-gray-800 border-gray-700 p-2.5 pl-10 text-white focus:ring-purple-500"
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
                                        <th className="px-6 py-3 cursor-pointer hover:bg-gray-800" onClick={() => handleSort('faculty_id')}>
                                            <div className="flex items-center gap-2">ID <SortIcon columnKey="faculty_id" /></div>
                                        </th>
                                        <th className="px-6 py-3 cursor-pointer hover:bg-gray-800" onClick={() => handleSort('faculty_name')}>
                                            <div className="flex items-center gap-2">Name <SortIcon columnKey="faculty_name" /></div>
                                        </th>
                                        <th className="px-6 py-3 cursor-pointer hover:bg-gray-800" onClick={() => handleSort('designation')}>
                                            <div className="flex items-center gap-2">Designation <SortIcon columnKey="designation" /></div>
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
                                    ) : filteredFaculty.map((fac) => (
                                        <tr key={fac.faculty_id} className="hover:bg-gray-750">
                                            <td className="px-6 py-4 font-mono text-xs text-gray-500">{fac.faculty_id}</td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-white">{fac.faculty_name}</div>
                                                <div className="text-xs">{fac.employee_number}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div>{fac.designation}</div>
                                                <div className="text-xs">{fac.branch}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div>{fac.email}</div>
                                                <div className="text-xs">{fac.mobile_number}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    onClick={() => toggleStatus(fac)}
                                                    className={`cursor-pointer px-2 py-1 rounded-full text-xs font-medium ${fac.status === 'Active' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
                                                        }`}>
                                                    {fac.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                                                <button onClick={() => handleEdit(fac)} className="p-2 hover:bg-gray-700 rounded-lg text-blue-400">
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button onClick={() => initiateDelete(fac)} className="p-2 hover:bg-gray-700 rounded-lg text-red-400">
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
                    <h3 className="text-lg font-bold text-white mb-6">{editingId ? 'Edit Faculty' : 'New Faculty'}</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2 md:col-span-1">
                            <label className="block text-sm text-gray-400 mb-1">Faculty ID</label>
                            <input
                                className="w-full bg-gray-900 border border-gray-600 rounded-lg p-2 text-white"
                                value={formData.faculty_id}
                                onChange={e => setFormData({ ...formData, faculty_id: e.target.value })}
                                disabled={!!editingId}
                                placeholder="FAC101"
                            />
                        </div>
                        <div className="col-span-2 md:col-span-1">
                            <label className="block text-sm text-gray-400 mb-1">Name</label>
                            <input
                                className="w-full bg-gray-900 border border-gray-600 rounded-lg p-2 text-white"
                                value={formData.faculty_name}
                                onChange={e => setFormData({ ...formData, faculty_name: e.target.value })}
                            />
                        </div>
                        <div className="col-span-2 md:col-span-1">
                            <label className="block text-sm text-gray-400 mb-1">Emp Number</label>
                            <input
                                className="w-full bg-gray-900 border border-gray-600 rounded-lg p-2 text-white"
                                value={formData.employee_number}
                                onChange={e => setFormData({ ...formData, employee_number: e.target.value })}
                            />
                        </div>
                        <div className="col-span-2 md:col-span-1">
                            <label className="block text-sm text-gray-400 mb-1">Designation</label>
                            <input
                                className="w-full bg-gray-900 border border-gray-600 rounded-lg p-2 text-white"
                                value={formData.designation}
                                onChange={e => setFormData({ ...formData, designation: e.target.value })}
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
                        <button onClick={handleSave} className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700">Save Faculty</button>
                        <button onClick={() => setView("list")} className="bg-gray-700 text-white px-6 py-2 rounded-lg hover:bg-gray-600">Cancel</button>
                    </div>
                </div>
            )}

            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Faculty"
                message={`This action will permanently delete ${facultyToDelete?.faculty_name} from the system. Associated batches will be unassigned.`}
                expectedValue={facultyToDelete?.mobile_number}
                expectedLabel="Faculty Mobile Number"
            />
        </div>
    );
}
