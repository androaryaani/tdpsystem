"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

export default function InstallPrompt() {
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

    useEffect(() => {
        setIsIOS(
            /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
        );

        setIsStandalone(window.matchMedia("(display-mode: standalone)").matches);

        const handleBeforeInstallPrompt = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };

        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener(
                "beforeinstallprompt",
                handleBeforeInstallPrompt
            );
        };
    }, []);

    if (isStandalone) {
        return null; // Don't show if already installed
    }

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();

        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === "accepted") {
            setDeferredPrompt(null);
        }
    };

    if (!deferredPrompt && !isIOS) {
        return null; // Don't show if browser doesn't support install prompt or if it's already installed
    }

    return (
        <div className="fixed bottom-4 left-4 right-4 md:right-auto md:left-4 z-50 animate-in slide-in-from-bottom-5 fade-in duration-500">
            <div className="bg-gray-900 border border-gray-800 text-white rounded-xl shadow-2xl p-4 flex items-center justify-between gap-4 max-w-sm">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-600 p-2 rounded-lg">
                        <Download className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <p className="font-bold text-sm">Install VGU-TDP</p>
                        <p className="text-xs text-gray-400">Add to Home Screen</p>
                    </div>
                </div>

                {isIOS ? (
                    <p className="text-xs text-gray-400">
                        Tap <span className="font-bold">Share</span> and then <br /> <span className="font-bold">Add to Home Screen</span>
                    </p>
                ) : (
                    <button
                        onClick={handleInstallClick}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 px-4 rounded-full transition-colors"
                    >
                        Install
                    </button>
                )}

                <button onClick={() => setDeferredPrompt(null)} className="text-gray-500 hover:text-white">
                    <X className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}
