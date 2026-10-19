import { useSelector, useDispatch } from "react-redux";
import { markAllRead, markRead } from "../../redux/slices/notificationSlice";
import Layout from "../../components/Layout";

function Notifications() {
    const dispatch = useDispatch();
    const auth = useSelector((state) => state.auth);
    const allNotifications = useSelector((state) => state.notifications?.notifications || []);

    const currentUserId = auth?.user?.id;
    const currentUserEmail = auth?.user?.email?.toLowerCase();
    const notificationsList = allNotifications.filter(
        (n) => !n.userId || String(n.userId) === String(currentUserId) || (n.userEmail && n.userEmail.toLowerCase() === currentUserEmail)
    );

    const unreadCount = notificationsList.filter((n) => n.unread).length;

    const handleMarkAllRead = () => {
        dispatch(markAllRead({ userId: currentUserId }));
    };

    const handleMarkRead = (id) => {
        dispatch(markRead(id));
    };

    const typeConfig = {
        appointment: { bg: "bg-sky-50 text-sky-600", icon: "📅" },
        billing: { bg: "bg-rose-50 text-rose-600", icon: "💳" },
        lab: { bg: "bg-teal-50 text-teal-600", icon: "🧪" },
        info: { bg: "bg-slate-50 text-slate-600", icon: "ℹ️" },
    };

    return (
        <Layout>
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <span className="inline-block px-3 py-1 bg-teal-500/20 text-teal-300 rounded-full text-xs font-semibold uppercase tracking-wider mb-3 border border-teal-500/30">
                        System Feed
                    </span>
                    <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                        Notifications & Alerts
                    </h1>
                    <p className="text-slate-300 mt-2 text-xs sm:text-sm leading-relaxed">
                        Stay informed on consultation reminders, lab result releases, and account updates.
                    </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                    {unreadCount > 0 && (
                        <span className="bg-teal-500 text-white font-bold text-xs px-3 py-1 rounded-full">
                            {unreadCount} unread
                        </span>
                    )}
                    <button
                        onClick={handleMarkAllRead}
                        className="bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition border border-white/20"
                    >
                        Mark All as Read
                    </button>
                </div>
            </div>

            <div className="space-y-3">
                {notificationsList.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80">
                        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-2xl mb-3">🔔</div>
                        <h3 className="font-bold text-slate-800 text-base">All caught up!</h3>
                        <p className="text-xs text-slate-500 mt-1">No notifications at this time.</p>
                    </div>
                ) : (
                    notificationsList.map((n) => {
                        const cfg = typeConfig[n.type] || typeConfig.info;
                        return (
                            <div
                                key={n.id}
                                onClick={() => handleMarkRead(n.id)}
                                className={`bg-white rounded-2xl p-5 sm:p-6 shadow-sm border transition flex items-start gap-4 cursor-pointer ${
                                    n.unread ? "border-teal-400/80 shadow-teal-100" : "border-slate-200/80"
                                }`}
                            >
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold shrink-0 ${cfg.bg}`}>
                                    {cfg.icon}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start gap-2">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                                                {n.title}
                                            </h3>
                                            {n.unread && (
                                                <span className="w-2 h-2 rounded-full bg-teal-500 shrink-0" />
                                            )}
                                        </div>
                                        <span className="text-[11px] text-slate-400 font-medium shrink-0">
                                            {n.time}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-600 leading-relaxed mt-1">
                                        {n.message}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </Layout>
    );
}

export default Notifications;
