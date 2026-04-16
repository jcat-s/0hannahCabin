import React, { useMemo, useState } from "react";
import { Image as ImageIcon, X, Receipt, Info, PartyPopper, ShieldCheck } from "lucide-react";
import { format, parseISO } from "date-fns";
import { CabinId, StayType, calculateTotal } from "../../shared/lib/bookingPricing";

interface PriceSummaryProps {
    cabin: CabinId; stayType: StayType; guests: number; kids: number;
    pets: number; checkIn: string; checkOut: string;
    specialOccasion?: string; durationCount: number;
    isHighRate: boolean; canBookCore: boolean;
    submitting: boolean; onSubmit: (total: number) => void;
}

export function PriceSummary({
    cabin, stayType, guests, kids, pets, checkIn, checkOut, specialOccasion,
    durationCount, isHighRate, canBookCore, submitting, onSubmit
}: PriceSummaryProps) {
    const [showModal, setShowModal] = useState(false);

    // Dito kinakalikot ang presyo. Tandaan: Kids = Free kaya hindi sila kailangang i-multiply sa calculateTotal
    const pricing = useMemo(() =>
        calculateTotal(cabin, stayType, guests, pets, isHighRate, durationCount),
        [cabin, stayType, guests, pets, isHighRate, durationCount]
    );

    const stayLabels = {
        day: { label: "Day Lounge", time: "9AM - 5PM" },
        evening: { label: "Evening Chill", time: "8PM - 7AM" },
        full: { label: "Full Stay", time: "9AM-7AM / 8PM-5PM" }
    };

    return (
        <div className="bg-zinc-950 rounded-[3.5rem] p-10 text-white sticky top-32 border border-white/5 shadow-[0_40px_100px_rgba(0,0,0,0.6)]">
            <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-6">
                <div className="flex items-center gap-3">
                    <Receipt size={22} className="text-[#D4AF37]" />
                    <h3 className="text-xl font-serif italic tracking-tight">Price Summary</h3>
                    <h6 className="text-[8px] uppercase tracking-[0.3em] text-zinc-500 font-bold">click pic</h6>
                </div>
                <button onClick={() => setShowModal(true)} className="text-[#D4AF37] hover:scale-110 transition-transform">
                    <ImageIcon size={20} />
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

                <SummaryRow label="Stay" value={`${durationCount} ${stayLabels[stayType].label}`} />

                <div className="pt-2 space-y-3">
                    <SummaryRow label="Adults" value={`${guests} Pax`} />
                    {/* Pakita natin ang Kids dito para alam ng customer na na-record sila */}
                    {kids > 0 && (
                        <SummaryRow label="Kids (Free)" value={`${kids} Pax`} />
                    )}
                    {pets > 0 && (
                        <SummaryRow label="Pets" value={`${pets} Pax`} />
                    )}
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
                    ₱{pricing.grandTotal.toLocaleString()}
                </div>
                <div className="mt-4 flex flex-col gap-1 text-[8px] text-zinc-500 uppercase font-bold tracking-widest">
                    <span>Base: ₱{pricing.basePrice.toLocaleString()}</span>
                    {pricing.extraPaxTotal > 0 && <span>Extra Pax: +₱{pricing.extraPaxTotal.toLocaleString()}</span>}
                    {pricing.petTotal > 0 && <span>Pets: +₱{pricing.petTotal.toLocaleString()}</span>}
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

            {showModal && (
                <div className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-6" onClick={() => setShowModal(false)}>
                    <X className="absolute top-10 right-10 text-white cursor-pointer" size={32} />
                    <img src="/section/price.jpg" className="max-w-4xl w-full rounded-2xl" alt="Rates" />
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