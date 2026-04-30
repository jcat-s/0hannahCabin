import React, { useState, useEffect } from "react";
import { auth, db } from "../../shared/lib/firebase";
import { doc, getDoc, collection, query, where, onSnapshot, updateDoc } from "firebase/firestore";
import { useAuth } from "../../shared/context/AuthContext";
import { ChevronLeft, User, Users, Phone, MapPin, Calendar, Clock, CreditCard, LogOut, PartyPopper, Baby, Dog } from "lucide-react";
import { format } from "date-fns";

export function ProfilePage({ onBack }: { onBack: () => void }) {
    const { user } = useAuth();
    const [profile, setProfile] = useState<any>(null);
    const [myBookings, setMyBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);

    const profileImage = profile?.photoURL || user?.photoURL || "";
    const profileInitial = (profile?.fullName || user?.displayName || user?.email || "").charAt(0).toUpperCase();

    // Edit States
    const [editName, setEditName] = useState("");
    const [editMobile, setEditMobile] = useState("");
    const [editAddress, setEditAddress] = useState("");

    useEffect(() => {
        if (!user || !db) {
            setLoading(false);
            return;
        }

        // 1. Get User Profile from Firestore
        const fetchProfile = async () => {
            try {
                const docRef = doc(db!, "users", user.uid);
                const snap = await getDoc(docRef);
                if (snap.exists()) {
                    const data = snap.data();
                    setProfile(data);
                    setEditName(data.fullName || "");
                    setEditMobile(data.mobile || "");
                    setEditAddress(data.address || "");
                }
            } catch (err) {
                console.error("Error fetching profile:", err);
            }
        };

        // 2. Real-time Listen for User's Bookings
        const q = query(collection(db!, "bookings"), where("userId", "==", user.uid));
        const unsub = onSnapshot(q, (snap) => {
            try {
                const bookings = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
                // Sort by latest (handle both Firestore Timestamp and regular dates)
                const sorted = bookings.sort((a, b) => {
                    const aTime = a.createdAt?.seconds || (a.createdAt instanceof Date ? a.createdAt.getTime() / 1000 : 0);
                    const bTime = b.createdAt?.seconds || (b.createdAt instanceof Date ? b.createdAt.getTime() / 1000 : 0);
                    return bTime - aTime;
                });
                setMyBookings(sorted);
            } catch (err) {
                console.error("Error processing bookings:", err);
                setMyBookings([]);
            }
            setLoading(false);
        }, (error) => {
            console.error("Error listening to bookings:", error);
            setLoading(false);
        });

        fetchProfile();
        return () => unsub();
    }, [user]);

    const handleUpdateProfile = async () => {
        if (!user) return;
        try {
            await updateDoc(doc(db!, "users", user.uid), {
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
        auth?.signOut().then(() => window.location.reload());
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
                <div className="lg:col-span-4 space-y-8 lg:sticky lg:top-24 self-start">
                    <div className="text-center lg:text-left space-y-4">
                        <div className="relative inline-flex items-center justify-center w-32 h-32 rounded-full bg-zinc-100 border-4 border-white shadow-2xl mx-auto lg:mx-0 overflow-hidden">
                            {profileImage ? (
                                <img
                                    src={profileImage}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-5xl font-black text-zinc-700">{profileInitial}</span>
                            )}
                            <div className="absolute bottom-0 right-0 bg-[#D4AF37] p-2 rounded-full border-4 border-white">
                                <User size={16} className="text-white" />
                            </div>
                        </div>
                        <div>
                            <h1 className="text-3xl font-serif italic text-zinc-900">{profile?.fullName || user?.displayName || "Guest"}</h1>
                            <p className="text-sm text-zinc-500 font-medium">{user?.email || profile?.email || "No email provided"}</p>
                            <p className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-[0.4em] mt-1">Guest Member</p>
                        </div>
                        <button onClick={() => setShowProfileModal(true)} className="text-[10px] font-black uppercase text-zinc-600 hover:text-[#D4AF37] transition-colors">
                            View profile details
                        </button>
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
                                                <span className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest ${booking.status === 'Confirmed' ? 'bg-green-50 text-green-600' :
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

            {showProfileModal && (
                <div className="fixed inset-0 z-[999] bg-zinc-950/60 backdrop-blur-xl flex items-center justify-center p-6" onClick={() => setShowProfileModal(false)}>
                    <div className="bg-white rounded-[3rem] w-full max-w-2xl p-8" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-start justify-between gap-6 mb-8">
                            <div className="flex items-center gap-4">
                                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-zinc-100 overflow-hidden">
                                    {profileImage ? (
                                        <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-3xl font-black text-zinc-700">{profileInitial}</span>
                                    )}
                                </div>
                                <div>
                                    <p className="text-xs uppercase tracking-[0.4em] text-zinc-400">Guest Profile</p>
                                    <h3 className="text-2xl font-black uppercase tracking-tight">{profile?.fullName || user?.displayName || "Guest"}</h3>
                                </div>
                            </div>
                            <button onClick={() => setShowProfileModal(false)} className="text-[10px] font-black uppercase text-zinc-500 hover:text-zinc-900">Close</button>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            <InfoItem icon={<User size={14} />} label="Full Name" value={profile?.fullName || user?.displayName || "Guest"} />
                            <InfoItem icon={<Phone size={14} />} label="Mobile" value={profile?.mobile || "Not provided"} />
                            <InfoItem icon={<MapPin size={14} />} label="Address" value={profile?.address || "Not provided"} />
                            <InfoItem icon={<CreditCard size={14} />} label="Email" value={user?.email || "Not provided"} />
                        </div>
                    </div>
                </div>
            )}
        </div>
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