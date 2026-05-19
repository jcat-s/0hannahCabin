import React, { useEffect, useState } from "react";
import { db } from "../shared/lib/firebase";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { X, Eye, HelpCircle, Save, Settings } from "lucide-react";
import type { PricingData } from "../shared/lib/bookingPricing";

// Interface para sa mga bulk rules at text na dating nandoon sa picture
interface PolicyMetadata {
    time: string;
    standardCap: string;
    maxCap: string;
    petFee: number;
}

interface FullPricingPayload {
    pricing: PricingData;
    policies: {
        day: PolicyMetadata;
        evening: PolicyMetadata;
        full: PolicyMetadata;
    };
}

const defaultPricing: PricingData = {
    ohannah: {
        day: { weekday: 5500, weekend: 6000, extraPax: 300 },
        evening: { weekday: 7500, weekend: 8000, extraPax: 300 },
        full: { weekday: 10000, weekend: 11000, extraPax: 500 },
    },
    dream: {
        day: { weekday: 6000, weekend: 7000, extraPax: 300 },
        evening: { weekday: 8000, weekend: 9000, extraPax: 300 },
        full: { weekday: 12000, weekend: 13000, extraPax: 500 },
    },
};

const defaultPolicies = {
    day: { time: "9AM to 5PM", standardCap: "Rate is good for 4 adults and 2 kids (below 3ft)", maxCap: "12 pax max capacity", petFee: 250 },
    evening: { time: "8PM to 7AM", standardCap: "Rate is good for 4 adults and 2 kids (below 3ft)", maxCap: "12 pax max capacity", petFee: 250 },
    full: { time: "9AM to 7AM / 8PM to 5PM", standardCap: "Rate is good for 4 adults and 2 kids (below 3ft)", maxCap: "12 pax max capacity", petFee: 250 }
};

