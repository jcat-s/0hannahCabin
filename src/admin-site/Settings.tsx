import React, { useState, useEffect } from "react";
import { doc, getDoc, updateDoc, Firestore } from "firebase/firestore";
import { db } from "../shared/lib/firebase";
import {
    Save, DollarSign, Users, Clock,
    CreditCard, ShieldCheck, Home
} from "lucide-react";

export function SystemConfig() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [config, setConfig] = useState<any>({
        pricing: { weekday: 0, weekend: 0, extraPax: 0 },
        limits: { maxAdults: 12, maxKids: 2 },
        payments: { gcashNumber: "", gcashName: "" }
    });

    useEffect(() => {
        const fetchConfig = async () => {
            if (!db) return;
            const docRef = doc(db as Firestore, "settings", "general");
            const snap = await getDoc(docRef);
            if (snap.exists()) setConfig(snap.data());
            setLoading(false);
        };
        fetchConfig();
    }, []);

    const handleSave = async () => {
        if (!db) return;
        setSaving(true);
        try {
            await updateDoc(doc(db as Firestore, "settings", "general"), config);
            alert("Settings updated successfully!");
        } catch (e) {
            console.error(e);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-10 text-[10px] font-black uppercase tracking-[0.5em] text-zinc-400">Loading Terminal Config...</div>;

    return (
        <div className="space-y-12 pb-20">
            <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] border border-zinc-100 shadow-sm sticky top-0 z-10">
                <div>
                    <h3 className="text-xl font-black uppercase tracking-tighter">System Configuration</h3>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Global Rules & Parameters</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-3 px-8 py-4 bg-zinc-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-zinc-800 transition-all disabled:opacity-50 shadow-xl shadow-zinc-200"
                >
                    {saving ? <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Save size={16} />}
                    {saving ? "Saving..." : "Save Changes"}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* --- RATES --- */}
                <section className="bg-white p-10 rounded-[3rem] border border-zinc-100 space-y-8">
                    <div className="flex items-center gap-4 border-b border-zinc-50 pb-6">
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><DollarSign size={20} /></div>
                        <h4 className="font-black uppercase text-[12px] tracking-[0.2em]">Rates & Pricing</h4>
                    </div>
                    <div className="space-y-6">
                        <ConfigInput
                            label="Weekday Rate"
                            value={config.pricing.weekday}
                            onChange={(v: string) => setConfig({ ...config, pricing: { ...config.pricing, weekday: Number(v) } })}
                        />
                        <ConfigInput
                            label="Weekend Rate"
                            value={config.pricing.weekend}
                            onChange={(v: string) => setConfig({ ...config, pricing: { ...config.pricing, weekend: Number(v) } })}
                        />
                        <ConfigInput
                            label="Extra Pax Fee"
                            value={config.pricing.extraPax}
                            onChange={(v: string) => setConfig({ ...config, pricing: { ...config.pricing, extraPax: Number(v) } })}
                        />
                    </div>
                </section>

                {/* --- LIMITS --- */}
                <section className="bg-white p-10 rounded-[3rem] border border-zinc-100 space-y-8">
                    <div className="flex items-center gap-4 border-b border-zinc-50 pb-6">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Users size={20} /></div>
                        <h4 className="font-black uppercase text-[12px] tracking-[0.2em]">Guest Limits</h4>
                    </div>
                    <div className="space-y-6">
                        <ConfigInput
                            label="Max Adults/Pets"
                            value={config.limits.maxAdults}
                            onChange={(v: string) => setConfig({ ...config, limits: { ...config.limits, maxAdults: Number(v) } })}
                        />
                        <ConfigInput
                            label="Max Children"
                            value={config.limits.maxKids}
                            onChange={(v: string) => setConfig({ ...config, limits: { ...config.limits, maxKids: Number(v) } })}
                        />
                    </div>
                </section>

                {/* --- PAYMENTS --- */}
                <section className="bg-white p-10 rounded-[3rem] border border-zinc-100 space-y-8">
                    <div className="flex items-center gap-4 border-b border-zinc-50 pb-6">
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl"><CreditCard size={20} /></div>
                        <h4 className="font-black uppercase text-[12px] tracking-[0.2em]">Payment Details</h4>
                    </div>
                    <div className="space-y-6">
                        <ConfigInput
                            label="GCash Number"
                            type="text"
                            value={config.payments.gcashNumber}
                            onChange={(v: string) => setConfig({ ...config, payments: { ...config.payments, gcashNumber: v } })}
                        />
                        <ConfigInput
                            label="Account Name"
                            type="text"
                            value={config.payments.gcashName}
                            onChange={(v: string) => setConfig({ ...config, payments: { ...config.payments, gcashName: v } })}
                        />
                    </div>
                </section>

                {/* --- INFRA --- */}
                <section className="bg-zinc-950 p-10 rounded-[3rem] text-white space-y-8">
                    <div className="flex items-center gap-4 border-b border-white/10 pb-6">
                        <div className="p-3 bg-zinc-800 text-[#D4AF37] rounded-2xl"><ShieldCheck size={20} /></div>
                        <h4 className="font-black uppercase text-[12px] tracking-[0.2em]">Infrastructure</h4>
                    </div>
                    <div className="space-y-4">
                        <div className="p-6 bg-zinc-900 rounded-2xl border border-white/5">
                            <p className="text-[8px] text-zinc-500 font-black uppercase tracking-widest mb-1">Database</p>
                            <p className="text-[11px] font-bold">Google Firebase Firestore</p>
                        </div>
                        <div className="p-6 bg-zinc-900 rounded-2xl border border-white/5">
                            <p className="text-[8px] text-zinc-500 font-black uppercase tracking-widest mb-1">Status</p>
                            <p className="text-[11px] font-bold text-emerald-400">Live & Encrypted</p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}

// Fixed Props interface to stop TS errors
interface ConfigInputProps {
    label: string;
    value: string | number;
    onChange: (v: string) => void;
    type?: string;
}

function ConfigInput({ label, value, onChange, type = "number" }: ConfigInputProps) {
    return (
        <div className="group">
            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-2 block group-focus-within:text-[#D4AF37] transition-colors">
                {label}
            </label>
            <input
                type={type}
                value={value}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] transition-all"
            />
        </div>
    );
}