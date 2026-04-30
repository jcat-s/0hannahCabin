import React, { useState } from "react";
import {
    Phone, ChevronRight, ImageIcon, CheckCircle, Trash2,
    X, CreditCard, User, MapPin, PartyPopper, Users, Calendar,
    MessageSquare, AlertCircle, Clock, Dog, Baby
} from "lucide-react";
import { getSlotBg } from "../shared/lib/constants";

interface ReservationsProps {
    bookings: any[];
    onStatusUpdate: (id: string, status: string, message?: string) => void;
    onDelete: (id: string) => void;
}

export const Reservations: React.FC<ReservationsProps> = ({ bookings, onStatusUpdate, onDelete }) => {
    const [selectedBooking, setSelectedBooking] = useState<any>(null);
    const [approvalMessage, setApprovalMessage] = useState("");
    const [showApprovalModal, setShowApprovalModal] = useState(false);
    const [pendingAction, setPendingAction] = useState<{ id: string, status: string } | null>(null);

    const handleApprovalAction = (id: string, status: string) => {
        setPendingAction({ id, status });
        setApprovalMessage("");
        setShowApprovalModal(true);
    };

    const confirmApprovalAction = () => {
        if (pendingAction) {
            onStatusUpdate(pendingAction.id, pendingAction.status, approvalMessage.trim() || undefined);
            setShowApprovalModal(false);
            setPendingAction(null);
        }
    };

    return (
        <>
            <div className="grid gap-6">
                {bookings.map((booking) => {
                    const activeColor = booking.color || booking.selectedColor || booking.slot || null;

                    return (
                        <div key={booking.id} className="bg-white rounded-[3rem] p-8 border border-zinc-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
                            <div className="flex items-center gap-8 flex-1">

                                {/* Color indicator */}
                                <div className={`w-3 h-20 rounded-full shrink-0 ${getSlotBg(activeColor)}`} />

                                <div className="grid grid-cols-4 gap-8 w-full">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-zinc-100 overflow-hidden flex items-center justify-center">
                                                {booking.userPhotoURL ? (
                                                    <img src={booking.userPhotoURL} alt="Guest" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-base font-black text-zinc-700">{(booking.customerName || booking.userEmail || 'G').charAt(0).toUpperCase()}</span>
                                                )}
                                            </div>
                                            <div>
                                                <span className="text-[9px] font-black uppercase tracking-widest text-[#D4AF37]">{booking.cabin || "Cabin"}</span>
                                                <h3 className="text-xl font-black uppercase tracking-tighter">{booking.customerName}</h3>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-1 text-zinc-500 text-[11px] font-bold">
                                            <div className="flex items-center gap-2"><Phone size={12} /> {booking.mobile}</div>
                                            <div className="flex items-center gap-2"><User size={12} /> {booking.userEmail || booking.email || 'No email'}</div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${booking.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-600' :
                                                    booking.status === 'Rejected' ? 'bg-red-50 text-red-600' :
                                                        'bg-orange-50 text-orange-600'
                                                }`}>
                                                {booking.status}
                                            </span>
                                            <span className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase bg-blue-50 text-blue-600">
                                                {booking.paymentMethod || 'E-Wallet'}
                                            </span>
                                        </div>
                                        <div className="text-sm font-black flex items-center gap-2 uppercase">
                                            {booking.checkIn} <ChevronRight size={14} /> {booking.checkOut}
                                        </div>
                                        <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                                            {booking.duration} {booking.stayType}{booking.fullStayOption ? ` (${booking.fullStayOption})` : ''}
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Guests</div>
                                        <div className="flex items-center gap-3 text-sm font-black">
                                            <span className="flex items-center gap-1"><Users size={12} /> {booking.guests}</span>
                                            {booking.kids > 0 && <span className="flex items-center gap-1"><Baby size={12} /> {booking.kids}</span>}
                                            {booking.pets > 0 && <span className="flex items-center gap-1"><Dog size={12} /> {booking.pets}</span>}
                                        </div>
                                        {booking.specialOccasion && (
                                            <div className="flex items-center gap-1 text-[9px] text-zinc-500 font-medium">
                                                <PartyPopper size={10} /> {booking.specialOccasion}
                                            </div>
                                        )}
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
                                    <>
                                        <button onClick={() => handleApprovalAction(booking.id, "Confirmed")} className="p-4 text-emerald-500 hover:bg-emerald-50 rounded-2xl transition-all">
                                            <CheckCircle size={28} />
                                        </button>
                                        <button onClick={() => handleApprovalAction(booking.id, "Rejected")} className="p-4 text-red-500 hover:bg-red-50 rounded-2xl transition-all">
                                            <AlertCircle size={28} />
                                        </button>
                                    </>
                                )}
                                <button onClick={() => onDelete(booking.id)} className="p-4 text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all">
                                    <Trash2 size={24} />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Approval Modal */}
            {showApprovalModal && (
                <div className="fixed inset-0 z-[999] bg-zinc-950/60 backdrop-blur-xl flex items-center justify-center p-6">
                    <div className="bg-white rounded-[3rem] p-8 max-w-md w-full" onClick={e => e.stopPropagation()}>
                        <div className="space-y-6">
                            <div className="text-center">
                                <h3 className="text-xl font-black uppercase tracking-tight">
                                    {pendingAction?.status === 'Confirmed' ? 'Approve' : 'Reject'} Reservation
                                </h3>
                                <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-2">
                                    Optional message for the guest
                                </p>
                            </div>

                            <textarea
                                value={approvalMessage}
                                onChange={(e) => setApprovalMessage(e.target.value)}
                                placeholder="Add a personal message (optional)..."
                                className="w-full p-4 rounded-2xl bg-zinc-50 border-none outline-none text-sm resize-none"
                                rows={4}
                            />

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowApprovalModal(false)}
                                    className="flex-1 py-4 rounded-2xl bg-zinc-100 text-zinc-600 font-black uppercase text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmApprovalAction}
                                    className={`flex-1 py-4 rounded-2xl font-black uppercase text-sm ${pendingAction?.status === 'Confirmed'
                                            ? 'bg-emerald-500 text-white'
                                            : 'bg-red-500 text-white'
                                        }`}
                                >
                                    {pendingAction?.status === 'Confirmed' ? 'Approve' : 'Reject'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Receipt Modal */}
            {selectedBooking && (
                <div className="fixed inset-0 z-[999] bg-zinc-950/60 backdrop-blur-xl flex items-center justify-center p-6" onClick={() => setSelectedBooking(null)}>
                    <div className="bg-white rounded-[4rem] w-full max-w-5xl h-[85vh] overflow-hidden flex shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="flex-1 p-16 overflow-y-auto space-y-12">
                            <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-20 h-20 rounded-full bg-zinc-100 overflow-hidden flex items-center justify-center">
                                        {selectedBooking.userPhotoURL ? (
                                            <img src={selectedBooking.userPhotoURL} alt="Guest" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-3xl font-black text-zinc-700">{(selectedBooking.customerName || selectedBooking.userEmail || 'G').charAt(0).toUpperCase()}</span>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[#D4AF37] mb-2">Reservation Info</p>
                                        <h2 className="text-4xl font-black uppercase tracking-tighter leading-none">{selectedBooking.customerName}</h2>
                                        <p className="text-xs text-zinc-500 mt-2">{selectedBooking.userEmail || selectedBooking.email || 'No email provided'}</p>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedBooking(null)} className="p-4 hover:bg-zinc-100 rounded-full"><X size={32} /></button>
                            </div>

                            <div className="grid grid-cols-2 gap-y-10 gap-x-12">
                                <InfoItem icon={<User size={14} />} label="Contact" value={selectedBooking.mobile} />
                                <InfoItem icon={<MapPin size={14} />} label="Address" value={selectedBooking.address} />
                                <InfoItem icon={<PartyPopper size={14} />} label="Occasion" value={selectedBooking.specialOccasion || "Not specified"} />
                                <InfoItem icon={<Users size={14} />} label="Adults" value={selectedBooking.guests} />
                                <InfoItem icon={<Baby size={14} />} label="Kids" value={selectedBooking.kids} />
                                <InfoItem icon={<Dog size={14} />} label="Pets" value={selectedBooking.pets} />
                                <InfoItem icon={<Calendar size={14} />} label="Check-In" value={selectedBooking.checkIn} />
                                <InfoItem icon={<Calendar size={14} />} label="Check-Out" value={selectedBooking.checkOut} />
                                <InfoItem icon={<Clock size={14} />} label="Stay Type" value={`${selectedBooking.stayType}${selectedBooking.fullStayOption ? ` (${selectedBooking.fullStayOption})` : ''}`} />
                                <InfoItem icon={<CreditCard size={14} />} label="Payment" value={selectedBooking.paymentMethod || 'E-Wallet'} />
                                <InfoItem icon={<MessageSquare size={14} />} label="Status Message" value={selectedBooking.statusMessage || 'No message'} />
                            </div>

                            {/* Status Update */}
                            {selectedBooking.status === "Pending" && (
                                <div className="bg-zinc-50 rounded-[2rem] p-8 border border-zinc-100">
                                    <h4 className="text-lg font-black uppercase tracking-tight mb-6">Update Status</h4>
                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => handleApprovalAction(selectedBooking.id, "Confirmed")}
                                            className="flex-1 py-4 bg-emerald-500 text-white rounded-2xl font-black uppercase text-sm hover:bg-emerald-600 transition-colors"
                                        >
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => handleApprovalAction(selectedBooking.id, "Rejected")}
                                            className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-black uppercase text-sm hover:bg-red-600 transition-colors"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Receipt Image */}
                        <div className="w-1/2 bg-zinc-50 border-l border-zinc-100 flex items-center justify-center p-8">
                            {selectedBooking.receiptUrl ? (
                                <img
                                    src={selectedBooking.receiptUrl}
                                    alt="Payment Receipt"
                                    className="max-w-full max-h-full object-contain rounded-2xl shadow-lg"
                                />
                            ) : (
                                <div className="text-center text-zinc-400">
                                    <ImageIcon size={48} className="mx-auto mb-4 opacity-50" />
                                    <p className="text-sm font-medium">No receipt uploaded</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

function InfoItem({ icon, label, value }: { icon: any; label: string; value: any }) {
    return (
        <div className="space-y-1">
            <p className="text-[8px] font-bold text-zinc-300 uppercase tracking-widest flex items-center gap-1">
                {icon} {label}
            </p>
            <p className="text-sm font-black text-zinc-900 uppercase">{value}</p>
        </div>
    );
}