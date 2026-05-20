import React, { useEffect, useState } from "react";
import { db } from "../shared/lib/firebase";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { X, Save, Settings, Upload, Link2, Image as ImageIcon, AlertTriangle } from "lucide-react";
import type { PricingData } from "../shared/lib/bookingPricing";

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
    full: { time: "9AM to 7AM / 8PM to 5PM / 3PM to 12NN", standardCap: "Rate is good for 4 adults and 2 kids (below 3ft)", maxCap: "12 pax max capacity", petFee: 250 }
};

export default function PricingManager() {
    const [pricing, setPricing] = useState<PricingData>(defaultPricing);
    const [policies, setPolicies] = useState(defaultPolicies);
    const [rateCardImageUrl, setRateCardImageUrl] = useState<string>("");
    const [inputImageUrl, setInputImageUrl] = useState<string>("");
    const [saving, setSaving] = useState(false);
    const [statusMessage, setStatusMessage] = useState<string | null>(null);

    // Controlled Modal States (Inalis ang native browser windows)
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);

    useEffect(() => {
        if (!db) return;
        const unsub = onSnapshot(doc(db, "metadata", "pricing"), (snap) => {
            if (!snap.exists()) return;
            const data = snap.data();
            if (data.pricing) setPricing(data.pricing as PricingData);
            if (data.policies) setPolicies(data.policies);
            if (data.rateCardImageUrl) {
                setRateCardImageUrl(data.rateCardImageUrl);
                setInputImageUrl(data.rateCardImageUrl);
            }
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

    function updatePolicy(stayKey: keyof typeof defaultPolicies, field: keyof typeof defaultPolicies["day"], value: string | number) {
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
        setStatusMessage("Syncing metadata registry...");
        try {
            await setDoc(doc(db, "metadata", "pricing"), {
                pricing,
                policies,
                rateCardImageUrl: inputImageUrl,
                lastUpdated: new Date().toISOString()
            }, { merge: true });

            setRateCardImageUrl(inputImageUrl);
            setStatusMessage("Pricing data and Rate Card Image successfully updated.");
            setTimeout(() => setStatusMessage(null), 3000);
        } catch (err: any) {
            console.error(err);
            setStatusMessage(`Failed to save: ${err.message || err}`);
            alert(`Error saving to Firestore: ${err.message || err}. Kung local image ito, baka masyadong malaki ang file size.`);
            setTimeout(() => setStatusMessage(null), 5000);
        } finally {
            setSaving(false);
        }
    }

    async function executeResetToDefault() {
        if (!db) return;
        setSaving(true);
        try {
            await setDoc(doc(db, "metadata", "pricing"), { pricing: defaultPricing, policies: defaultPolicies, rateCardImageUrl: "" }, { merge: true });
            setPricing(defaultPricing);
            setPolicies(defaultPolicies);
            setRateCardImageUrl("");
            setInputImageUrl("");
            setShowResetConfirmModal(false);
            setStatusMessage("Pricing matrices reset to system defaults.");
            setTimeout(() => setStatusMessage(null), 3000);
        } catch (err) {
            console.error(err);
            alert("Failed to reset pricing matrices.");
        } finally {
            setSaving(false);
        }
    }

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 850 * 1024) {
                alert("Masyadong malaki ang file size ng picture! Ang Firestore ay may limit na 1MB para sa base64 upload. Paki-compress muna ang image o gumamit ng direct Image URL Link sa tabi.");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setInputImageUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="p-8 max-w-7xl font-sans text-zinc-900 bg-zinc-50/50 min-h-screen">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 border-b border-zinc-200/60 pb-5 gap-4">
                <div>
                    <h2 className="text-3xl font-serif italic tracking-tight text-zinc-950">Rates & Rules Configuration</h2>
                    <p className="text-xs text-zinc-400 uppercase tracking-widest mt-1">Manage backend calculations and live modal flyer images</p>
                </div>
                <button
                    type="button"
                    onClick={() => setShowPreviewModal(true)}
                    className="flex items-center gap-2 px-5 py-3 bg-zinc-950 text-white hover:bg-zinc-800 transition-colors text-xs font-black uppercase tracking-wider rounded-xl self-start sm:self-center shadow-md"
                >
                    <Settings size={14} className="text-[#D4AF37]" /> View & Edit Rate Card Flyer
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {(["ohannah", "dream"] as Array<keyof PricingData>).map((cabin) => (
                    <div key={cabin} className="bg-white p-8 rounded-[2.5rem] border border-zinc-200/60 shadow-sm">
                        <h3 className="font-serif italic text-xl mb-6 text-zinc-950 border-b border-zinc-100 pb-2">
                            {cabin === 'ohannah' ? 'Ohannah Cabin' : 'The Dream by Ohannah'}
                        </h3>
                        {(["day", "evening", "full"] as Array<keyof PricingData["ohannah"]>).map((stay) => (
                            <div key={stay} className="mb-6 last:mb-0">
                                <div className="font-bold text-[10px] uppercase tracking-[0.2em] text-zinc-400 mb-3">{stay} Stay Base Rates (System Auto-Compute)</div>
                                <div className="grid grid-cols-4 gap-4">
                                    <div>
                                        <label className="text-[9px] font-black uppercase text-zinc-500 tracking-wider block mb-1">Weekday</label>
                                        <input type="number" value={pricing[cabin][stay].weekday}
                                            onChange={(e) => updateField(cabin, stay, 'weekday', Number(e.target.value))}
                                            className="w-full px-4 py-3 bg-zinc-50 hover:bg-zinc-100/70 focus:bg-white rounded-xl border border-zinc-100 transition-colors outline-none text-xs font-bold text-zinc-950" />
                                    </div>
                                    <div>
                                        <label className="text-[9px] font-black uppercase text-zinc-500 tracking-wider block mb-1">Weekend</label>
                                        <input type="number" value={pricing[cabin][stay].weekend}
                                            onChange={(e) => updateField(cabin, stay, 'weekend', Number(e.target.value))}
                                            className="w-full px-4 py-3 bg-zinc-50 hover:bg-zinc-100/70 focus:bg-white rounded-xl border border-zinc-100 transition-colors outline-none text-xs font-bold text-zinc-950" />
                                    </div>
                                    <div>
                                        <label className="text-[9px] font-black uppercase text-zinc-500 tracking-wider block mb-1">Extra Pax</label>
                                        <input type="number" value={pricing[cabin][stay].extraPax}
                                            onChange={(e) => updateField(cabin, stay, 'extraPax', Number(e.target.value))}
                                            className="w-full px-4 py-3 bg-zinc-50 hover:bg-zinc-100/70 focus:bg-white rounded-xl border border-zinc-100 transition-colors outline-none text-xs font-bold text-zinc-950" />
                                    </div>
                                    <div>
                                        <label className="text-[9px] font-black uppercase text-zinc-500 tracking-wider block mb-1">Pet</label>
                                        <input type="number" value={policies[stay].petFee}
                                            onChange={(e) => updatePolicy(stay, 'petFee', Number(e.target.value))}
                                            className="w-full px-4 py-3 bg-zinc-50 hover:bg-zinc-100/70 focus:bg-white rounded-xl border border-zinc-100 transition-colors outline-none text-xs font-bold text-zinc-950" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            <div className="mt-8 flex items-center gap-4 border-t border-zinc-200/60 pt-6">
                <button type="button" onClick={handleSave} disabled={saving}
                    className="px-8 py-4 bg-zinc-950 text-white hover:bg-zinc-800 transition-colors text-xs font-black uppercase tracking-[0.2em] rounded-xl shadow-lg disabled:opacity-40">
                    {saving ? 'Processing Sync...' : 'Commit Settings Changes'}
                </button>
                <button type="button" onClick={() => setShowResetConfirmModal(true)} disabled={saving}
                    className="px-6 py-4 bg-zinc-100 text-zinc-600 hover:bg-rose-50 hover:text-rose-600 transition-colors text-xs font-bold uppercase tracking-wider rounded-xl">
                    Reset To System Defaults
                </button>
            </div>

            {statusMessage && (
                <div className="mt-4 text-xs font-bold uppercase tracking-widest text-zinc-500 animate-pulse">{statusMessage}</div>
            )}

            {/* REFACTORED PREMIUM WORKSPACE MODAL (WHITE & LIGHT GREY ELEGANT THEME) */}
            {showPreviewModal && (
                <div className="fixed inset-0 z-[500] bg-zinc-950/40 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto" onClick={() => setShowPreviewModal(false)}>
                    <div className="max-w-3xl w-full rounded-[2.5rem] bg-white p-6 md:p-8 border border-zinc-200/50 shadow-[0_50px_100px_rgba(0,0,0,0.2)] relative text-zinc-900 my-8 max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>

                        <button type="button" onClick={() => setShowPreviewModal(false)} className="absolute top-6 right-6 text-zinc-400 hover:text-zinc-900 transition-colors bg-zinc-100 hover:bg-zinc-200 p-2.5 rounded-full z-10">
                            <X size={16} />
                        </button>

                        <div className="text-center mb-6 border-b border-zinc-100 pb-4">
                            <div className="inline-flex items-center gap-2 text-[9px] uppercase tracking-[0.3em] bg-[#D4AF37]/10 text-[#D4AF37] px-3 py-1 rounded-full font-bold mb-2">
                                <ImageIcon size={10} /> Rate Card Media Center
                            </div>
                            <h4 className="text-2xl font-serif italic text-zinc-950">Live Modal Image Display</h4>
                            <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 font-bold mt-1">Upload an asset or paste an online link to sync client views</p>
                        </div>

                        <div className="space-y-5 overflow-y-auto pr-1 flex-1">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="border border-dashed border-zinc-200 rounded-2xl p-5 bg-zinc-50/50 flex flex-col items-center justify-center text-center group hover:border-[#D4AF37] hover:bg-white transition-all relative cursor-pointer">
                                    <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                                    <Upload size={22} className="text-zinc-400 group-hover:text-[#D4AF37] mb-2 transition-colors" />
                                    <span className="text-xs font-black text-zinc-800 block mb-0.5">Upload New Picture</span>
                                    <span className="text-[9px] text-zinc-400 uppercase tracking-wider font-medium">Click or drag image file here</span>
                                </div>

                                <div className="border border-zinc-100 rounded-2xl p-5 bg-zinc-50/30 flex flex-col justify-center space-y-2">
                                    <label className="text-[9px] text-zinc-500 uppercase tracking-widest font-black flex items-center gap-1">
                                        <Link2 size={10} className="text-[#D4AF37]" /> Image URL Link Alternative
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="https://imgur.com/your-rate-card.jpg"
                                        value={inputImageUrl}
                                        onChange={(e) => setInputImageUrl(e.target.value)}
                                        className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-2.5 text-xs font-mono text-zinc-800 outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
                                    />
                                </div>
                            </div>

                            <div className="border border-zinc-200/60 bg-zinc-50/50 rounded-2xl p-4 min-h-[260px] flex items-center justify-center overflow-hidden">
                                {inputImageUrl ? (
                                    <div className="relative w-full flex flex-col items-center">
                                        <div className="text-[9px] uppercase tracking-widest text-zinc-400 mb-3 font-bold font-mono">--- Live Preview Monitor ---</div>
                                        <img
                                            src={inputImageUrl}
                                            alt="Rate Sheet Premium Preview"
                                            className="max-w-full max-h-[40vh] object-contain rounded-xl border border-zinc-200/80 shadow-md bg-white select-none"
                                        />
                                    </div>
                                ) : (
                                    <div className="text-center space-y-1 py-10">
                                        <p className="text-xs font-serif italic text-zinc-500">No Rate Card image uploaded yet.</p>
                                        <p className="text-[9px] text-zinc-400 uppercase tracking-widest font-bold">Please upload a picture or input a direct URL asset link above.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-3 border-t border-zinc-100 pt-4 shrink-0">
                            <button type="button" onClick={() => setShowPreviewModal(false)} className="px-5 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 transition-colors text-xs font-bold uppercase tracking-wider rounded-xl">
                                Close Workspace
                            </button>
                            <button
                                type="button"
                                onClick={async () => {
                                    await handleSave();
                                    setShowPreviewModal(false);
                                }}
                                className="flex items-center gap-2 px-6 py-3 bg-zinc-950 text-white hover:bg-zinc-800 transition-all text-xs font-black uppercase tracking-widest rounded-xl shadow-md"
                            >
                                <Save size={14} className="text-[#D4AF37]" /> Deploy & Apply Image
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* CUSTOM SYSTEM REGISTRY RESET MODAL (NO LOCALHOST CONFIRM POPUP) */}
            {showResetConfirmModal && (
                <div className="fixed inset-0 z-[600] bg-zinc-950/40 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="max-w-md w-full rounded-3xl bg-white p-6 border border-zinc-200 shadow-2xl relative text-zinc-900 animate-in fade-in zoom-in-95 duration-150" onClick={(e) => e.stopPropagation()}>
                        <div className="flex flex-col items-center text-center p-2">
                            <div className="p-3 bg-rose-50 text-rose-600 rounded-full mb-4">
                                <AlertTriangle size={28} />
                            </div>
                            <h4 className="text-xl font-serif italic text-zinc-950 mb-1">Reset Pricing Matrices?</h4>
                            <p className="text-xs text-zinc-500 leading-relaxed mb-6">
                                This action will overwrite all live custom holiday adjustments, base room fees, and pet charges back to initial default values. This operation cannot be undone.
                            </p>

                            <div className="flex gap-3 w-full">
                                <button
                                    type="button"
                                    onClick={() => setShowResetConfirmModal(false)}
                                    className="flex-1 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 transition-colors text-xs font-bold uppercase tracking-wider rounded-xl"
                                >
                                    Cancel Operation
                                </button>
                                <button
                                    type="button"
                                    onClick={executeResetToDefault}
                                    className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white transition-colors text-xs font-black uppercase tracking-widest rounded-xl shadow-sm"
                                >
                                    Confirm Reset
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}