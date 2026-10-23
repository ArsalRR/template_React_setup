
import { useState } from "react";
import { Sidebar } from "@/layout/Sitebar";
export default function MainLayout({ children }) {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div className="flex h-screen overflow-hidden bg-slate-100 dark:bg-slate-950">

            <Sidebar
                collapsed={collapsed}
                onToggle={() => setCollapsed((prev) => !prev)}
            />

            <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
                <header className="flex h-14 shrink-0 items-center border-b border-slate-200 bg-white px-5 dark:border-slate-700 dark:bg-slate-900" />
                <main className="flex-1 overflow-y-auto p-5 sm:p-6 lg:p-8">
                    {children}
                </main>

            </div>
        </div>
    );
}

