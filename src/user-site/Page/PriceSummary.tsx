import React, { useMemo, useState, useEffect } from "react";
import { HelpCircle, Receipt, PartyPopper, ShieldCheck, X, Image as ImageIcon } from "lucide-react";
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
    fullStayOption?: "9AM-7AM" | "8PM-5PM" | "3PM-12NN";
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

    const [rateCardImageUrl, setRateCardImageUrl] = useState<string | null>(null);

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
                if (data.rateCardImageUrl) {
                    setRateCardImageUrl(data.rateCardImageUrl);
                } else if (data.rateMatrixUrl) {
                    setRateCardImageUrl(data.rateMatrixUrl);
                }
            }
        }));

        unsubs.push(onSnapshot(doc(db, "metadata", "discounts"), (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                if (Array.isArray(data.discounts)) {
                    setDiscountRules(data.discounts.map((item: any) => ({
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

    // Ginawang structured object para mahiwalay ang styling ng description sa status text
    const discountMessage = useMemo(() => {
        if (!discountCode.trim()) return null;
        if (!selectedDiscount) return { error: "Invalid or inactive promo code. Promo codes are case-sensitive." };
        if (!isUserEligibleForDiscount) return { error: "This promo code is just for selected accounts." };
        if (durationCount < selectedDiscount.minNights) return { error: `Requires at least ${selectedDiscount.minNights} night(s).` };

        return {
            description: selectedDiscount.description || "",
            status: `Applied ${discountLabel} discount.`
        };
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
                    <HelpCircle size={12} className="text-[#D4AF37]" /> View Rates
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

                {/* REFACTORED INLINE FEEDBACK CONTAINER */}
                {discountMessage && (
                    <div className="mb-4 text-[11px] font-medium text-center space-y-1">
                        {discountMessage.error ? (
                            <p className="text-rose-400">{discountMessage.error}</p>
                        ) : (
                            <>
                                {discountMessage.description && (
                                    <p className="text-pink-400 font-semibold">{discountMessage.description}</p>
                                )}
                                <p className="text-emerald-400">{discountMessage.status}</p>
                            </>
                        )}
                    </div>
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

            {showModal && (
                <div className="fixed inset-0 z-[500] bg-zinc-950/40 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto" onClick={() => setShowModal(false)}>
                    <div className="max-w-4xl w-full rounded-[2.5rem] bg-white p-6 md:p-10 border border-zinc-200/50 shadow-[0_50px_100px_rgba(0,0,0,0.25)] relative text-zinc-900 my-8 max-h-[90vh] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>

                        <button type="button" onClick={() => setShowModal(false)} className="absolute top-6 right-6 text-zinc-400 hover:text-zinc-900 transition-colors bg-zinc-100 hover:bg-zinc-200 p-2.5 rounded-full z-10">
                            <X size={16} />
                        </button>

                        <div className="text-center mb-8 border-b border-zinc-100 pb-5 w-full">
                            <h4 className="text-2xl md:text-3xl font-serif italic tracking-tight text-zinc-950">Rates & Inclusions</h4>
                            <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-400 font-bold mt-1.5">Official Reference Matrix</p>
                        </div>

                        <div className="w-full flex justify-center items-center overflow-hidden rounded-2xl bg-zinc-50 border border-zinc-100 relative min-h-[350px] p-2">
                            {rateCardImageUrl ? (
                                <img
                                    src={rateCardImageUrl}
                                    alt="Ohannah Cabin Rate Matrix"
                                    className="w-full h-auto object-contain max-h-[55vh] select-none rounded-xl"
                                    loading="lazy"
                                />
                            ) : (
                                <div className="flex flex-col items-center gap-3 text-zinc-400 p-8 text-center">
                                    <ImageIcon size={36} className="stroke-[1.2] text-[#D4AF37] animate-pulse" />
                                    <p className="text-xs tracking-widest uppercase font-black text-zinc-700">
                                        Loading Rate Matrix Asset...
                                    </p>
                                    <span className="text-[10px] text-zinc-400 max-w-xs normal-case font-medium">
                                        Make sure 'rateCardImageUrl' is properly configured inside the database.
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="mt-6 text-[9px] text-zinc-400 text-center uppercase tracking-[0.2em] font-bold w-full border-t border-zinc-100 pt-4">
                            Rates scale automatically based on selected dates and weekend blocks.
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