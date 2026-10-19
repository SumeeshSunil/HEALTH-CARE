import { useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

function Layout({ children }) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 antialiased selection:bg-teal-500 selection:text-white">
            <Navbar
                isMobileOpen={isMobileOpen}
                setIsMobileOpen={setIsMobileOpen}
                isCollapsed={isCollapsed}
                setIsCollapsed={setIsCollapsed}
            />

            <div className="flex flex-1 relative min-w-0">
                <Sidebar
                    isCollapsed={isCollapsed}
                    setIsCollapsed={setIsCollapsed}
                    isMobileOpen={isMobileOpen}
                    setIsMobileOpen={setIsMobileOpen}
                />

                <main className="flex-1 min-w-0 w-full p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 overflow-x-hidden">
                    {children}
                </main>
            </div>
        </div>
    );
}

export default Layout;
