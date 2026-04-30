import React, { useState, useEffect } from "react";
import { auth, db } from "../../shared/lib/firebase";
import { doc, getDoc, collection, query, where, onSnapshot, updateDoc } from "firebase/firestore";
import { useAuth } from "../../shared/context/AuthContext";
import { ChevronLeft, User, Phone, MapPin, Calendar, Clock, CreditCard, LogOut, PartyPopper, Baby, Dog } from "lucide-react";
import { format } from "date-fns";

export function ProfilePage({ onBack }: { onBack: () => void }) {
    const { user } = useAuth();
    const [profile, setProfile] = useState<any>(null);
    const [myBookings, setMyBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);

    // Edit States
    const [editName, setEditName] = useState("");
    const [editMobile, setEditMobile] = useState("");
    const [editAddress, setEditAddress] = useState("");

    useEffect(() => {
        if (!user) return;

        // 1. Get User Profile from Firestore
        const fetchProfile = async () => {
            const docRef = doc(db, "users", user.uid);
            const snap = await getDoc(docRef);
            if (snap.exists()) {
                const data = snap.data();
                setProfile(data);
                setEditName(data.fullName || "");
                setEditMobile(data.mobile || "");
                setEditAddress(data.address || "");
            }
        };

        // 2. Real-time Listen for User's Bookings
        const q = query(collection(db, "bookings"), where("userId", "==", user.uid));
        const unsub = onSnapshot(q, (snap) => {
            const bookings = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            // Sort by latest
            setMyBookings(bookings.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds));
            setLoading(false);
        });

        fetchProfile();
        return () => unsub();
    }, [user]);

    const handleUpdateProfile = async () => {
        if (!user) return;
        try {
            await updateDoc(doc(db, "users", user.uid), {
                fullName: editName,
                mobile: editMobile,
                address: editAddress
            });
            setIsEditing(false);
            setProfile({ ...profile, fullName: editName, mobile: editMobile, address: editAddress });
        } catch (err) {
            console.error("Update failed", err);
        }
    };

    const handleLogout = () => {
        auth.signOut().then(() => window.location.reload());
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#FDFCFB]">
            <div className="w-8 h-8 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#FDFCFB] text-zinc-900 pb-24">
            {/* Navigation */}
            <nav className="px-8 py-8 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-50">
                <button onClick={onBack} className="flex items-center gap-2 text-zinc-400 hover:text-zinc-950 transition-colors">
                    <ChevronLeft size={20} />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">Back</span>
                </button>
                <button onClick={handleLogout} className="flex items-center gap-2 text-red-400 hover:text-red-600 transition-colors">
                    <LogOut size={16} />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">Logout</span>
                </button>
            </nav>

            <div className="max-w-6xl mx-auto px-6 mt-12 grid grid-cols-1 lg:grid-cols-12 gap-16">

                {/* Left Column: Profile Details */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="text-center lg:text-left space-y-4">
                        <div className="relative inline-block">
                            <img
                                src={user?.photoURL || ""}
                                alt="Profile"
                                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-2xl mx-auto lg:mx-0"
                            />
                            <div className="absolute bottom-0 right-0 bg-[#D4AF37] p-2 rounded-full border-4 border-white">
                                <User size={16} className="text-white" />
                            </div>
                        </div>
                        <div>
                            <h1 className="text-3xl font-serif italic text-zinc-900">{profile?.fullName}</h1>
                            <p className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-[0.4em] mt-1">Guest Member</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-[2.5rem] p-8 border border-zinc-100 shadow-sm space-y-6">
                        <div className="flex justify-between items-center border-b border-zinc-50 pb-4">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Account Details</h3>
                            <button
                                onClick={() => isEditing ? handleUpdateProfile() : setIsEditing(true)}
                                className="text-[10px] font-black uppercase text-[#D4AF37] hover:underline"
                            >
                                {isEditing ? "Save" : "Edit"}
                            </button>
                        </div>

                        <div className="space-y-4">
                            <DetailItem icon={<User size={14} />} label="Full Name" value={editName} isEditing={isEditing} onChange={setEditName} />
                            <DetailItem icon={<Phone size={14} />} label="Mobile" value={editMobile} isEditing={isEditing} onChange={setEditMobile} />
                            <DetailItem icon={<MapPin size={14} />} label="Address" value={editAddress} isEditing={isEditing} onChange={setEditAddress} />
                            <div className="pt-2">
                                <p className="text-[8px] font-bold text-zinc-300 uppercase tracking-widest">Email Address</p>
                                <p className="text-xs font-medium text-zinc-500">{user?.email}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Booking History */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold tracking-tight text-zinc-900">Your Reservations</h2>
                        <span className="bg-zinc-100 px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-zinc-500">
                            {myBookings.length} Bookings
                        </span>
                    </div>

                    {myBookings.length === 0 ? (
                        <div className="bg-white rounded-[3rem] p-20 text-center border-2 border-dashed border-zinc-100">
                            <Calendar className="mx-auto text-zinc-200 mb-4" size={48} />
                            <p className="text-zinc-400 text-sm italic">No bookings found yet.</p>
                            <button onClick={onBack} className="mt-6 text-[10px] font-black uppercase tracking-widest text-[#D4AF37] hover:tracking-[0.3em] transition-all">Start Booking Now</button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {myBookings.map((booking) => (
                                <div key={booking.id} className="bg-white rounded-[2rem] p-8 border border-zinc-100 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
                                        <div className="flex gap-6 items-start">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${booking.cabin === 'ohannah' ? 'bg-zinc-900' : 'bg-[#D4AF37]'} text-white shadow-lg`}>
                                                <span className="font-serif italic text-lg">{booking.cabin[0].toUpperCase()}</span>
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="text-sm font-bold uppercase tracking-tight text-zinc-900">
                                                    {booking.cabin === 'ohannah' ? 'Ohannah Cabin' : 'The Dream by Ohannah'}
                                                </h4>
                                                <div className="flex flex-wrap gap-4 mt-2">
                                                    <span className="flex items-center gap-1 text-[10px] text-zinc-400 font-medium">
                                                        <Calendar size={12} /> {booking.checkIn} — {booking.checkOut}
                                                    </span>
                                                    <span className="flex items-center gap-1 text-[10px] text-zinc-400 font-medium uppercase tracking-tighter">
                                                        <Clock size={12} /> {booking.duration} {booking.stayType}{booking.fullStayOption ? ` (${booking.fullStayOption})` : ''}
                                                    </span>
                                                </div>
                                                <div className="flex flex-wrap gap-4 mt-2">
                                                    <span className="flex items-center gap-1 text-[10px] text-zinc-500 font-medium">
                                                        <Users size={12} /> {booking.guests} Adults
                                                    </span>
                                                    {booking.kids > 0 && (
                                                        <span className="flex items-center gap-1 text-[10px] text-zinc-500 font-medium">
                                                            <Baby size={12} /> {booking.kids} Kids
                                                        </span>
                                                    )}
                                                    {booking.pets > 0 && (
                                                        <span className="flex items-center gap-1 text-[10px] text-zinc-500 font-medium">
                                                            <Dog size={12} /> {booking.pets} Pets
                                                        </span>
                                                    )}
                                                </div>
                                                {booking.specialOccasion && (
                                                    <div className="flex items-center gap-1 text-[10px] text-zinc-500 font-medium mt-1">
                                                        <PartyPopper size={12} /> {booking.specialOccasion}
                                                    </div>
                                                )}
                                                {booking.statusMessage && (
                                                    <div className="mt-3 p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                                                        <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Admin Message</p>
                                                        <p className="text-sm text-zinc-700">{booking.statusMessage}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6 w-full lg:w-auto justify-between lg:justify-end lg:flex-col lg:items-end">
                                            <div className="text-right">
                                                <p className="text-[10px] font-black text-zinc-300 uppercase tracking-widest mb-1">Total Paid</p>
                                                <p className="text-sm font-bold text-zinc-900">₱{booking.totalPrice?.toLocaleString()}</p>
                                            </div>
                                            <div className="text-right">
                                                <span className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                                    booking.status === 'Confirmed' ? 'bg-green-50 text-green-600' :
                                                    booking.status === 'Rejected' ? 'bg-red-50 text-red-600' :
                                                    'bg-orange-50 text-orange-600'
                                                }`}>
                                                    {booking.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Receipt Image */}
                                    {booking.receiptUrl && (
                                        <div className="mt-6 pt-6 border-t border-zinc-100">
                                            <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-3">Payment Receipt</p>
                                            <div className="bg-zinc-50 rounded-xl p-4 border border-zinc-100">
                                                <img
                                                    src={booking.receiptUrl}
                                                    alt="Payment Receipt"
                                                    className="max-w-full max-h-32 object-contain rounded-lg"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Sub-component para sa details
function DetailItem({ icon, label, value, isEditing, onChange }: any) {
    return (
        <div className="space-y-1">
            <p className="text-[8px] font-bold text-zinc-300 uppercase tracking-widest flex items-center gap-1">
                {icon} {label}
            </p>
            {isEditing ? (
                <input
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full bg-zinc-50 border-none rounded-lg p-2 text-xs font-bold text-zinc-800 focus:ring-1 focus:ring-[#D4AF37]"
                />
            ) : (
                <p className="text-xs font-bold text-zinc-800">{value || "---"}</p>
            )}
        </div>
    );
}