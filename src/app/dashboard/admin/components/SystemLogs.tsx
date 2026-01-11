"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Clock, Activity, FileText } from "lucide-react";

export default function SystemLogs() {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        setLoading(true);
        const { data } = await supabase
            .from("system_logs")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(100); // Limit to last 100 for performance
        if (data) setLogs(data);
        setLoading(false);
    };

    const getActionColor = (action: string) => {
        switch (action) {
            case 'CREATE': return 'bg-green-900/50 text-green-400 border-green-500/20';
            case 'UPDATE': return 'bg-blue-900/50 text-blue-400 border-blue-500/20';
            case 'DELETE': return 'bg-red-900/50 text-red-400 border-red-500/20';
            default: return 'bg-gray-800 text-gray-400';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Activity className="h-5 w-5 text-blue-400" />
                    System Activity Logs
                </h2>
                <div className="text-xs text-gray-500">Showing last 100 activities</div>
            </div>

            <div className="rounded-xl border border-gray-700 bg-gray-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-400">
                        <thead className="bg-gray-900 text-gray-200">
                            <tr>
                                <th className="px-6 py-3">Time</th>
                                <th className="px-6 py-3">Action</th>
                                <th className="px-6 py-3">Entity</th>
                                <th className="px-6 py-3">Description</th>
                                <th className="px-6 py-3">User</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {loading ? (
                                <tr><td colSpan={5} className="p-8 text-center">Loading logs...</td></tr>
                            ) : logs.map((log) => (
                                <tr key={log.log_id} className="hover:bg-gray-750">
                                    <td className="px-6 py-4 font-mono text-xs text-gray-500 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-3 w-3" />
                                            {new Date(log.created_at).toLocaleString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold border ${getActionColor(log.action_type)}`}>
                                            {log.action_type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-white">{log.entity_type}</div>
                                        <div className="text-xs font-mono">{log.entity_id}</div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-300">
                                        {log.description}
                                    </td>
                                    <td className="px-6 py-4 text-xs font-medium text-blue-300">
                                        {log.performed_by}
                                    </td>
                                </tr>
                            ))}
                            {logs.length === 0 && !loading && (
                                <tr><td colSpan={5} className="p-8 text-center text-gray-500">No activity recorded yet.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
