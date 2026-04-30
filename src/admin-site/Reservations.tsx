import React, { useState } from "react";
import {
    Phone, ChevronRight, ImageIcon, CheckCircle, Trash2,
    X, CreditCard, User, MapPin, PartyPopper, Users, Calendar
} from "lucide-react";
import { getSlotBg } from "../shared/lib/constants";

interface ReservationsProps {
    bookings: any[];
    onStatusUpdate: (id: string, status: string) => void;
    onDelete: (id: string) => void;
}

export const Reservations: React.FC<ReservationsProps> = ({ bookings, onStatusUpdate, onDelete }) => {
    const [selectedBooking, setSelectedBooking] = useState<any>(null);

    return (
        <div className="grid gap-6">
            {bookings.map((booking) => {
                // DETECTIVE LOGIC: Hahanapin natin kung anong field ang may laman
                // I-check natin kung 'color', 'selectedColor', o 'slot' ang pangalan sa Firebase
                const activeColor = booking.color || booking.selectedColor || booking.slot || null;

                return (
                    <div key={booking.id} className="bg-white rounded-[3rem] p-8 border border-zinc-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
                        <div className="flex items-center gap-8 flex-1">

                            {/* KULAY FIX: Gagamitin ang nahanap na activeColor */}
                            <div className={`w-3 h-20 rounded-full shrink-0 ${getSlotBg(activeColor)}`} />

                            <div className="grid grid-cols-3 gap-12 w-full">
                                <div className="space-y-1">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-[#D4AF37]">{booking.cabin || "Cabin"}</span>
                                    <h3 className="text-xl font-black uppercase tracking-tighter">{booking.customerName}</h3>
                                    <div className="flex items-center gap-2 text-zinc-500 text-[11px] font-bold">
                                        <Phone size={12} /> {booking.mobile}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${booking.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
                                            {booking.status}
                                        </span>
                                        <span className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase bg-blue-50 text-blue-600">
                                            {booking.paymentMethod || 'E-Wallet'}
                                        </span>
                                    </div>
                                    <div className="text-sm font-black flex items-center gap-2 uppercase">
                                        {booking.checkIn} <ChevronRight size={14} /> {booking.checkOut}
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    <div className="text-right">
                                        <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block">Total</span>
                                        <span className="text-2xl font-black tracking-tighter">₱{booking.totalPrice?.toLocaleString()}</span>
                                    </div>
                                    <button onClick={() => setSelectedBooking(booking)} className="p-4 bg-zinc-50 hover:bg-zinc-100 border border-zinc-100 rounded-3xl text-[#D4AF37] flex flex-col items-center gap-1">
                                        <ImageIcon size={24} />
                                        <span className="text-[8px] font-black uppercase">Verify Pic</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 ml-10">
                            {booking.status === "Pending" && (
                                <button onClick={() => onStatusUpdate(booking.id, "Confirmed")} className="p-4 text-emerald-500 hover:bg-emerald-50 rounded-2xl transition-all">
                                    <CheckCircle size={28} />
                                </button>
                            )}
                            <button onClick={() => onDelete(booking.id)} className="p-4 text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all">
                                <Trash2 size={24} />
                            </button>
                        </div>
                    </div>
                );
            })}

            {/* MODAL */}
            {selectedBooking && (
                <div className="fixed inset-0 z-[999] bg-zinc-950/60 backdrop-blur-xl flex items-center justify-center p-6" onClick={() => setSelectedBooking(null)}>
                    <div className="bg-white rounded-[4rem] w-full max-w-5xl h-[85vh] overflow-hidden flex shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="flex-1 p-16 overflow-y-auto space-y-12">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[#D4AF37] mb-2">Reservation Info</p>
                                    <h2 className="text-4xl font-black uppercase tracking-tighter leading-none">{selectedBooking.customerName}</h2>
                                </div>
                                <button onClick={() => setSelectedBooking(null)} className="p-4 hover:bg-zinc-100 rounded-full"><X size={32} /></button>
                            </div>
                            <div className="grid grid-cols-2 gap-y-10 gap-x-12">
                                <InfoItem icon={<User size={14} />} label="Contact" value={selectedBooking.mobile} />
                                <InfoItem icon={<MapPin size={14} />} label="Address" value={selectedBooking.address} />
                                <InfoItem icon={<PartyPopper size={14} />} label="Occasion" value={selectedBooking.specialOccasion} />
                                <InfoItem icon={<Users size={14} />} label="Pax" value={`${selectedBooking.guests} Adults / ${selectedBooking.kids} Kids`} />
                                <InfoItem icon={<Calendar size={14} />} label="Check-In" value={selectedBooking.checkIn} />
                                <InfoItem icon={<Calendar size={14} />} label="Check-Out" value={selectedBooking.checkOut} />
                            </div>
                        </div>
                        <div className="w-[45%] bg-zinc-50 p-10 flex border-l border-zinc-100">
                            <div className="flex-1 bg-white rounded-[3rem] overflow-hidden border-4 border-white shadow-2xl">
                                {selectedBooking.receiptUrl ? (
                                    <img src={selectedBooking.receiptUrl} className="w-full h-full object-contain" alt="Receipt" />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-zinc-300 gap-4 text-center px-10">
                                        <ImageIcon size={64} strokeWidth={1} />
                                        <p className="font-black text-[10px] uppercase tracking-widest">No Receipt Uploaded</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

function InfoItem({ icon, label, value }: { icon: any, label: string, value: string }) {
    return (
        <div className="space-y-1">
            <p className="text-[9px] font-black text-zinc-300 uppercase tracking-[0.2em] flex items-center gap-2">{icon} {label}</p>
            <p className="text-[13px] font-black text-zinc-800 uppercase tracking-tight">{value || "---"}</p>
        </div>
    );
}