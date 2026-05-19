import React, { useMemo, useState, useEffect } from "react";
import { HelpCircle, Receipt, PartyPopper, ShieldCheck, X } from "lucide-react";
import { format, parseISO } from "date-fns";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../shared/lib/firebase";
import { CabinId, StayType, calculateTotal, PricingData } from "../../shared/lib/bookingPricing";

interface PolicyMetadata {
    time: string;
    standardCap: string;
    maxCap: string;
    petFee: number;
}

interface PriceSummaryProps {
    cabin: CabinId;
    stayType: StayType;
    fullStayOption?: "9AM-7AM" | "8PM-5PM";
    guests: number;
    kids: number;
    pets: number;
    checkIn: string;
    checkOut: string;
    specialOccasion?: string;
    durationCount: number;
    canBookCore: boolean;
    submitting: boolean;
    onSubmit: (total: number) => void;
}

const defaultPolicies = {
    day: { time: "9AM to 5PM", standardCap: "Rate is good for 4 adults and 2 kids (below 3ft)", maxCap: "12 pax max capacity", petFee: 250 },
    evening: { time: "8PM to 7AM", standardCap: "Rate is good for 4 adults and 2 kids (below 3ft)", maxCap: "12 pax max capacity", petFee: 250 },
    full: { time: "9AM to 7AM / 8PM to 5PM", standardCap: "Rate is good for 4 adults and 2 kids (below 3ft)", maxCap: "12 pax max capacity", petFee: 250 }
};

