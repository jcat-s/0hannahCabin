import React, { useState, useMemo } from "react";
import { Image as ImageIcon, X } from "lucide-react";

// Updated Pricing Data
const PRICING_DATA = {
    ohannah: {
        day: { weekday: 5500, weekend: 6000 },
        evening: { weekday: 7500, weekend: 8000 },
        full: { weekday: 10000, weekend: 11000 },
    },
    dream: {
        day: { weekday: 6000, weekend: 7000 },
        evening: { weekday: 8000, weekend: 9000 },
        full: { weekday: 12000, weekend: 13000 },
    },
};

interface PriceSummaryProps {
    cabin: "ohannah" | "dream";
    stayType: "day" | "evening" | "full";
    guests: number;
    pets: number;
    durationCount: number;
    isHighRate: boolean;
    canBookCore: boolean;
    submitting: boolean;
    selectedColor: string;
    isDateRangeValid: boolean;
    onSubmit: (totalPrice: number) => void;
}

export function PriceSummary({
    cabin, stayType, guests, pets, durationCount, isHighRate,
    canBookCore, submitting, selectedColor, isDateRangeValid, onSubmit,
}: PriceSummaryProps) {
    const [showModal, setShowModal] = useState(false);

    // Dynamic Calculation Logic
    const totalPrice = useMemo(() => {
        const base = PRICING_DATA[cabin][stayType][isHighRate ? "weekend" : "weekday"];

        // Extra Pax: Full stay = 500, Sessions = 300
        const extraPaxRate = stayType === "full" ? 500 : 300;
        const extraPaxTotal = guests > 4 ? (guests - 4) * extraPaxRate : 0;

        // Pet Fee: Ohannah (150/250) vs Dream (250/500)
        let petRate = 0;
        if (cabin === "ohannah") {
            petRate = stayType === "full" ? 250 : 150;
        } else {
            petRate = stayType === "full" ? 500 : 250;
        }

        return (base * durationCount) + extraPaxTotal + (pets * petRate);
    }, [cabin, stayType, guests, pets, durationCount, isHighRate]);

    return (
        <>
            {/* MAIN SUMMARY CARD (Original Structure) */}
            <div className="bg-zinc-950 rounded-[3.5rem] p-12 text-white sticky top-32 shadow-[0_40px_100px_rgba(0,0,0,0.4)] border border-white/5 overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-[#D4AF37]/10 blur-[80px] rounded-full -mr-20 -mt-20" />

                <div className="flex justify-between items-center mb-12 border-b border-white/10 pb-8">
                    <h3 className="text-lg font-serif italic" style={{ fontFamily: "'Playfair Display', serif" }}>Price Summary</h3>
                    <button
                        onClick={() => setShowModal(true)}
                        className="p-2 hover:bg-white/10 rounded-full text-[#D4AF37] transition-all active:scale-90"
                    >
                        <ImageIcon size={20} />
                    </button>
                </div>

                <div className="space-y-6 mb-12">
                    <SummaryRow label="Property" value={cabin === 'ohannah' ? 'Ohannah Cabin' : 'The Dream by Ohannah'} />
                    <SummaryRow
                        label="Stay Plan"
                        value={stayType === "full" ? "FULL STAY" : stayType === "day" ? "DAY LOUNGE" : "EVENING CHILL"}
                    />
                    <SummaryRow label="Pax Details" value={`${guests} Pax / ${pets} ${pets === 1 ? 'Pet' : 'Pets'}`} />
                    <SummaryRow label="Total Time" value={`${durationCount} ${stayType === 'full' ? 'Night(s)' : 'Session'}`} />
                </div>

                <div className="bg-white/5 rounded-[2.5rem] p-10 mb-12 border border-white/5 text-center">
                    <span className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em]">Total Amount</span>
                    <div className="text-5xl font-serif italic mt-4 text-[#D4AF37]">
                        ₱{totalPrice.toLocaleString()}
                    </div>
                </div>

                <button
                    disabled={!canBookCore || submitting}
                    onClick={() => onSubmit(totalPrice)}
                    className={`w-full py-6 rounded-2xl font-black text-[11px] tracking-[0.4em] uppercase shadow-2xl transition-all ${(!canBookCore)
                        ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed opacity-50'
                        : 'bg-white text-zinc-950 hover:bg-[#D4AF37] hover:text-white active:scale-[0.98]'
                        }`}
                >
                    {submitting ? "Processing..." : !selectedColor ? "Select Slot Color" : !isDateRangeValid ? "Date Taken" : "Confirm Booking"}
                </button>
            </div>

            {/* REVISED MODAL (Clean Full View) */}
            {showModal && (
                <div
                    className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-zinc-950/90 backdrop-blur-xl animate-in fade-in duration-300"
                    onClick={() => setShowModal(false)}
                >
                    {/* Modernized Close Button */}
                    <button
                        onClick={() => setShowModal(false)}
                        className="absolute top-8 right-8 z-[210] p-3 text-white hover:text-[#D4AF37] transition-all"
                    >
                        <X size={32} />
                    </button>

                    {/* Image container (maximized) */}
                    <div
                        className="w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-[1.5rem]"
                        onClick={e => e.stopPropagation()}
                    >
                        <img
                            src="/section/price.jpg"
                            alt="Rates Sheet"
                            className="w-full h-auto block rounded-[1.5rem]"
                        />
                    </div>
                </div>
            )}
        </>
    );
}

// Helpers (Original)
function SummaryRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between items-center">
            <span className="text-zinc-500 font-bold uppercase text-[9px] tracking-[0.3em]">{label}</span>
            <span className="font-bold text-zinc-100 text-[10px] tracking-widest text-right">{value}</span>
        </div>
    );
}