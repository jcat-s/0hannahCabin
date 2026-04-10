import React, { useState, useEffect } from "react";
import {
  collection,
  query,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  orderBy
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
  Inbox
} from "lucide-react";
import { db } from "../shared/lib/firebase"; // Ensure path is correct
import { format } from "date-fns";

// Color mapping to match your user-side BOOKING_COLORS
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

  // Sync with Firestore
  useEffect(() => {
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
    try {
      await updateDoc(doc(db, "bookings", id), { status });
    } catch (e) {
      console.error("Error updating status:", e);
    }
  };

  const deleteBooking = async (id: string) => {
    if (window.confirm("Delete this booking permanently?")) {
      await deleteDoc(doc(db, "bookings", id));
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex">
      {/* Sidebar */}
      <aside className="w-72 bg-zinc-950 p-8 flex flex-col gap-8 text-white">
        <div className="px-4">
          <h1 className="text-xl font-serif italic" style={{ fontFamily: "'Playfair Display', serif" }}>
            Ohannah <span className="text-[#D4AF37]">Admin</span>
          </h1>
        </div>
        <nav className="space-y-2">
          <NavItem icon={<Inbox size={18} />} label="Bookings" active />
          <NavItem icon={<Calendar size={18} />} label="Calendar" />
          <NavItem icon={<TrendingUp size={18} />} label="Analytics" />
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-12 overflow-y-auto">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-3xl font-serif italic text-zinc-900" style={{ fontFamily: "'Playfair Display', serif" }}>
              Booking Requests
            </h2>
            <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-2">
              Manage and approve guest reservations
            </p>
          </div>
          <div className="flex gap-4">
            <StatCard label="Total" value={bookings.length} />
            <StatCard label="Pending" value={bookings.filter(b => b.status === "Pending").length} color="text-orange-500" />
          </div>
        </header>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4AF37]"></div>
          </div>
        ) : (
          <div className="grid gap-6">
            {bookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-3xl p-8 border border-zinc-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
                <div className="flex items-center gap-8">
                  {/* Slot Color Indicator */}
                  <div className={`w-3 h-12 rounded-full ${SLOT_COLORS[booking.color] || 'bg-zinc-200'}`} />

                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                        {booking.cabin === 'ohannah' ? 'Ohannah Original' : 'The Dream'}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-tighter ${booking.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-600' :
                          booking.status === 'Cancelled' ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'
                        }`}>
                        {booking.status}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-zinc-800 flex items-center gap-2">
                      {format(new Date(booking.checkIn), "MMM dd")}
                      <ChevronRight size={14} className="text-zinc-300" />
                      {format(new Date(booking.checkOut), "MMM dd")}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-12">
                  <div className="flex flex-col items-center">
                    <Users size={16} className="text-zinc-300 mb-1" />
                    <span className="text-[10px] font-black">{booking.guests} Pax</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Clock size={16} className="text-zinc-300 mb-1" />
                    <span className="text-[10px] font-black uppercase tracking-tighter">{booking.stayType}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block">Total Price</span>
                    <span className="text-xl font-serif italic text-zinc-900">₱{booking.totalPrice?.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {booking.status === "Pending" && (
                    <button
                      onClick={() => updateStatus(booking.id, "Confirmed")}
                      className="p-3 text-emerald-500 hover:bg-emerald-50 rounded-2xl transition-colors"
                      title="Approve"
                    >
                      <CheckCircle size={22} />
                    </button>
                  )}
                  <button
                    onClick={() => updateStatus(booking.id, "Cancelled")}
                    className="p-3 text-orange-400 hover:bg-orange-50 rounded-2xl transition-colors"
                    title="Cancel"
                  >
                    <XCircle size={22} />
                  </button>
                  <button
                    onClick={() => deleteBooking(booking.id)}
                    className="p-3 text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={22} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

// Sub-components
function NavItem({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <button className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all ${active ? 'bg-[#D4AF37] text-white shadow-lg' : 'text-zinc-500 hover:bg-white/5 hover:text-white'}`}>
      {icon}
      <span className="text-[11px] font-bold uppercase tracking-[0.2em]">{label}</span>
    </button>
  );
}

function StatCard({ label, value, color = "text-zinc-900" }: { label: string, value: number, color?: string }) {
  return (
    <div className="bg-white px-8 py-4 rounded-[1.5rem] border border-zinc-100 shadow-sm text-center">
      <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">{label}</span>
      <div className={`text-2xl font-serif italic ${color}`}>{value}</div>
    </div>
  );
}