import React, { useState, useEffect } from "react";
import {
  collection,
  query,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  orderBy,
  Firestore
} from "firebase/firestore";
import {
  CheckCircle,
  XCircle,
  Trash2,
  Calendar,
  Users,
  Clock,
  ChevronRight,
  TrendingUp,
  Inbox,
  Phone,
  Image as ImageIcon,
  User,
  X,
  ExternalLink,
  MapPin,
  CreditCard
} from "lucide-react";
import { db } from "../shared/lib/firebase";

const SLOT_COLORS: Record<string, string> = {
  pink: "bg-pink-400",
  red: "bg-red-400",
  orange: "bg-orange-400",
  yellow: "bg-yellow-400",
  green: "bg-green-400",
  blue: "bg-blue-400",
  indigo: "bg-indigo-400",
  violet: "bg-violet-400",
};

export default function AdminApp() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  useEffect(() => {
    // Check if db is defined to prevent TS errors
    if (!db) return;

    const q = query(collection(db, "bookings"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBookings(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    // FIX: Add check for db and cast to Firestore
    if (!db) return;
    try {
      const docRef = doc(db as Firestore, "bookings", id);
      await updateDoc(docRef, { status });
    } catch (e) {
      console.error("Error updating status:", e);
    }
  };

  const deleteBooking = async (id: string) => {
    // FIX: Add check for db and cast to Firestore
    if (!db) return;
    if (window.confirm("Permanent delete this record?")) {
      try {
        const docRef = doc(db as Firestore, "bookings", id);
        await deleteDoc(docRef);
      } catch (e) {
        console.error("Error deleting:", e);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex font-sans text-zinc-900">
      {/* Sidebar */}
      <aside className="w-72 bg-zinc-950 p-8 flex flex-col gap-8 text-white sticky top-0 h-screen shrink-0">
        <div className="px-4">
          <h1 className="text-xl font-serif italic">
            Ohannah <span className="text-[#D4AF37]">Admin</span>
          </h1>
        </div>
        <nav className="space-y-2">
          <NavItem icon={<Inbox size={18} />} label="Bookings" active />
          <NavItem icon={<Calendar size={18} />} label="Calendar" />
          <NavItem icon={<TrendingUp size={18} />} label="Analytics" />
        </nav>
      </aside>

      <main className="flex-1 p-12 overflow-y-auto">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-4xl font-serif italic font-black">Reservations</h2>
            <p className="text-zinc-400 text-[10px] font-black uppercase tracking-[0.3em] mt-2 italic">Verify Guest Payments</p>
          </div>
        </header>

        {loading ? (
          <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4AF37]"></div></div>
        ) : (
          <div className="grid gap-6">
            {bookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-[3rem] p-8 border border-zinc-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">

                <div className="flex items-center gap-8 flex-1">
                  <div className={`w-3 h-20 rounded-full ${SLOT_COLORS[booking.color] || 'bg-zinc-200'} shrink-0`} />
                  <div className="grid grid-cols-3 gap-12 w-full">
                    <div className="space-y-1">
                      <span className="text-[9px] font-black uppercase tracking-widest text-[#D4AF37]">{booking.cabin}</span>
                      <h3 className="text-xl font-black uppercase tracking-tighter">{booking.customerName}</h3>
                      <div className="flex items-center gap-2 text-zinc-500 text-[11px] font-bold"><Phone size={12} /> {booking.mobile}</div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${booking.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>{booking.status}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${booking.paymentMethod === 'gcash' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>
                          {booking.paymentMethod || 'E-Wallet'}
                        </span>
                      </div>
                      <div className="text-sm font-black flex items-center gap-2">{booking.checkIn} <ChevronRight size={14} /> {booking.checkOut}</div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block">Total</span>
                        <span className="text-2xl font-black tracking-tighter">₱{booking.totalPrice?.toLocaleString()}</span>
                      </div>
                      <button onClick={() => setSelectedBooking(booking)} className="p-4 bg-zinc-50 hover:bg-zinc-100 border border-zinc-100 rounded-3xl text-[#D4AF37] transition-all flex flex-col items-center gap-1 group/btn">
                        <ImageIcon size={24} className="group-hover/btn:scale-110 transition-transform" />
                        <span className="text-[8px] font-black uppercase">Verify Pic</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-10">
                  {booking.status === "Pending" && (
                    <button onClick={() => updateStatus(booking.id, "Confirmed")} className="p-4 text-emerald-500 hover:bg-emerald-50 rounded-2xl transition-all"><CheckCircle size={28} /></button>
                  )}
                  <button onClick={() => deleteBooking(booking.id)} className="p-4 text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"><Trash2 size={24} /></button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* --- VIEW PROOF MODAL --- */}
        {selectedBooking && (
          <div className="fixed inset-0 z-[999] bg-zinc-950/60 backdrop-blur-xl flex items-center justify-center p-6" onClick={() => setSelectedBooking(null)}>
            <div className="bg-white rounded-[4rem] w-full max-w-5xl h-[85vh] overflow-hidden flex shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="flex-1 p-16 overflow-y-auto space-y-12">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[#D4AF37] mb-2">Reservation Info</p>
                    <h2 className="text-4xl font-black uppercase tracking-tighter leading-none">{selectedBooking.customerName}</h2>
                    <p className="text-zinc-400 font-bold mt-2 uppercase text-[11px] tracking-widest flex items-center gap-2"><CreditCard size={14} /> Paid via {selectedBooking.paymentMethod?.toUpperCase()}</p>
                  </div>
                  <button onClick={() => setSelectedBooking(null)} className="p-4 hover:bg-zinc-100 rounded-full"><X size={32} /></button>
                </div>
                <div className="grid grid-cols-2 gap-y-10 gap-x-12">
                  <InfoItem icon={<User size={14} />} label="Contact" value={selectedBooking.mobile} />
                  <InfoItem icon={<MapPin size={14} />} label="Address" value={selectedBooking.address} />
                  <InfoItem icon={<Users size={14} />} label="Pax" value={`${selectedBooking.guests} Adults / ${selectedBooking.kids} Kids`} />
                  <InfoItem icon={<Calendar size={14} />} label="Check-In" value={selectedBooking.checkIn} />
                  <InfoItem icon={<Calendar size={14} />} label="Check-Out" value={selectedBooking.checkOut} />
                </div>
              </div>

              {/* RIGHT SIDE: IMAGE DISPLAY */}
              <div className="w-[45%] bg-zinc-50 p-10 flex flex-col border-l border-zinc-100">
                <p className="text-[10px] font-black uppercase text-zinc-500 mb-6 px-2">Transaction Proof</p>
                <div className="flex-1 bg-white rounded-[3rem] overflow-hidden border-4 border-white shadow-2xl">
                  {/* CRITICAL FIX FOR IMAGE: Always check receiptUrl first */}
                  {selectedBooking.receiptUrl ? (
                    <img
                      src={selectedBooking.receiptUrl}
                      className="w-full h-full object-contain"
                      alt="Proof"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-zinc-300 gap-4">
                      <ImageIcon size={64} strokeWidth={1} />
                      <p className="text-[10px] font-black uppercase tracking-widest">No Proof Attached</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// Sub-components
function NavItem({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <button className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all ${active ? 'bg-[#D4AF37] text-white shadow-xl shadow-[#D4AF37]/20' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}>
      {icon} <span className="text-[11px] font-black uppercase tracking-[0.2em]">{label}</span>
    </button>
  );
}

function StatCard({ label, value, color = "text-zinc-900" }: { label: string, value: number, color?: string }) {
  return (
    <div className="bg-white px-8 py-5 rounded-[2rem] border border-zinc-100 shadow-sm text-center min-w-[150px]">
      <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block mb-1">{label}</span>
      <div className={`text-3xl font-black tracking-tighter ${color}`}>{value}</div>
    </div>
  );
}

function InfoItem({ icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-[9px] font-black text-zinc-300 uppercase tracking-[0.2em] flex items-center gap-2">{icon} {label}</p>
      <p className="text-[13px] font-black text-zinc-800 uppercase tracking-tight">{value || "---"}</p>
    </div>
  );
}