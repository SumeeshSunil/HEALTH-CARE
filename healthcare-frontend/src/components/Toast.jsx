import { useState, useEffect, useCallback, createContext, useContext } from "react";

const ToastContext = createContext(null);

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
    return ctx;
}

function ToastItem({ toast, onClose }) {
    useEffect(() => {
        const timer = setTimeout(() => onClose(toast.id), toast.duration || 4000);
        return () => clearTimeout(timer);
    }, [toast.id, toast.duration, onClose]);

    const variants = {
        success: {
            bg: "bg-emerald-600",
            icon: (
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
            ),
        },
        error: {
            bg: "bg-rose-600",
            icon: (
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            ),
        },
        warning: {
            bg: "bg-amber-500",
            icon: (
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
            ),
        },
        info: {
            bg: "bg-sky-600",
            icon: (
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20A10 10 0 0012 2z" />
                </svg>
            ),
        },
    };

    const variant = variants[toast.type] || variants.info;

    return (
        <div
            className={`flex items-start gap-3 ${variant.bg} text-white px-4 py-3.5 rounded-2xl shadow-2xl max-w-sm w-full pointer-events-auto`}
            style={{ animation: "slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}
        >
            <span className="mt-0.5">{variant.icon}</span>
            <div className="flex-1 min-w-0">
                {toast.title && (
                    <p className="font-bold text-xs uppercase tracking-wider opacity-80 mb-0.5">
                        {toast.title}
                    </p>
                )}
                <p className="text-sm font-medium leading-snug">{toast.message}</p>
            </div>
            <button onClick={() => onClose(toast.id)} className="shrink-0 opacity-70 hover:opacity-100 transition mt-0.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    );
}

function ToastContainer({ toasts, onClose }) {
    return (
        <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 pointer-events-none">
            <style>{`
                @keyframes slideInRight {
                    from { opacity: 0; transform: translateX(100%) scale(0.95); }
                    to   { opacity: 1; transform: translateX(0) scale(1); }
                }
            `}</style>
            {toasts.map((t) => (
                <ToastItem key={t.id} toast={t} onClose={onClose} />
            ))}
        </div>
    );
}

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const addToast = useCallback((message, type = "info", title = "", duration = 4000) => {
        const id = Date.now() + Math.random();
        setToasts((prev) => [...prev, { id, message, type, title, duration }]);
    }, []);

    const toast = {
        success: (msg, title) => addToast(msg, "success", title),
        error: (msg, title) => addToast(msg, "error", title),
        warning: (msg, title) => addToast(msg, "warning", title),
        info: (msg, title) => addToast(msg, "info", title),
    };

    return (
        <ToastContext.Provider value={toast}>
            {children}
            <ToastContainer toasts={toasts} onClose={removeToast} />
        </ToastContext.Provider>
    );
}

export default ToastProvider;
