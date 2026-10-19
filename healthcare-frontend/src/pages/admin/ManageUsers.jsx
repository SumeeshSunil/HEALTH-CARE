import { useState } from "react";
import dummyUsers from "../../data/dummyUsers.json";
import Layout from "../../components/Layout";

function ManageUsers() {
    const [usersList, setUsersList] = useState(dummyUsers);
    const [roleFilter, setRoleFilter] = useState("all");

    const filteredUsers = usersList.filter((u) => {
        if (roleFilter === "all") return true;
        return u.role === roleFilter;
    });

    const toggleStatus = (id) => {
        setUsersList(
            usersList.map((u) =>
                u.id === id ? { ...u, status: u.status === "Disabled" ? "Active" : "Disabled" } : u
            )
        );
    };

    return (
        <Layout>
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
                <span className="inline-block px-3 py-1 bg-teal-500/20 text-teal-300 rounded-full text-xs font-semibold uppercase tracking-wider mb-3 border border-teal-500/30">
                    Access Governance
                </span>
                <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                    Manage System Users & Roles
                </h1>
                <p className="text-slate-300 mt-2 text-xs sm:text-sm leading-relaxed max-w-xl">
                    Review and modify user credentials, assign roles, and toggle access statuses.
                </p>
            </div>

            <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200/80 flex items-center gap-2 overflow-x-auto">
                {["all", "patient", "doctor", "admin"].map((r) => (
                    <button
                        key={r}
                        onClick={() => setRoleFilter(r)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition shrink-0 ${
                            roleFilter === r
                                ? "bg-slate-900 text-white shadow-sm"
                                : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                        }`}
                    >
                        {r} accounts ({r === "all" ? usersList.length : usersList.filter(u => u.role === r).length})
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs sm:text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                            <tr>
                                <th className="p-4 sm:p-5">User Account</th>
                                <th className="p-4 sm:p-5">Email Address</th>
                                <th className="p-4 sm:p-5">Role</th>
                                <th className="p-4 sm:p-5">Status</th>
                                <th className="p-4 sm:p-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-50/60 transition">
                                    <td className="p-4 sm:p-5 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-xl bg-slate-900 text-teal-300 font-bold text-xs flex items-center justify-center shrink-0">
                                            {user.name.charAt(0)}
                                        </div>
                                        <div>
                                            <span className="font-extrabold text-slate-900 block">{user.name}</span>
                                            <span className="text-[10px] text-slate-400 font-medium">ID: #{user.id}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 sm:p-5 text-slate-600">{user.email}</td>
                                    <td className="p-4 sm:p-5">
                                        <span className="capitalize px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800">
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="p-4 sm:p-5">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                            user.status === "Disabled"
                                                ? "bg-rose-50 text-rose-700 border border-rose-200"
                                                : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                        }`}>
                                            {user.status || "Active"}
                                        </span>
                                    </td>
                                    <td className="p-4 sm:p-5 text-right">
                                        <button
                                            onClick={() => toggleStatus(user.id)}
                                            className="text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 transition"
                                        >
                                            Toggle Status
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </Layout>
    );
}

export default ManageUsers;
