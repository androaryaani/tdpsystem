"use client";

import { useState } from "react";
import { AlertTriangle, X } from "lucide-react";

interface DeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    expectedValue: string; // The value user needs to type
    expectedLabel: string; // Label for the value (e.g. "Mobile Number")
}

export default function DeleteConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    expectedValue,
    expectedLabel
}: DeleteModalProps) {
    const [inputValue, setInputValue] = useState("");
    const [error, setError] = useState("");

    if (!isOpen) return null;

    const handleConfirm = () => {
        if (inputValue === expectedValue) {
            onConfirm();
            onClose();
            setInputValue("");
            setError("");
        } else {
            setError(`${expectedLabel} does not match.`);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl bg-gray-900 border border-red-500/30 p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3 text-red-400">
                        <div className="p-2 bg-red-500/10 rounded-lg">
                            <AlertTriangle className="h-6 w-6" />
                        </div>
                        <h3 className="text-lg font-bold">{title}</h3>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-white">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <p className="text-gray-300 mb-6 text-sm leading-relaxed">
                    {message}
                </p>

                <div className="mb-6">
                    <label className="block text-xs font-medium text-gray-500 uppercase mb-2">
                        Type <span className="text-white font-mono">{expectedValue}</span> to confirm:
                    </label>
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => {
                            setInputValue(e.target.value);
                            setError("");
                        }}
                        className={`w-full rounded-lg bg-gray-800 border p-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 transition-all ${error ? "border-red-500 focus:ring-red-500/50" : "border-gray-700 focus:ring-red-500/50"
                            }`}
                        placeholder={`Enter ${expectedLabel}`}
                    />
                    {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors shadow-lg shadow-red-900/20"
                    >
                        Confirm Delete
                    </button>
                </div>
            </div>
        </div>
    );
}