export function PriceSummary({
    cabin, stayType, fullStayOption, guests, kids, pets, checkIn, checkOut,
    specialOccasion, durationCount, canBookCore, submitting, onSubmit
}: PriceSummaryProps) {
    const [showModal, setShowModal] = useState(false);
    const [dbHolidays, setDbHolidays] = useState<string[]>([]);
    const [pricingConfig, setPricingConfig] = useState<PricingData | null>(null);
    const [policies, setPolicies] = useState(defaultPolicies);

    useEffect(() => {
        if (!db) return;
        const unsubs: Array<() => void> = [];

        unsubs.push(onSnapshot(doc(db, "metadata", "holidays"), (docSnap) => {
            if (docSnap.exists()) {
                setDbHolidays(docSnap.data().dates || []);
            }
        }));

        unsubs.push(onSnapshot(doc(db, "metadata", "pricing"), (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                if (data.pricing) setPricingConfig(data.pricing);
                if (data.policies) setPolicies(data.policies);
            }
        }));

        return () => unsubs.forEach((u) => typeof u === 'function' && u());
    }, []);

    const pricing = useMemo(() =>
        calculateTotal(cabin, stayType, guests, pets, checkIn, checkOut, dbHolidays, pricingConfig || undefined),
        [cabin, stayType, guests, pets, checkIn, checkOut, dbHolidays, pricingConfig]
    );

    const stayLabels = {
        day: { label: "Day Lounge", time: "9AM - 5PM" },
        evening: { label: "Evening Chill", time: "8PM - 7AM" },
        full: { label: "Full Stay", time: "9AM-7AM / 8PM-5PM / 3PM-12NN" }
    };

    return (
        <div className="bg-zinc-950 rounded-[3.5rem] p-10 text-white sticky top-32 border border-white/5 shadow-[0_40px_100px_rgba(0,0,0,0.6)] font-sans">
            <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-6">
                <div className="flex items-center gap-3">
                    <Receipt size={22} className="text-[#D4AF37]" />
                    <h3 className="text-xl font-serif italic tracking-tight">Price Summary</h3>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors border border-white/10 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-white/5"
                >
                    <HelpCircle size={12} className="text-[#D4AF37]" /> View Rate Matrix
                </button>
            </div>

            <div className="space-y-5 mb-10">
                <SummaryRow label="Property" value={cabin === 'ohannah' ? 'Ohannah Cabin' : 'The Dream'} />

                <div className="grid grid-cols-2 gap-4 py-2 border-y border-white/5">
                    <div className="flex flex-col">
                        <span className="text-[8px] text-zinc-500 font-black uppercase tracking-widest">Check-in</span>
                        <span className="text-[10px] font-bold">{checkIn ? format(parseISO(checkIn), "MMM dd, yyyy") : "---"}</span>
                    </div>
                    <div className="flex flex-col text-right">
                        <span className="text-[8px] text-zinc-500 font-black uppercase tracking-widest">Check-out</span>
                        <span className="text-[10px] font-bold">{checkOut ? format(parseISO(checkOut), "MMM dd, yyyy") : "---"}</span>
                    </div>
                </div>

                <SummaryRow
                    label="Stay"
                    value={`${durationCount} ${stayLabels[stayType].label}${stayType === 'full' && fullStayOption ? ` (${fullStayOption})` : ''}`}
                />

                <div className="pt-2 space-y-3">
                    <SummaryRow label="Adults" value={`${guests} Pax`} />
                    {kids > 0 && <SummaryRow label="Kids (Free)" value={`${kids} Pax`} />}
                    {pets > 0 && <SummaryRow label="Pets" value={`${pets} Pax`} />}
                </div>

                {specialOccasion && (
                    <div className="mt-4 bg-white/5 p-3 rounded-xl border border-white/5 flex items-center gap-2">
                        <PartyPopper size={12} className="text-[#D4AF37]" />
                        <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-tighter">Occasion: {specialOccasion}</span>
                    </div>
                )}
            </div>

            <div className="bg-white/5 rounded-[2.5rem] p-8 text-center border border-white/5 mb-8">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">Total Amount</span>
                <div className="text-5xl font-serif italic text-[#D4AF37] mt-2">
                    ₱{(pricing?.grandTotal || 0).toLocaleString()}
                </div>
                <div className="mt-4 flex flex-col gap-1 text-[8px] text-zinc-500 uppercase font-bold tracking-widest">
                    <span>Base: ₱{(pricing?.basePrice || 0).toLocaleString()}</span>
                    {(pricing?.extraPaxTotal || 0) > 0 && <span>Extra Pax: +₱{pricing.extraPaxTotal.toLocaleString()}</span>}
                    {(pricing?.petTotal || 0) > 0 && <span>Pets: +₱{pricing.petTotal.toLocaleString()}</span>}
                </div>
            </div>

            <div className="mb-8 flex items-start gap-3 bg-white/5 p-4 rounded-2xl border border-white/5">
                <ShieldCheck size={16} className="text-[#D4AF37] shrink-0" />
                <p className="text-[8px] text-zinc-400 uppercase tracking-widest leading-relaxed">
                    Note: Refundable <b>₱2,000</b> security deposit to be settled upon check-in.
                </p>
            </div>

            <button
                disabled={!canBookCore || submitting}
                onClick={() => onSubmit(pricing.grandTotal)}
                className="w-full py-6 rounded-2xl bg-white text-black font-black uppercase tracking-[0.3em] text-[11px] hover:bg-[#D4AF37] hover:text-white transition-all disabled:opacity-20 active:scale-95 shadow-xl"
            >
                {submitting ? "Processing..." : "Confirm Booking"}
            </button>

            {/* DESIGNED DYNAMIC MODAL GRID - NO MORE IMAGE */}
            {showModal && (
                <div className="fixed inset-0 z-[500] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto" onClick={() => setShowModal(false)}>
                    <div className="max-w-6xl w-full rounded-[3rem] bg-zinc-950 p-6 md:p-10 border border-white/10 shadow-2xl relative text-white my-8 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>

                        <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 text-zinc-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-2.5 rounded-full z-10">
                            <X size={16} />
                        </button>

                        <div className="text-center mb-10 border-b border-white/5 pb-6">
                            <h4 className="text-3xl font-serif italic text-[#D4AF37]">Rates & Inclusions Matrix</h4>
                            <p className="text-[9px] uppercase tracking-[0.4em] text-zinc-500 font-bold mt-1">Live Management System Policies</p>
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
                                            // Fallback sa static rules kapag naglo-load pa ang pricing database configuration matrix
                                            const currentCabinObj = pricingConfig ? pricingConfig[cabinKey] : null;
                                            const rates = currentCabinObj ? currentCabinObj[stayKey] : { weekday: 0, weekend: 0, extraPax: 0 };
                                            const policy = policies[stayKey] || defaultPolicies[stayKey];

                                            return (
                                                <div key={stayKey} className="bg-zinc-900/60 border border-white/5 rounded-2xl p-4 flex flex-col justify-between space-y-4">
                                                    <div className="text-center border-b border-white/5 pb-2">
                                                        <div className="font-black text-[10px] uppercase tracking-wider text-white">
                                                            {stayKey === 'day' ? 'DAY LOUNGE' : stayKey === 'evening' ? 'EVENING CHILL' : 'FULL STAY'}
                                                        </div>
                                                        <div className="text-[8px] text-[#D4AF37] font-mono mt-0.5">({policy.time})</div>
                                                    </div>

                                                    <ul className="text-[9px] text-zinc-400 space-y-1.5 list-none pl-0 font-medium">
                                                        <li className="flex items-start gap-1">
                                                            <span className="text-[#D4AF37] mt-0.5">▪</span> {policy.standardCap}
                                                        </li>
                                                        <li className="flex items-start gap-1 text-zinc-500">
                                                            <span className="text-zinc-600 mt-0.5">▪</span> No towels included
                                                        </li>
                                                        <li className="flex items-start gap-1">
                                                            <span className="text-[#D4AF37] mt-0.5">▪</span> +₱{rates.extraPax.toLocaleString()} per excess pax
                                                        </li>
                                                        <li className="flex items-start gap-1">
                                                            <span className="text-[#D4AF37] mt-0.5">▪</span> +₱{policy.petFee.toLocaleString()} per pet charge
                                                        </li>
                                                        <li className="flex items-start gap-1 text-zinc-300 font-bold">
                                                            <span className="text-zinc-500 mt-0.5">▪</span> {policy.maxCap}
                                                        </li>
                                                    </ul>

                                                    <div className="space-y-2 pt-2 border-t border-white/5 font-mono text-center">
                                                        <div className="bg-white/[0.02] py-2 rounded-lg border border-white/5">
                                                            <div className="text-[8px] uppercase tracking-widest text-zinc-500">Weekday</div>
                                                            <div className="text-sm font-bold text-white">₱{rates.weekday.toLocaleString()}</div>
                                                        </div>
                                                        <div className="bg-[#D4AF37]/5 py-2 rounded-lg border border-[#D4AF37]/10">
                                                            <div className="text-[8px] uppercase tracking-widest text-[#D4AF37]">Weekend</div>
                                                            <div className="text-sm font-bold text-[#D4AF37]">₱{rates.weekend.toLocaleString()}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 text-[8px] text-zinc-500 text-center uppercase tracking-widest border-t border-white/5 pt-4">
                            Rates scale automatically based on holiday lists and weekend peak scheduling slots.
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between items-center">
            <span className="text-zinc-500 font-black uppercase text-[9px] tracking-[0.2em]">{label}</span>
            <span className="font-bold text-zinc-100 text-[10px] uppercase">{value}</span>
        </div>
    );
}