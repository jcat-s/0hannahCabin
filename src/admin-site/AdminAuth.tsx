import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../shared/lib/firebase";
import { LogIn, Lock, Mail, ShieldCheck, AlertCircle } from "lucide-react";

export function AdminLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        // TypeScript Guard: Sinisiguro natin na initialized ang auth
        if (!auth) {
            setError("Firebase Auth is not initialized.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            // Ginamit ang auth! para sabihan ang TS na safe ito gamitin dito
            await signInWithEmailAndPassword(auth, email.trim(), password);
        } catch (err: any) {
            console.error("Login Error:", err.code);
            // Custom error messages para sa user
            if (err.code === 'auth/invalid-credential') {
                setError("Mali ang email o password. Pakisubukang muli.");
            } else if (err.code === 'auth/too-many-requests') {
                setError("Masyadong maraming login attempts. Balik ulit mamaya.");
            } else {
                setError("Hindi makapag-login sa ngayon. Check your connection.");
            }
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 font-sans">
            <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">

                {/* Branding Section */}
                <div className="text-center mb-10">
                    <div className="w-20 h-20 bg-[#D4AF37]/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 border border-[#D4AF37]/20 shadow-2xl shadow-[#D4AF37]/5">
                        <ShieldCheck size={40} className="text-[#D4AF37]" />
                    </div>
                    <h1 className="text-4xl font-serif italic text-white font-black tracking-tight">
                        Ohannah <span className="text-[#D4AF37]">Admin</span>
                    </h1>
                    <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em] mt-3">
                        Secure Management Portal
                    </p>
                </div>

                {/* Login Form */}
                <div className="bg-zinc-900/50 p-8 rounded-[3rem] border border-white/5 backdrop-blur-sm shadow-2xl">
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-4">Email Address</p>
                            <div className="relative">
                                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                                <input
                                    type="email"
                                    placeholder="admin@ohannah.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-zinc-950 border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-white text-xs font-black tracking-widest focus:ring-2 ring-[#D4AF37]/30 transition-all outline-none"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-4">Password</p>
                            <div className="relative">
                                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-zinc-950 border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-white text-xs font-black tracking-widest focus:ring-2 ring-[#D4AF37]/30 transition-all outline-none"
                                    required
                                />
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center gap-3 animate-pulse">
                                <AlertCircle size={16} className="text-red-500 shrink-0" />
                                <p className="text-red-500 text-[10px] font-black uppercase tracking-widest leading-tight">
                                    {error}
                                </p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all shadow-xl flex items-center justify-center gap-3 mt-4
                                ${loading
                                    ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                                    : "bg-[#D4AF37] hover:bg-[#B8962E] text-zinc-950 shadow-[#D4AF37]/10"
                                }`}
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-zinc-950/30 border-t-zinc-950 rounded-full animate-spin" />
                            ) : (
                                <>
                                    Access Dashboard <LogIn size={16} />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <div className="mt-12 text-center space-y-4">
                    <p className="text-zinc-700 text-[9px] font-bold uppercase tracking-widest leading-loose">
                        Authorized Personnel Only<br />
                        Unauthorized access is strictly prohibited and monitored.
                    </p>
                    <div className="h-px w-12 bg-zinc-800 mx-auto" />
                    <p className="text-zinc-500 text-[9px] font-black uppercase tracking-widest">
                        &copy; 2026 Ohannah Cabin & Resort
                    </p>
                </div>
            </div>
        </div>
    );
}