export default function PricingManager() {
    const [pricing, setPricing] = useState<PricingData>(defaultPricing);
    const [policies, setPolicies] = useState(defaultPolicies);
    const [saving, setSaving] = useState(false);
    const [statusMessage, setStatusMessage] = useState<string | null>(null);
    const [showPreviewModal, setShowPreviewModal] = useState(false);

    useEffect(() => {
        if (!db) return;
        const unsub = onSnapshot(doc(db, "metadata", "pricing"), (snap) => {
            if (!snap.exists()) return;
            const data = snap.data();
            if (data.pricing) setPricing(data.pricing as PricingData);
            if (data.policies) setPolicies(data.policies);
        });

        return () => unsub();
    }, []);

    function updateField(cabin: keyof PricingData, stay: keyof PricingData["ohannah"], field: keyof PricingData["ohannah"]["day"], value: number) {
        setPricing((prev) => ({
            ...prev,
            [cabin]: {
                ...prev[cabin],
                [stay]: {
                    ...prev[cabin][stay],
                    [field]: value,
                },
            },
        }));
    }

    function updatePolicy(stayKey: keyof typeof defaultPolicies, field: keyof PolicyMetadata, value: string | number) {
        setPolicies((prev) => ({
            ...prev,
            [stayKey]: {
                ...prev[stayKey],
                [field]: value
            }
        }));
    }

    async function handleSave() {
        if (!db) {
            alert("Database connection context is not active.");
            return;
        }
        setSaving(true);
        try {
            await setDoc(doc(db, "metadata", "pricing"), {
                pricing,
                policies,
                lastUpdated: new Date().toISOString()
            }, { merge: true });

            setStatusMessage("Pricing data and rules successfully updated.");
            setTimeout(() => setStatusMessage(null), 3000);
        } catch (err: any) {
            console.error(err);
            setStatusMessage(`Failed to save: ${err.message || err}`);
            setTimeout(() => setStatusMessage(null), 5000);
        } finally {
            setSaving(false);
        }
    }

    async function handleResetToDefault() {
        if (!db) {
            alert("Database connection context is not active.");
            return;
        }
        if (!confirm("Reset pricing and policy text to defaults? This will overwrite everything.")) return;
        setSaving(true);
        try {
            await setDoc(doc(db, "metadata", "pricing"), { pricing: defaultPricing, policies: defaultPolicies }, { merge: true });
            setPricing(defaultPricing);
            setPolicies(defaultPolicies);
            alert("Pricing matrices reset to system defaults.");
        } catch (err) {
            console.error(err);
            alert("Failed to reset pricing matrices.");
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="p-8 max-w-7xl font-sans text-zinc-900">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 border-b border-zinc-100 pb-4 gap-4">
                <div>
                    <h2 className="text-3xl font-serif italic tracking-tight">Rates & Rules Configuration</h2>
                    <p className="text-xs text-zinc-400 uppercase tracking-widest mt-1">Manage core cabin layouts, standard rules, and pricing modules</p>
                </div>
                <button
                    onClick={() => setShowPreviewModal(true)}
                    className="flex items-center gap-2 px-5 py-3 bg-zinc-950 text-white hover:bg-zinc-800 transition-colors text-xs font-black uppercase tracking-wider rounded-xl self-start sm:self-center shadow-md"
                >
                    <Settings size={14} className="text-[#D4AF37]" /> Edit Rate Card & Rules Modal
                </button>
            </div>

            {/* BASE RATES CONFIGURATION CARD GRIDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {(["ohannah", "dream"] as Array<keyof PricingData>).map((cabin) => (
                    <div key={cabin} className="bg-white p-8 rounded-[2.5rem] border border-zinc-200/60 shadow-sm">
                        <h3 className="font-serif italic text-xl mb-6 text-zinc-950 border-b border-zinc-100 pb-2">
                            {cabin === 'ohannah' ? 'Ohannah Cabin' : 'The Dream by Ohannah'}
                        </h3>
                        {(["day", "evening", "full"] as Array<keyof PricingData["ohannah"]>).map((stay) => (
                            <div key={stay} className="mb-6 last:mb-0">
                                <div className="font-bold text-[10px] uppercase tracking-[0.2em] text-zinc-400 mb-3">{stay} Stay Base Rates</div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="text-[9px] font-black uppercase text-zinc-500 tracking-wider block mb-1">Weekday</label>
                                        <input type="number" value={pricing[cabin][stay].weekday}
                                            onChange={(e) => updateField(cabin, stay, 'weekday', Number(e.target.value))}
                                            className="w-full px-4 py-3 bg-zinc-50 hover:bg-zinc-100/70 focus:bg-white rounded-xl border border-zinc-100 transition-colors outline-none text-xs font-bold" />
                                    </div>
                                    <div>
                                        <label className="text-[9px] font-black uppercase text-zinc-500 tracking-wider block mb-1">Weekend</label>
                                        <input type="number" value={pricing[cabin][stay].weekend}
                                            onChange={(e) => updateField(cabin, stay, 'weekend', Number(e.target.value))}
                                            className="w-full px-4 py-3 bg-zinc-50 hover:bg-zinc-100/70 focus:bg-white rounded-xl border border-zinc-100 transition-colors outline-none text-xs font-bold" />
                                    </div>
                                    <div>
                                        <label className="text-[9px] font-black uppercase text-zinc-500 tracking-wider block mb-1">Extra Pax</label>
                                        <input type="number" value={pricing[cabin][stay].extraPax}
                                            onChange={(e) => updateField(cabin, stay, 'extraPax', Number(e.target.value))}
                                            className="w-full px-4 py-3 bg-zinc-50 hover:bg-zinc-100/70 focus:bg-white rounded-xl border border-zinc-100 transition-colors outline-none text-xs font-bold" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            <div className="mt-8 flex items-center gap-4 border-t border-zinc-100 pt-6">
                <button onClick={handleSave} disabled={saving}
                    className="px-8 py-4 bg-zinc-950 text-white hover:bg-zinc-800 transition-colors text-xs font-black uppercase tracking-[0.2em] rounded-xl shadow-lg disabled:opacity-40">
                    {saving ? 'Processing Sync...' : 'Commit Settings Changes'}
                </button>

                <button onClick={handleResetToDefault} disabled={saving}
                    className="px-6 py-4 bg-zinc-100 text-zinc-600 hover:bg-rose-50 hover:text-rose-600 transition-colors text-xs font-bold uppercase tracking-wider rounded-xl">
                    Reset To System Defaults
                </button>
            </div>

            {statusMessage && (
                <div className="mt-4 text-xs font-bold uppercase tracking-widest text-zinc-500 animate-pulse">{statusMessage}</div>
            )}

            {/* DYNAMIC, FULLY EDITABLE INTERACTIVE PREMIUM MODAL */}
            {showPreviewModal && (
                <div className="fixed inset-0 z-[500] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto" onClick={() => setShowPreviewModal(false)}>
                    <div className="max-w-6xl w-full rounded-[3rem] bg-zinc-950 p-6 md:p-10 border border-white/10 shadow-2xl relative text-white my-8 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>

                        <button onClick={() => setShowPreviewModal(false)} className="absolute top-6 right-6 text-zinc-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-2.5 rounded-full z-10">
                            <X size={16} />
                        </button>

                        <div className="text-center mb-8 border-b border-white/5 pb-6">
                            <div className="inline-flex items-center gap-2 text-[9px] uppercase tracking-[0.3em] bg-[#D4AF37]/10 text-[#D4AF37] px-3 py-1 rounded-full font-bold mb-2">
                                <HelpCircle size={10} /> Live Modal Editor Workspace
                            </div>
                            <h4 className="text-3xl font-serif italic text-[#D4AF37]">Rate Sheet & Rules Settings Matrix</h4>
                            <p className="text-[9px] uppercase tracking-[0.4em] text-zinc-500 font-bold mt-1">Directly edit text boxes below to modify structural policy lines</p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {(['ohannah', 'dream'] as const).map((cabinKey) => (
                                <div key={cabinKey} className="border border-white/5 bg-white/[0.01] rounded-[2rem] p-6 space-y-6">
                                    <div className="text-center border-b border-white/5 pb-4">
                                        <h5 className="font-serif italic text-2xl tracking-wide text-white">
                                            {cabinKey === 'ohannah' ? 'OHANNAH CABIN' : 'THE DREAM BY OHANNAH'}
                                        </h5>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {(['day', 'evening', 'full'] as const).map((stayKey) => {
                                            const rates = pricing[cabinKey][stayKey];
                                            const policy = policies[stayKey];

                                            return (
                                                <div key={stayKey} className="bg-zinc-900/60 border border-white/5 rounded-2xl p-4 flex flex-col justify-between space-y-4">

                                                    {/* Stay & Schedule Header */}
                                                    <div className="text-center border-b border-white/5 pb-2 space-y-1">
                                                        <div className="font-black text-[10px] uppercase tracking-wider text-white">
                                                            {stayKey === 'day' ? 'DAY LOUNGE' : stayKey === 'evening' ? 'EVENING CHILL' : 'FULL STAY'}
                                                        </div>
                                                        <label className="text-[7px] text-zinc-500 block uppercase font-bold tracking-widest">Schedule Time Block</label>
                                                        <input
                                                            type="text"
                                                            value={policy.time}
                                                            onChange={(e) => updatePolicy(stayKey, 'time', e.target.value)}
                                                            className="w-full text-center bg-white/5 rounded px-1.5 py-1 text-[9px] border border-white/5 focus:outline-none focus:border-[#D4AF37] font-mono text-[#D4AF37]"
                                                        />
                                                    </div>

                                                    {/* Core Rules & Capacities Fields */}
                                                    <div className="space-y-2 text-[9px]">
                                                        <div>
                                                            <label className="text-[7px] text-zinc-500 block uppercase font-bold tracking-widest mb-0.5">Standard Capacity Inclusion</label>
                                                            <textarea
                                                                rows={2}
                                                                value={policy.standardCap}
                                                                onChange={(e) => updatePolicy(stayKey, 'standardCap', e.target.value)}
                                                                className="w-full bg-white/5 rounded p-1.5 border border-white/5 focus:outline-none focus:border-[#D4AF37] text-zinc-300 font-medium resize-none leading-normal"
                                                            />
                                                        </div>

                                                        <div>
                                                            <label className="text-[7px] text-zinc-500 block uppercase font-bold tracking-widest mb-0.5">Maximum Capacity Rule</label>
                                                            <input
                                                                type="text"
                                                                value={policy.maxCap}
                                                                onChange={(e) => updatePolicy(stayKey, 'maxCap', e.target.value)}
                                                                className="w-full bg-white/5 rounded p-1.5 border border-white/5 focus:outline-none focus:border-[#D4AF37] text-zinc-300 font-bold"
                                                            />
                                                        </div>

                                                        {/* PET FEE PARAMETER AREA */}
                                                        <div>
                                                            <label className="text-[7px] text-zinc-500 block uppercase font-bold tracking-widest mb-0.5">Pet Charge (₱)</label>
                                                            <input
                                                                type="number"
                                                                value={policy.petFee}
                                                                onChange={(e) => updatePolicy(stayKey, 'petFee', Number(e.target.value))}
                                                                className="w-full bg-white/5 rounded p-1.5 border border-white/5 focus:outline-none focus:border-[#D4AF37] text-zinc-300 font-mono"
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Rate Cards Display (Reflected live from main input fields) */}
                                                    <div className="space-y-2 pt-2 border-t border-white/5 font-mono text-center">
                                                        <div className="bg-white/[0.02] py-1 rounded border border-white/5">
                                                            <div className="text-[7px] uppercase tracking-widest text-zinc-500">Weekday Base</div>
                                                            <div className="text-xs font-bold text-white">₱{rates.weekday.toLocaleString()}</div>
                                                        </div>
                                                        <div className="bg-[#D4AF37]/5 py-1 rounded border border-[#D4AF37]/10">
                                                            <div className="text-[7px] uppercase tracking-widest text-[#D4AF37]">Weekend Base</div>
                                                            <div className="text-xs font-bold text-[#D4AF37]">₱{rates.weekend.toLocaleString()}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Modal Action Controls */}
                        <div className="mt-8 flex justify-center gap-4 border-t border-white/5 pt-6">
                            <button
                                onClick={() => {
                                    handleSave();
                                    setShowPreviewModal(false);
                                }}
                                className="flex items-center gap-2 px-6 py-3 bg-white text-black hover:bg-[#D4AF37] hover:text-white transition-all text-xs font-black uppercase tracking-widest rounded-xl shadow-lg"
                            >
                                <Save size={14} /> Save & Apply All Matrix Settings
                            </button>
                            <button
                                onClick={() => setShowPreviewModal(false)}
                                className="px-5 py-3 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-wider rounded-xl"
                            >
                                Close Workspace Window
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}