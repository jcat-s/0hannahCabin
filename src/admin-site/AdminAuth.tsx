import React, { useState, useEffect } from "react";
import {
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    sendPasswordResetEmail // Added for Forgot Pass
} from "firebase/auth";
import { auth, db } from "../shared/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import {
    LogIn,
    Lock,
    Mail,
    ShieldCheck,
    AlertCircle,
    Loader2,
    ArrowLeft,
    Eye,
    EyeOff
} from "lucide-react";

export function AdminLogin() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false); // Eye Toggle State
    const [status, setStatus] = useState({ type: "", message: "" });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!auth || !db) return;
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const adminDoc = await getDoc(doc(db!, "admins", user.uid));
                if (adminDoc.exists()) {
                    navigate("/admin/dashboard");
                }
            }
        });
        return () => unsubscribe();
    }, [navigate]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!auth || !db) return;

        setLoading(true);
        setStatus({ type: "", message: "" });

        try {
            const userCredential = await signInWithEmailAndPassword(auth!, email.trim(), password);
            const user = userCredential.user;

            const adminDocRef = doc(db!, "admins", user.uid);
            const adminSnap = await getDoc(adminDocRef);

            if (adminSnap.exists() && adminSnap.data().role === "admin") {
                setStatus({ type: "success", message: "Identity Verified. Accessing Terminal..." });
                setTimeout(() => navigate("/admin/dashboard"), 1500);
            } else {
                await signOut(auth!);
                throw new Error("unauthorized_role");
            }
        } catch (err: any) {
            let msg = "Access Denied: Invalid Credentials.";
            if (err.message === "unauthorized_role") msg = "RESTRICTED: You are not in the Admin Registry.";
            if (err.code === 'auth/invalid-credential') msg = "Wrong email or password.";

            setStatus({ type: "error", message: msg });
            setLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        if (!email) {
            setStatus({ type: "error", message: "Please enter your email address." });
            return;
        }
        setLoading(true);
        try {
            await sendPasswordResetEmail(auth!, email);
            setStatus({ type: "success", message: "Reset link sent to your email." });
        } catch (err: any) {
            setStatus({ type: "error", message: "Error: " + err.message });
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 text-white font-sans selection:bg-[#D4AF37]/30">
            <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">

                {/* Branding */}
                <div className="text-center mb-10">
                    <div className="w-24 h-24 bg-[#D4AF37]/5 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 border border-[#D4AF37]/20 shadow-[0_0_50px_-12px_rgba(212,175,55,0.3)]">
                        <ShieldCheck size={48} className="text-[#D4AF37]" />
                    </div>
                    <h1 className="text-4xl font-serif italic font-black tracking-tighter">
                        Ohannah <span className="text-[#D4AF37]">Admin</span>
                    </h1>
                </div>

                <div className="bg-zinc-900/40 p-8 rounded-[3.5rem] border border-white/5 backdrop-blur-xl shadow-3xl relative overflow-hidden">
                    <form onSubmit={handleLogin} className="space-y-6 relative z-10">

                        {/* Email */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-5">Admin Email</label>
                            <div className="relative group">
                                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-[#D4AF37]" size={18} />
                                <input
                                    type="email"
                                    placeholder="admin@ohannahcabin.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-zinc-950/50 border border-white/5 rounded-3xl py-6 pl-16 pr-8 text-xs font-bold tracking-widest focus:ring-2 ring-[#D4AF37]/20 transition-all outline-none"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-center px-5">
                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Security Key</label>
                                <button
                                    type="button"
                                    onClick={handleForgotPassword}
                                    className="text-[9px] font-black text-[#D4AF37] uppercase tracking-tighter hover:underline"
                                >
                                    Forgot Password?
                                </button>
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-[#D4AF37]" size={18} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-zinc-950/50 border border-white/5 rounded-3xl py-6 pl-16 pr-14 text-xs font-bold tracking-widest focus:ring-2 ring-[#D4AF37]/20 transition-all outline-none"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {status.message && (
                            <div className={`p-5 rounded-2xl flex items-center gap-4 border ${status.type === "success" ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400" : "bg-red-500/5 border-red-500/20 text-red-400"}`}>
                                <AlertCircle size={20} className="shrink-0" />
                                <p className="text-[10px] font-black uppercase tracking-widest">{status.message}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-6 rounded-3xl font-black uppercase tracking-[0.3em] text-[11px] transition-all flex items-center justify-center gap-3 ${loading ? "bg-zinc-800 text-zinc-600" : "bg-[#D4AF37] hover:bg-[#EBC145] text-zinc-950 shadow-xl shadow-[#D4AF37]/10"}`}
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : <>Verify & Enter <LogIn size={18} /></>}
                        </button>
                    </form>
                </div>


            </div>
        </div>
    );
}