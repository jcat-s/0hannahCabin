import React, { useMemo, useState, useEffect } from "react";
import { HelpCircle, Receipt, PartyPopper, ShieldCheck, X } from "lucide-react";
import { format, parseISO } from "date-fns";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../shared/lib/firebase";
import { useAuth } from "../../shared/context/AuthContext";
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
    onSubmit: (total: number, discountCode?: string) => void;
}

type DiscountRule = {
    code: string;
    description?: string;
    type: "fixed" | "percent";
    value: number;
    active: boolean;
    minNights: number;
    allowedRecipients: string[];
};

const defaultPolicies: Record<StayType, PolicyMetadata> = {
    day: { time: "9AM to 5PM", standardCap: "Rate is good for 4 adults and 2 kids (below 3ft)", maxCap: "12 pax max capacity", petFee: 250 },
    evening: { time: "8PM to 7AM", standardCap: "Rate is good for 4 adults and 2 kids (below 3ft)", maxCap: "12 pax max capacity", petFee: 250 },
    full: { time: "9AM to 7AM / 8PM to 5PM / 3PM to 12NN", standardCap: "Rate is good for 4 adults and 2 kids (below 3ft)", maxCap: "12 pax max capacity", petFee: 250 }
};

export function PriceSummary({
    cabin, stayType, fullStayOption, guests, kids, pets, checkIn, checkOut,
    specialOccasion, durationCount, canBookCore, submitting, onSubmit
}: PriceSummaryProps) {
    const { user } = useAuth();
    const [showModal, setShowModal] = useState(false);
    const [dbHolidays, setDbHolidays] = useState<string[]>([]);
    const [pricingConfig, setPricingConfig] = useState<PricingData | null>(null);
    const [policies, setPolicies] = useState<Record<StayType, PolicyMetadata>>(defaultPolicies);
    const [discountRules, setDiscountRules] = useState<DiscountRule[]>([]);
    const [discountCode, setDiscountCode] = useState("");

    const currentPolicy = useMemo(() => {
        return policies[stayType] || defaultPolicies[stayType];
    }, [policies, stayType]);

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

        unsubs.push(onSnapshot(doc(db, "metadata", "discounts"), (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                if (Array.isArray(data.discounts)) {
                    setDiscountRules(data.discounts.map((item: any) => ({
                        // Tinanggal ang .toUpperCase() para mapanatili ang eksaktong pagkakasulat (case-sensitive)
                        code: String(item.code || "").trim(),
                        description: String(item.description || ""),
                        type: item.type === "fixed" ? "fixed" : "percent",
                        value: Number(item.value) || 0,
                        active: Boolean(item.active),
                        minNights: Number(item.minNights) || 1,
                        allowedRecipients: Array.isArray(item.allowedRecipients)
                            ? item.allowedRecipients.map((entry: any) => String(entry || "").trim().toLowerCase())
                            : [],
                    })));
                }
            }
        }));

        return () => unsubs.forEach((u) => typeof u === 'function' && u());
    }, []);

    const pricing = useMemo(() => {
        return calculateTotal(
            cabin,
            stayType,
            guests,
            pets,
            checkIn,
            checkOut,
            dbHolidays,
            pricingConfig || undefined,
            currentPolicy?.petFee || 250
        );
    }, [cabin, stayType, guests, pets, checkIn, checkOut, dbHolidays, pricingConfig, currentPolicy]);

    const selectedDiscount = useMemo(() => {
        // Tinanggal din dito ang .toUpperCase() para itugma sa kung ano mismo ang tinype ng user
        const normalized = discountCode.trim();
        return discountRules.find((rule) => rule.active && rule.code === normalized) || null;
    }, [discountCode, discountRules]);

    const isUserEligibleForDiscount = useMemo(() => {
        if (!selectedDiscount) return false;
        if (!selectedDiscount.allowedRecipients || selectedDiscount.allowedRecipients.length === 0) return true;
        if (!user) return false;

        const userEmail = String(user.email || "").trim().toLowerCase();
        const userName = String(user.displayName || "").trim().toLowerCase();

        return selectedDiscount.allowedRecipients.some((recipient) => {
            return userEmail === recipient || userName.includes(recipient) || recipient.includes(userEmail);
        });
    }, [selectedDiscount, user]);

    const discountAmount = useMemo(() => {
        if (!selectedDiscount || !isUserEligibleForDiscount) return 0;
        if (durationCount < selectedDiscount.minNights) return 0;

        const subtotal = pricing.grandTotal;
        if (selectedDiscount.type === "percent") {
            return Math.round(subtotal * (selectedDiscount.value / 100));
        }

        return Math.min(Math.max(0, selectedDiscount.value), subtotal);
    }, [pricing.grandTotal, selectedDiscount, durationCount, isUserEligibleForDiscount]);

    const discountLabel = selectedDiscount ? `${selectedDiscount.value}${selectedDiscount.type === "percent" ? "%" : ""}` : "";
    const finalTotal = Math.max(0, pricing.grandTotal - discountAmount);

    const discountMessage = useMemo(() => {
        if (!discountCode.trim()) return "";
        if (!selectedDiscount) return "Invalid or inactive promo code. Promo codes are case-sensitive.";
        if (!isUserEligibleForDiscount) return "This promo code is restricted to authorized admin/staff accounts.";
        if (durationCount < selectedDiscount.minNights) return `Requires at least ${selectedDiscount.minNights} night(s).`;
        return `Applied ${discountLabel} discount. ${selectedDiscount.description ? `(${selectedDiscount.description})` : ''}`;
    }, [discountCode, selectedDiscount, durationCount, discountLabel, isUserEligibleForDiscount]);

    const stayLabels = {
        day: { label: "Day Lounge", time: "9AM - 5PM" },
        evening: { label: "Evening Chill", time: "8PM - 7AM" },
        full: { label: "Full Stay", time: "9AM-7AM / 8PM-5PM / 3PM-12NN" }
    };

    return (
        <div className="bg-zinc-950 rounded-[2.5rem] md:rounded-[3.5rem] p-6 md:p-10 text-white sticky top-32 border border-white/5 shadow-[0_40px_100px_rgba(0,0,0,0.6)] font-sans">
            <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-6">
                <div className="flex items-center gap-3">
                    <Receipt size={22} className="text-[#D4AF37]" />
                    <h3 className="text-xl font-serif italic tracking-tight">Price Summary</h3>
                </div>
                <button
                    type="button"
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors border border-white/10 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/5"
                >
                    <HelpCircle size={12} className="text-[#D4AF37]" /> View Rate Matrix
                </button>
            </div>

            <div className="space-y-5 mb-10">
                <SummaryRow label="Property" value={cabin === 'ohannah' ? 'Ohannah Cabin' : 'The Dream'} />

                <div className="grid grid-cols-2 gap-4 py-2 border-y border-white/5">
                    <div className="flex flex-col">
                        <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">Check-in</span>
                        <span className="text-xs font-bold">{checkIn ? format(parseISO(checkIn), "MMM dd, yyyy") : "---"}</span>
                    </div>
                    <div className="flex flex-col text-right">
                        <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">Check-out</span>
                        <span className="text-xs font-bold">{checkOut ? format(parseISO(checkOut), "MMM dd, yyyy") : "---"}</span>
                    </div>
                </div>

                <SummaryRow
                    label="Stay"
                    value={`${durationCount} ${stayLabels[stayType]?.label || stayType}${stayType === 'full' && fullStayOption ? ` (${fullStayOption})` : ''}`}
                />

                <div className="pt-2 space-y-3">
                    <SummaryRow label="Adults" value={`${guests} Pax`} />
                    {kids > 0 && <SummaryRow label="Kids (Free)" value={`${kids} Pax`} />}
                    {pets > 0 && <SummaryRow label="Pets" value={`${pets} Pax`} />}
                </div>

                {specialOccasion && (
                    <div className="mt-4 bg-white/5 p-3 rounded-xl border border-white/5 flex items-center gap-2">
                        <PartyPopper size={12} className="text-[#D4AF37]" />
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">Occasion: {specialOccasion}</span>
                    </div>
                )}
            </div>

            <div className="bg-white/5 rounded-[2rem] p-6 md:p-8 text-center border border-white/5 mb-8">
                <label className="block text-left text-[9px] font-black uppercase tracking-[0.4em] text-zinc-500 mb-4">Promo Code</label>
                <div className="flex gap-3 items-center justify-center mb-4">
                    <input
                        type="text"
                        value={discountCode}
                        onChange={(e) => setDiscountCode(e.target.value)}
                        placeholder="Enter promo code"
                        className="w-full max-w-xs px-4 py-3 rounded-2xl border border-white/10 bg-zinc-950 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] text-sm tracking-wider"
                    />
                    <span className={`px-3 py-2.5 rounded-2xl text-[10px] font-black uppercase whitespace-nowrap ${discountAmount > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-zinc-900 text-zinc-400'}`}>
                        {discountAmount > 0 ? 'Applied' : 'No code'}
                    </span>
                </div>
                {discountMessage && (
                    <p className={`text-[11px] mb-4 font-medium ${discountAmount > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{discountMessage}</p>
                )}
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">Total Amount</span>
                <div className="text-4xl md:text-5xl font-serif italic text-[#D4AF37] mt-2">
                    ₱{finalTotal.toLocaleString()}
                </div>
                <div className="mt-4 flex flex-col gap-1 text-[9px] text-zinc-500 uppercase font-bold tracking-widest text-left border-t border-white/5 pt-3">
                    <div className="flex justify-between"><span>Base Price:</span> <span className="text-zinc-300">₱{(pricing?.basePrice || 0).toLocaleString()}</span></div>
                    {(pricing?.extraPaxTotal || 0) > 0 && <div className="flex justify-between"><span>Extra Pax:</span> <span className="text-zinc-300">+₱{pricing.extraPaxTotal.toLocaleString()}</span></div>}
                    {(pricing?.petTotal || 0) > 0 && <div className="flex justify-between"><span>Pet Fee ({pets}x):</span> <span className="text-zinc-300">+₱{pricing.petTotal.toLocaleString()}</span></div>}
                    {discountAmount > 0 && <div className="flex justify-between text-emerald-400"><span>Discount:</span> <span>-₱{discountAmount.toLocaleString()}</span></div>}
                </div>
            </div>

            <div className="mb-8 flex items-start gap-3 bg-white/5 p-4 rounded-2xl border border-white/5">
                <ShieldCheck size={16} className="text-[#D4AF37] shrink-0" />
                <p className="text-[9px] text-zinc-400 uppercase tracking-widest leading-relaxed">
                    Note: Refundable <b className="text-white">₱2,000</b> security deposit to be settled upon check-in.
                </p>
            </div>

            <button
                type="button"
                disabled={!canBookCore || submitting}
                onClick={() => onSubmit(finalTotal, discountCode.trim())}
                className="w-full py-5 rounded-2xl bg-white text-black font-black uppercase tracking-[0.3em] text-[11px] hover:bg-[#D4AF37] hover:text-white transition-all disabled:opacity-20 active:scale-95 shadow-xl"
            >
                {submitting ? "Processing..." : "Confirm Booking"}
            </button>
            {!canBookCore && (
                <p className="mt-4 text-[10px] text-rose-300 uppercase tracking-[0.2em] text-center leading-relaxed">
                    Select an available slot and make sure your dates are valid before booking.
                </p>
            )}

            {/* RATES & INCLUSIONS MODAL */}
            {showModal && (
                <div className="fixed inset-0 z-[500] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto" onClick={() => setShowModal(false)}>
                    <div className="max-w-6xl w-full rounded-[2rem] md:rounded-[3rem] bg-zinc-950 p-6 md:p-10 border border-white/10 shadow-2xl relative text-white my-8 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>

                        <button type="button" onClick={() => setShowModal(false)} className="absolute top-6 right-6 text-zinc-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-2.5 rounded-full z-10">
                            <X size={16} />
                        </button>

                        <div className="text-center mb-10 border-b border-white/5 pb-6">
                            <h4 className="text-2xl md:text-3xl font-serif italic text-[#D4AF37]">Rates & Inclusions Matrix</h4>
                            <p className="text-[9px] uppercase tracking-[0.4em] text-zinc-500 font-bold mt-1">Live Management System Policies</p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {(['ohannah', 'dream'] as const).map((cabinKey) => (
                                <div key={cabinKey} className="border border-white/5 bg-white/[0.01] rounded-[2rem] p-4 md:p-6 space-y-6">
                                    <div className="text-center border-b border-white/5 pb-4">
                                        <h5 className="font-serif italic text-xl md:text-2xl tracking-wide text-white">
                                            {cabinKey === 'ohannah' ? 'OHANNAH CABIN' : 'THE DREAM BY OHANNAH'}
                                        </h5>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {(['day', 'evening', 'full'] as const).map((stayKey) => {
                                            const currentCabinObj = pricingConfig ? pricingConfig[cabinKey] : null;
                                            const rates = currentCabinObj ? currentCabinObj[stayKey] : { weekday: 0, weekend: 0, extraPax: 0 };
                                            const policy = policies[stayKey] || defaultPolicies[stayKey];

                                            return (
                                                <div key={stayKey} className="bg-zinc-900/60 border border-white/5 rounded-2xl p-4 flex flex-col justify-between space-y-4">
                                                    <div className="text-center border-b border-white/5 pb-2">
                                                        <div className="font-black text-[10px] uppercase tracking-wider text-white">
                                                            {stayKey === 'day' ? 'DAY LOUNGE' : stayKey === 'evening' ? 'EVENING CHILL' : 'FULL STAY'}
                                                        </div>
                                                        <div className="text-[9px] text-[#D4AF37] font-mono mt-0.5">({policy?.time || ''})</div>
                                                    </div>

                                                    <ul className="text-[10px] text-zinc-400 space-y-2 list-none pl-0 font-medium leading-relaxed">
                                                        <li className="flex items-start gap-1">
                                                            <span className="text-[#D4AF37] mt-0.5 shrink-0">▪</span> <span>{policy?.standardCap}</span>
                                                        </li>
                                                        <li className="flex items-start gap-1 text-zinc-500">
                                                            <span className="text-zinc-600 mt-0.5 shrink-0">▪</span> <span>No towels included</span>
                                                        </li>
                                                        <li className="flex items-start gap-1">
                                                            <span className="text-[#D4AF37] mt-0.5 shrink-0">▪</span> <span>+₱{(rates?.extraPax || 0).toLocaleString()} per excess pax</span>
                                                        </li>
                                                        <li className="flex items-start gap-1">
                                                            <span className="text-[#D4AF37] mt-0.5 shrink-0">▪</span> <span>+₱{(policy?.petFee || 250).toLocaleString()} per pet charge</span>
                                                        </li>
                                                        <li className="flex items-start gap-1 text-zinc-300 font-bold">
                                                            <span className="text-zinc-500 mt-0.5 shrink-0">▪</span> <span>{policy?.maxCap}</span>
                                                        </li>
                                                    </ul>

                                                    <div className="space-y-2 pt-2 border-t border-white/5 font-mono text-center">
                                                        <div className="bg-white/[0.02] py-2 rounded-lg border border-white/5">
                                                            <div className="text-[8px] uppercase tracking-widest text-zinc-500">Weekday</div>
                                                            <div className="text-xs font-bold text-white">₱{(rates?.weekday || 0).toLocaleString()}</div>
                                                        </div>
                                                        <div className="bg-[#D4AF37]/5 py-2 rounded-lg border border-[#D4AF37]/10">
                                                            <div className="text-[8px] uppercase tracking-widest text-[#D4AF37]">Weekend / Holiday</div>
                                                            <div className="text-xs font-bold text-[#D4AF37]">₱{(rates?.weekend || 0).toLocaleString()}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 text-[9px] text-zinc-500 text-center uppercase tracking-widest border-t border-white/5 pt-4">
                            Rates scale automatically for Fri/Sat/Sun and holidays listed in the schedule.
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between items-center gap-4">
            <span className="text-zinc-500 font-black uppercase text-[10px] tracking-[0.2em] shrink-0">{label}</span>
            <span className="font-bold text-zinc-100 text-[11px] uppercase text-right truncate">{value}</span>
        </div>
    );
}