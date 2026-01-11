"use client"

import * as React from "react"
import { Moon, Sun, Laptop } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
    const { setTheme, theme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return null
    }

    return (
        <div className="flex items-center gap-1 border border-gray-200 dark:border-gray-800 p-1 rounded-full bg-background transition-colors duration-200">
            <button
                onClick={() => setTheme("light")}
                className={`p-2 rounded-full transition-all hover:bg-gray-100 dark:hover:bg-gray-800 ${theme === 'light' ? 'bg-gray-200 dark:bg-gray-700 text-yellow-500' : 'text-gray-500'}`}
                aria-label="Light mode"
                title="Light Mode"
            >
                <Sun className="h-4 w-4" />
            </button>
            <button
                onClick={() => setTheme("dark")}
                className={`p-2 rounded-full transition-all hover:bg-gray-100 dark:hover:bg-gray-800 ${theme === 'dark' ? 'bg-gray-200 dark:bg-gray-700 text-blue-400' : 'text-gray-500'}`}
                aria-label="Dark mode"
                title="Dark Mode"
            >
                <Moon className="h-4 w-4" />
            </button>
            <button
                onClick={() => setTheme("system")}
                className={`p-2 rounded-full transition-all hover:bg-gray-100 dark:hover:bg-gray-800 ${theme === 'system' ? 'bg-gray-200 dark:bg-gray-700 text-green-500' : 'text-gray-500'}`}
                aria-label="System mode"
                title="System (Auto)"
            >
                <Laptop className="h-4 w-4" />
            </button>
        </div>
    )
}
