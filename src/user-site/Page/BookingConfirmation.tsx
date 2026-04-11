import React from "react";
import { CheckCircle2, User, Smartphone, MapPin } from "lucide-react";

export function BookingConfirmation({ bookingData }: { bookingData: any }) {
    return (
        <div className="max-w-2xl mx-auto bg-white shadow-2xl rounded-[2.5rem] overflow-hidden border border-zinc-100">
            <div className="bg-zinc-950 p-12 text-center text-white relative">
                <div className="absolute top-6 right-8 text-[#D4AF37]">
                    <CheckCircle2 size={32} strokeWidth={1.5} />
                </div>
                <p className="text-[#D4AF37] tracking-[0.5em] font-black text-[9px] uppercase mb-4">Official Confirmation</p>
                <h1 className="text-4xl font-serif italic mb-2">Thank you, {bookingData.customerName?.split(' ')[0]}</h1>
            </div>

            <div className="p-12 space-y-10 text-left">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-zinc-50/50 p-8 rounded-[2rem] border border-zinc-100">
                    <div className="space-y-1">
                        <p className="text-[8px] font-black text-[#D4AF37] uppercase tracking-widest flex items-center gap-2"><User size={12} /> Guest</p>
                        <p className="text-sm font-black text-zinc-900 uppercase">{bookingData.customerName}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[8px] font-black text-[#D4AF37] uppercase tracking-widest flex items-center gap-2"><Smartphone size={12} /> Contact</p>
                        <p className="text-sm font-bold text-zinc-700">{bookingData.mobile}</p>
                    </div>
                    <div className="col-span-full border-t border-zinc-100 pt-4">
                        <p className="text-[8px] font-black text-[#D4AF37] uppercase tracking-widest flex items-center gap-2"><MapPin size={12} /> Address</p>
                        <p className="text-xs font-medium text-zinc-500 uppercase">{bookingData.address}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-y-8 px-4">
                    <div className="space-y-1 text-left">
                        <p className="text-[9px] font-black text-zinc-300 uppercase tracking-widest">Stay Details</p>
                        <p className="text-sm font-bold text-zinc-800 uppercase">{bookingData.cabin} • {bookingData.stayType}</p>
                    </div>
                    <div className="space-y-1 text-left">
                        <p className="text-[9px] font-black text-zinc-300 uppercase tracking-widest">Pax / Pets</p>
                        <p className="text-sm font-bold text-zinc-800">{bookingData.guests} Guests • {bookingData.pets} Pets</p>
                    </div>
                    <div className="space-y-1 text-left">
                        <p className="text-[9px] font-black text-zinc-300 uppercase tracking-widest">Check-In</p>
                        <p className="text-sm font-bold text-zinc-800">{bookingData.checkIn}</p>
                    </div>
                    <div className="space-y-1 text-left">
                        <p className="text-[9px] font-black text-zinc-300 uppercase tracking-widest">Check-Out</p>
                        <p className="text-sm font-bold text-zinc-800">{bookingData.checkOut}</p>
                    </div>
                </div>

                <div className="pt-6 border-t border-zinc-100">
                    <div className="bg-zinc-950 text-white p-8 rounded-[2rem] flex justify-between items-center shadow-xl">
                        <div className="text-left">
                            <p className="text-[9px] font-black text-[#D4AF37] uppercase tracking-[0.3em]">Total Amount</p>
                            <span className="text-[8px] text-zinc-500 uppercase tracking-widest">Status: {bookingData.status || "Pending"}</span>
                        </div>
                        <span className="text-3xl font-serif italic text-[#D4AF37]">₱{bookingData.totalPrice?.toLocaleString()}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}