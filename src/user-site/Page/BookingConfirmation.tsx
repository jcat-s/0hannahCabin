import React, { useState, useRef } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../shared/lib/firebase";
import {
    User, Smartphone, MapPin, X, Upload,
    Check, Clock, ChevronLeft, CalendarDays, Users2,
    PartyPopper, Baby, Dog, Moon
} from "lucide-react";

interface ConfirmationProps {
    bookingData: any;
    onBack: () => void;
}

// --- HELPER: CONVERT IMAGE TO BASE64 ---
const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });
};

export function BookingConfirmation({ bookingData, onBack }: ConfirmationProps) {
    const [activeTab, setActiveTab] = useState<'gcash' | 'maya'>('gcash');
    const [showQR, setShowQR] = useState(false);
    const [receipt, setReceipt] = useState<File | null>(null);
    const [showFinalModal, setShowFinalModal] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 1048487) {
                alert("File too big! Please use a screenshot (under 1MB).");
                return;
            }
            setReceipt(file);
        }
    };

    // --- ACTUAL FIREBASE SAVING ---
    const handleFinalConfirm = async () => {
        if (!receipt) return;

        setIsSaving(true);
        try {
            const base64Image = await convertToBase64(receipt);

            // Sinigurado na lahat ng info ay kasama rito
            await addDoc(collection(db!, "bookings"), {
                // Customer Info
                customerName: bookingData.customerName,
                mobile: bookingData.mobile,
                address: bookingData.address,
                userId: bookingData.userId,
                userEmail: bookingData.userEmail || bookingData.email || "",
                userPhotoURL: bookingData.userPhotoURL || "",
                cabin: bookingData.cabin,

                // Dates & Stay
                checkIn: bookingData.checkIn,
                checkOut: bookingData.checkOut,
                duration: bookingData.duration,
                stayType: bookingData.stayType,
                fullStayOption: bookingData.fullStayOption || "",

                // Pax & Details
                guests: bookingData.guests,
                kids: bookingData.kids,
                pets: bookingData.pets,
                specialOccasion: bookingData.specialOccasion || "Not Specified",

                // Color & Pricing
                color: bookingData.color,
                isHighRate: bookingData.isHighRate,
                totalPrice: bookingData.totalPrice,

                // Payment & Tech
                paymentMethod: activeTab,
                receiptUrl: base64Image,
                status: "Pending",
                createdAt: serverTimestamp(),
            });

            setShowFinalModal(true);
        } catch (error) {
            console.error("Save Error:", error);
            alert("Error saving booking. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-[3rem] overflow-hidden border border-zinc-100 relative">

            {/* Back Button */}
            <button onClick={onBack} className="absolute top-8 left-8 z-10 p-3 bg-white/80 backdrop-blur-md hover:bg-zinc-100 rounded-full border border-zinc-200 group flex items-center gap-2 pr-5">
                <ChevronLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-widest">Edit Details</span>
            </button>

            {/* Header Area */}
            <div className="bg-zinc-950 pt-24 pb-12 px-12 text-center text-white">
                <p className="text-[#D4AF37] tracking-[0.5em] font-black text-[9px] uppercase mb-4">Reservation Summary</p>
                <h1 className="text-4xl font-serif italic mb-2">Almost there, {bookingData.customerName?.split(' ')[0]}</h1>
                <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold italic">Review and upload proof</p>
            </div>

            <div className="p-8 md:p-12">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-12">

                    {/* Left Side: Summary & Payment Selection */}
                    <div className="md:col-span-5 space-y-8 border-r border-zinc-100 pr-0 md:pr-12">
                        <div className="space-y-6">
                            <div className="space-y-1">
                                <p className="text-[8px] font-black text-[#D4AF37] uppercase tracking-widest italic flex items-center gap-2"><User size={12} /> Guest</p>
                                <p className="text-lg font-black text-zinc-900 uppercase">{bookingData.customerName}</p>
                            </div>

                            <div className="bg-zinc-50 p-4 rounded-3xl border border-zinc-100 space-y-2">
                                <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2"><PartyPopper size={12} /> Occasion</p>
                                <p className="text-xs font-bold text-zinc-800">{bookingData.specialOccasion || "No occasion specified"}</p>
                            </div>

                            <div className="space-y-1 text-zinc-500 uppercase text-[10px] font-bold">
                                <p><Smartphone size={10} className="inline mr-1" /> {bookingData.mobile}</p>
                                <p><MapPin size={10} className="inline mr-1" /> {bookingData.address}</p>
                                <p><User size={10} className="inline mr-1" /> {bookingData.userEmail || bookingData.email || "No email provided"}</p>
                            </div>
                        </div>

                        {/* Payment Selector */}
                        <div className="bg-zinc-50 p-6 rounded-[2.5rem] border border-zinc-100 space-y-4">
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Payment Mode</p>
                            <div className="grid grid-cols-2 gap-2">
                                <button onClick={() => { setActiveTab('gcash'); setShowQR(true); }} className={`py-4 rounded-2xl text-[9px] font-black uppercase transition-all ${activeTab === 'gcash' ? 'bg-[#007DFE] text-white shadow-lg shadow-blue-200' : 'bg-white text-zinc-400 border border-zinc-100'}`}>GCash</button>
                                <button onClick={() => { setActiveTab('maya'); setShowQR(true); }} className={`py-4 rounded-2xl text-[9px] font-black uppercase transition-all ${activeTab === 'maya' ? 'bg-[#00FF5E] text-zinc-900 shadow-lg shadow-green-100' : 'bg-white text-zinc-400 border border-zinc-100'}`}>Maya</button>
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Stay Details & Upload */}
                    <div className="md:col-span-7 space-y-10">
                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <p className="text-[9px] font-black text-zinc-300 uppercase tracking-widest flex items-center gap-2"><CalendarDays size={12} /> Date & Stay</p>
                                <p className="text-[12px] font-bold text-zinc-800 leading-tight">
                                    {bookingData.checkIn} — {bookingData.checkOut} <br />
                                    <span className="text-[#D4AF37] uppercase text-[10px] flex items-center gap-1 mt-1"><Moon size={10} /> {bookingData.duration} {bookingData.stayType}{bookingData.fullStayOption ? ` (${bookingData.fullStayOption})` : ''}</span>
                                </p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-[9px] font-black text-zinc-300 uppercase tracking-widest flex items-center gap-2"><Users2 size={12} /> Pax Details</p>
                                <div className="text-[11px] font-bold text-zinc-800 space-y-1">
                                    <p className="flex items-center gap-2 opacity-80"><User size={10} /> {bookingData.guests} Adults</p>
                                    <p className="flex items-center gap-2 opacity-80"><Baby size={10} /> {bookingData.kids} Kids</p>
                                    <p className="flex items-center gap-2 opacity-80"><Dog size={10} /> {bookingData.pets} Pets</p>
                                </div>
                            </div>
                        </div>

                        {/* UPLOAD AREA */}
                        <div className={`border-2 border-dashed rounded-[2.5rem] p-8 transition-all flex flex-col items-center justify-center cursor-pointer min-h-[160px]
                            ${receipt ? "border-green-500 bg-green-50/20" : "border-zinc-200 bg-zinc-50/50 hover:border-[#D4AF37]"}`}
                            onClick={() => fileInputRef.current?.click()}>
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                            {receipt ? (
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white shadow-xl"><Check size={24} /></div>
                                    <p className="text-[10px] font-black text-green-700 uppercase tracking-widest text-center">Receipt Attached <br /><span className="text-[8px] opacity-60 font-bold">{receipt.name}</span></p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-14 h-14 bg-white rounded-3xl flex items-center justify-center text-zinc-400 border border-zinc-100 shadow-sm"><Upload size={24} /></div>
                                    <p className="text-[10px] font-black uppercase text-zinc-900 tracking-widest">Click to upload proof</p>
                                    <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-tighter italic">Max 1MB (Screenshots preferred)</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer Part */}
                <div className="mt-12 pt-10 border-t border-zinc-100 flex flex-col md:flex-row gap-8 items-center justify-between">
                    <div>
                        <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Total Amount</p>
                        <span className="text-4xl font-serif italic text-zinc-900 font-black tracking-tight">₱{bookingData.totalPrice?.toLocaleString()}</span>
                    </div>

                    <button
                        onClick={handleFinalConfirm}
                        disabled={!receipt || isSaving}
                        className={`w-full md:w-auto px-20 py-6 rounded-full font-black uppercase tracking-[0.2em] text-[11px] transition-all
                            ${receipt && !isSaving ? "bg-zinc-950 text-white shadow-2xl hover:scale-105 active:scale-95" : "bg-zinc-100 text-zinc-300 cursor-not-allowed"}`}
                    >
                        {isSaving ? "Sending Booking..." : "Confirm Booking"}
                    </button>
                </div>
            </div>

            {/* PAYMENT QR MODAL */}
            {showQR && (
                <div className="fixed inset-0 z-[500] bg-zinc-950/40 backdrop-blur-md flex items-center justify-center p-6" onClick={() => setShowQR(false)}>
                    <div className="bg-white rounded-[3.5rem] p-10 text-center shadow-3xl relative animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setShowQR(false)} className="absolute top-6 right-8 text-zinc-400 hover:text-zinc-900"><X size={24} /></button>
                        <div className="space-y-6">
                            <p className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37]">Scan to Pay via {activeTab}</p>
                            <div className="p-3 bg-zinc-50 rounded-[2.5rem] border-4 border-white shadow-inner">
                                <img src={activeTab === 'gcash' ? "/section/gcash-qr.jpg" : "/section/maya-qr.jpg"} className="w-64 h-64 object-contain rounded-3xl" alt="QR Code" />
                            </div>
                            <h3 className="text-lg font-black text-zinc-900 uppercase">Ohannah Cabin</h3>
                        </div>
                    </div>
                </div>
            )}

            {/* FINAL SUCCESS MODAL */}
            {showFinalModal && (
                <div className="fixed inset-0 z-[600] bg-zinc-950/60 backdrop-blur-xl flex items-center justify-center p-6">
                    <div className="bg-white rounded-[4rem] p-12 max-w-md w-full text-center shadow-2xl animate-in fade-in zoom-in duration-300">
                        <div className="w-24 h-24 bg-zinc-950 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-zinc-200">
                            <Clock size={40} className="text-[#D4AF37] animate-pulse" />
                        </div>
                        <h2 className="text-3xl font-serif italic text-zinc-900 mb-3">Sent Successfully</h2>
                        <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-widest mb-10 leading-relaxed">
                            Verification takes 12-24 hours. <br /> We'll check your details and proof of payment.
                        </p>
                        <button onClick={() => window.location.href = "/"} className="w-full py-7 bg-zinc-950 text-white rounded-full font-black text-[12px] uppercase tracking-widest hover:scale-[1.02] transition-transform">Return to Home</button>
                    </div>
                </div>
            )}
        </div>
    );
}