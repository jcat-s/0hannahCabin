import React, { useState } from "react";
import { Image as ImageIcon, X } from "lucide-react";

// Local Pricing Data para sa Modal
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
    }
};

interface SummaryRowProps {
    label: string;
    value: string;
}

const SummaryRow = ({ label, value }: SummaryRowProps) => (
    <div className="flex justify-between items-center">
        <span className="text-zinc-500 font-bold uppercase text-[9px] tracking-[0.3em]">{label}</span>
        <span className="font-bold text-zinc-100 text-[10px] tracking-widest">{value}</span>
    </div>
);

interface PriceSummaryProps {
    cabin: string;
    stayType: string;
    guests: number;
    pets: number;
    durationCount: number;
    totalPrice: number;
    canBookCore: boolean;
    submitting: boolean;
    selectedColor: string;
    isDateRangeValid: boolean;
    onSubmit: () => void;
}

export function PriceSummary({
    cabin, stayType, guests, pets, durationCount, totalPrice,
    canBookCore, submitting, selectedColor, isDateRangeValid, onSubmit
}: PriceSummaryProps) {
    const [showModal, setShowModal] = useState(false);

    return (
        <>
            {/* MAIN SUMMARY CARD */}
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
                    <SummaryRow label="Stay Plan" value={stayType.toUpperCase()} />
                    <SummaryRow label="Pax Details" value={`${guests} Pax / ${pets} Pets`} />
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
                    onClick={onSubmit}
                    className={`w-full py-6 rounded-2xl font-black text-[11px] tracking-[0.4em] uppercase shadow-2xl transition-all ${(!canBookCore)
                        ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed opacity-50'
                        : 'bg-white text-zinc-950 hover:bg-[#D4AF37] hover:text-white active:scale-[0.98]'
                        }`}
                >
                    {submitting ? "Processing..." : !selectedColor ? "Select Slot Color" : !isDateRangeValid ? "Date Taken" : "Confirm Booking"}
                </button>
            </div>

            {/* FULL IMAGE PRICE LIST MODAL */}
            {showModal && (
                <div
                    className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8 bg-zinc-950/90 backdrop-blur-xl animate-in fade-in duration-300"
                    onClick={() => setShowModal(false)}
                >
                    <div
                        className="bg-white rounded-[2.5rem] md:rounded-[3.5rem] w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl relative"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Close Button */}
                        <button
                            onClick={() => setShowModal(false)}
                            className="fixed md:absolute top-8 right-8 z-[210] p-3 bg-zinc-900/80 text-white rounded-full backdrop-blur-md hover:bg-zinc-900 transition-all shadow-xl"
                        >
                            <X size={24} />
                        </button>

                        {/* Image Container - h-auto ensures no cropping */}
                        <div className="w-full">
                            <img
                                src="/section/price.jpg"
                                alt="Ohannah Rates"
                                className="w-full h-auto block"
                                loading="lazy"
                            />
                        </div>

                        {/* Additional Info Section */}
                        <div className="p-10 md:p-14 bg-white border-t border-zinc-50">


                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {Object.entries(PRICING_DATA).map(([id, rates]) => (
                                    <div key={id} className="space-y-5 bg-zinc-50 p-8 rounded-[2rem]">
                                        <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-[#D4AF37] border-b border-zinc-200 pb-3">
                                            {id === 'ohannah' ? 'Ohannah Cabin' : 'The Dream by Ohannah'}
                                        </h3>
                                        <div className="space-y-3">
                                            <PriceRow label="Day Lounge" weekday={rates.day.weekday} weekend={rates.day.weekend} />
                                            <PriceRow label="Evening Chill" weekday={rates.evening.weekday} weekend={rates.evening.weekend} />
                                            <PriceRow label="Full Stay" weekday={rates.full.weekday} weekend={rates.full.weekend} />
                                        </div>
                                    </div>
                                ))}
                            </div>


                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

// Internal Helper for Price Rows in Modal
function PriceRow({ label, weekday, weekend }: { label: string, weekday: number, weekend: number }) {
    return (
        <div className="flex justify-between items-center text-[12px]">
            <span className="text-zinc-500 font-bold uppercase tracking-widest">{label}</span>
            <div className="text-zinc-900 font-black">
                ₱{weekday.toLocaleString()} <span className="text-zinc-300 mx-1">/</span> <span className="text-[#D4AF37]">₱{weekend.toLocaleString()}</span>
            </div>
        </div>
    );
}