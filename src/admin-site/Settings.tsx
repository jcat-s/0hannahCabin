import React, { useState, useEffect } from "react";
import {
    collection, query, onSnapshot, doc,
    setDoc, deleteDoc, Firestore
} from "firebase/firestore";
import { db } from "../shared/lib/firebase";
import {
    UserPlus, Trash2, Mail,
    User, Search, AlertCircle,
    ShieldCheck, X, Info
} from "lucide-react";

interface AdminUser {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt?: string;
}

export function SystemConfig() {
    const [admins, setAdmins] = useState<AdminUser[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isAdding, setIsAdding] = useState(false);

    // Form State
    const [newAdmin, setNewAdmin] = useState({
        uid: "", // Employee UID from their Firebase Auth
        name: "",
        email: "",
        role: "admin" // Naka-lowercase para match sa AdminLogin.tsx logic mo
    });

    // Fetch Admins List
    useEffect(() => {
        if (!db) return;
        const q = query(collection(db as Firestore, "admins"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as AdminUser[];
            setAdmins(data);
        });
        return () => unsubscribe();
    }, []);

    const handleAddAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newAdmin.uid || !newAdmin.name || !newAdmin.email) {
            alert("Pakikumpleto ang lahat ng fields (UID, Name, Email).");
            return;
        }

        try {
            // I-save sa 'admins' collection gamit ang UID bilang Document ID
            await setDoc(doc(db as Firestore, "admins", newAdmin.uid.trim()), {
                name: newAdmin.name.trim(),
                email: newAdmin.email.trim().toLowerCase(),
                role: newAdmin.role,
                createdAt: new Date().toISOString()
            });

            alert(`Success! Naidagdag na si ${newAdmin.name}. Sabihan ang employee na gamitin ang 'Forgot Password' sa login page para ma-set ang kanilang password.`);

            setNewAdmin({ uid: "", name: "", email: "", role: "admin" });
            setIsAdding(false);
        } catch (error) {
            console.error("Error adding admin:", error);
            alert("Nagka-error sa pag-add. Siguraduhing tama ang UID.");
        }
    };

    const removeAdmin = async (id: string) => {
        if (!window.confirm("Sigurado ka bang tatanggalin mo ang access ng user na ito?")) return;
        try {
            await deleteDoc(doc(db as Firestore, "admins", id));
        } catch (error) {
            console.error("Error removing admin:", error);
        }
    };

    const filteredAdmins = admins.filter(a =>
        a.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* HEADER SECTION */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h3 className="text-2xl font-black uppercase tracking-tighter text-zinc-900">Admin Registry</h3>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">
                        Authorized Personnel Only • Management Terminal
                    </p>
                </div>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className={`flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg ${isAdding ? "bg-zinc-100 text-zinc-500 hover:bg-zinc-200" : "bg-zinc-950 text-white hover:bg-[#D4AF37] hover:text-zinc-950"
                        }`}
                >
                    {isAdding ? <X size={16} /> : <UserPlus size={16} />}
                    {isAdding ? "Cancel" : "Register New Admin"}
                </button>
            </div>

            {/* ADD ADMIN FORM */}
            {isAdding && (
                <form onSubmit={handleAddAdmin} className="bg-white border-2 border-zinc-100 rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300">
                    <div className="flex items-start gap-4 mb-8 bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                        <Info className="text-[#D4AF37] shrink-0" size={20} />
                        <p className="text-[9px] font-bold text-zinc-500 leading-relaxed uppercase tracking-wider">
                            Step: 1. Kunin ang UID ng user. 2. I-register dito. 3. Sabihan ang user na i-click ang <span className="text-zinc-900">"Forgot Password"</span> sa login screen para ma-set ang sariling password nila.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-2">Firebase UID</label>
                            <input
                                required
                                className="w-full bg-zinc-50 border-none rounded-xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-[#D4AF37] outline-none"
                                placeholder="User Unique ID (UID)"
                                value={newAdmin.uid}
                                onChange={(e) => setNewAdmin({ ...newAdmin, uid: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-2">Full Name</label>
                            <input
                                required
                                className="w-full bg-zinc-50 border-none rounded-xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-[#D4AF37] outline-none"
                                placeholder="Juan Dela Cruz"
                                value={newAdmin.name}
                                onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-2">Admin Email</label>
                            <input
                                required
                                type="email"
                                className="w-full bg-zinc-50 border-none rounded-xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-[#D4AF37] outline-none"
                                placeholder="employee@ohannahcabin.com"
                                value={newAdmin.email}
                                onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-2">Assign Role</label>
                            <select
                                className="w-full bg-zinc-50 border-none rounded-xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-[#D4AF37] outline-none appearance-none"
                                value={newAdmin.role}
                                onChange={(e) => setNewAdmin({ ...newAdmin, role: e.target.value })}
                            >
                                <option value="admin">Full Admin</option>
                                <option value="staff">Standard Staff</option>
                            </select>
                        </div>
                    </div>
                    <button type="submit" className="w-full mt-8 bg-[#D4AF37] text-zinc-950 py-5 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] hover:brightness-110 transition-all shadow-lg shadow-[#D4AF37]/20">
                        Authorize & Grant Access
                    </button>
                </form>
            )}

            {/* ADMINS LIST TABLE */}
            <div className="bg-white rounded-[3rem] shadow-sm border border-zinc-100 overflow-hidden">
                <div className="p-6 border-b border-zinc-50 flex items-center gap-4 bg-zinc-50/50">
                    <Search size={18} className="text-zinc-400" />
                    <input
                        type="text"
                        placeholder="Search registry by name or email..."
                        className="bg-transparent border-none outline-none text-sm font-bold w-full"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-zinc-100">
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-400">Authorized User</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-400">Access Level</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right">Registry Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-50">
                            {filteredAdmins.map((admin) => (
                                <tr key={admin.id} className="group hover:bg-zinc-50 transition-colors">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-400 group-hover:bg-zinc-950 group-hover:text-[#D4AF37] transition-all">
                                                <ShieldCheck size={20} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black uppercase tracking-tight text-zinc-800">{admin.name}</p>
                                                <p className="text-[10px] font-bold text-zinc-400 italic lowercase">{admin.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${admin.role === 'admin' ? 'bg-zinc-950 text-white' : 'bg-zinc-100 text-zinc-500'
                                            }`}>
                                            {admin.role}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <button
                                            onClick={() => removeAdmin(admin.id)}
                                            className="p-3 text-zinc-200 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                                            title="Revoke Access"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filteredAdmins.length === 0 && (
                        <div className="py-24 text-center">
                            <AlertCircle size={48} className="mx-auto text-zinc-100 mb-4" />
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-300 italic">No Registry Records Found</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}