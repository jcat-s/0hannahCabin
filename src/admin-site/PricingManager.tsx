import React, { useEffect, useState } from "react";
import { db } from "../shared/lib/firebase";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
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

export default function PricingManager() {
    const [pricing, setPricing] = useState<PricingData>(defaultPricing);
    const [saving, setSaving] = useState(false);
    const [statusMessage, setStatusMessage] = useState<string | null>(null);

    useEffect(() => {
        if (!db) return;
        const unsub = onSnapshot(doc(db, "metadata", "pricing"), (snap) => {
            if (!snap.exists()) return;
            const data = snap.data();
            if (data.pricing) setPricing(data.pricing as PricingData);
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

    async function handleSave() {
        setSaving(true);
        try {
            await setDoc(doc(db, "metadata", "pricing"), {
                pricing,
                lastUpdated: new Date().toISOString()
            }, { merge: true });

            setStatusMessage("Pricing rates successfully updated.");
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
        if (!confirm("Reset pricing to defaults? This will overwrite current pricing data layers.")) return;
        setSaving(true);
        try {
            await setDoc(doc(db, "metadata", "pricing"), { pricing: defaultPricing }, { merge: true });
            setPricing(defaultPricing);
            alert("Pricing metrics reset to system defaults.");
        } catch (err) {
            console.error(err);
            alert("Failed to reset pricing matrices.");
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="p-8 max-w-7xl font-sans text-zinc-900">
            <div className="flex justify-between items-center mb-8 border-b border-zinc-100 pb-4">
                <div>
                    <h2 className="text-3xl font-serif italic tracking-tight">Rates Configuration Manager</h2>
                    <p className="text-xs text-zinc-400 uppercase tracking-widest mt-1">Manage core booking pricing matrix setups</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {(["ohannah", "dream"] as Array<keyof PricingData>).map((cabin) => (
                    <div key={cabin} className="bg-white p-8 rounded-[2.5rem] border border-zinc-200/60 shadow-sm">
                        <h3 className="font-serif italic text-xl mb-6 text-zinc-950 border-b border-zinc-100 pb-2">
                            {cabin === 'ohannah' ? 'Ohannah Cabin' : 'The Dream by Ohannah'}
                        </h3>
                        {(["day", "evening", "full"] as Array<keyof PricingData["ohannah"]>).map((stay) => (
                            <div key={stay} className="mb-6 last:mb-0">
                                <div className="font-bold text-[10px] uppercase tracking-[0.2em] text-zinc-400 mb-3">{stay} Stay Rate Structure</div>
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
                    {saving ? 'Processing Sync...' : 'Commit Rate Changes'}
                </button>

                <button onClick={handleResetToDefault} disabled={saving}
                    className="px-6 py-4 bg-zinc-100 text-zinc-600 hover:bg-rose-50 hover:text-rose-600 transition-colors text-xs font-bold uppercase tracking-wider rounded-xl">
                    Reset Matrix Settings
                </button>
            </div>

            {statusMessage && (
                <div className="mt-4 text-xs font-bold uppercase tracking-widest text-zinc-500 animate-pulse">{statusMessage}</div>
            )}
        </div>
    );
}