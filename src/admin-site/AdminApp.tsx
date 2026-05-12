import React, { useState, useEffect } from "react";
import { collection, query, onSnapshot, doc, getDoc, updateDoc, deleteDoc, orderBy, Firestore } from "firebase/firestore";
import { signOut, onAuthStateChanged } from "firebase/auth";
import {
  Inbox, Calendar, TrendingUp, LogOut,
  UserCircle, AlertTriangle, Menu, X
} from "lucide-react";
import { db, auth } from "../shared/lib/firebase";
import { Reservations } from "./Reservations";
import { Analytics } from "./Analytics";
import { CalendarView } from "./Calendar";

export default function AdminApp() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'bookings' | 'calendar' | 'analytics'>('bookings');
  const [adminData, setAdminData] = useState<{ name: string; email: string } | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    if (!db || !auth) return;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const adminDoc = await getDoc(doc(db as Firestore, "admins", user.uid));
        if (adminDoc.exists()) {
          setAdminData({
            name: adminDoc.data().name || "Administrator",
            email: user.email || adminDoc.data().email
          });
        }
      }
    });

    const q = query(collection(db as Firestore, "bookings"), orderBy("createdAt", "desc"));
    const unsubscribeBookings = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBookings(data);
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeBookings();
    };
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth!);
    } catch (e) {
      console.error("Logout Error:", e);
    }
  };

  const updateStatus = async (id: string, status: string, message?: string) => {
    try {
      const updateData: any = { status };
      if (message) updateData.statusMessage = message;
      await updateDoc(doc(db as Firestore, "bookings", id), updateData);
    } catch (e) {
      console.error("Update Error:", e);
    }
  };

  const deleteBooking = async (id: string | string[]) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;

    try {
      if (Array.isArray(id)) {
        const deletePromises = id.map(singleId => deleteDoc(doc(db as Firestore, "bookings", singleId)));
        await Promise.all(deletePromises);
      } else {
        await deleteDoc(doc(db as Firestore, "bookings", id));
      }
    } catch (e) {
      console.error("Delete Error:", e);
    }
  };

  return (
    <div className="h-screen w-full bg-[#F8F9FA] flex flex-col lg:flex-row font-sans text-zinc-900 overflow-hidden">

      {/* --- MOBILE TOP BAR --- */}
      <div className="lg:hidden bg-zinc-950 text-white p-4 flex justify-between items-center z-[70] border-b border-white/5 shrink-0">
        <h1 className="text-lg font-serif italic tracking-tight">
          Ohannah <span className="text-[#D4AF37] font-black not-italic">Admin</span>
        </h1>
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="bg-zinc-900 p-2 rounded-xl border border-white/10"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* --- SIDEBAR --- */}
      <aside className={`
        fixed inset-y-0 left-0 z-[80] w-72 bg-zinc-950 flex flex-col text-white border-r border-white/5 transition-transform duration-500 ease-in-out lg:translate-x-0 lg:relative lg:h-screen shrink-0
        ${isSidebarOpen ? "translate-x-0 shadow-[20px_0_60px_rgba(0,0,0,0.5)]" : "-translate-x-full"}
      `}>
        <div className="p-8 flex justify-between items-center shrink-0">
          <h1 className="text-xl font-serif italic tracking-tight hidden lg:block">
            Ohannah Cabin <span className="text-[#D4AF37] font-black not-italic ml-1">Admin</span>
          </h1>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-2 text-zinc-500 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto scrollbar-hide">
          <NavItem
            icon={<Inbox size={18} />}
            label="Bookings"
            active={activeTab === 'bookings'}
            onClick={() => { setActiveTab('bookings'); setIsSidebarOpen(false); }}
          />
          <NavItem
            icon={<Calendar size={18} />}
            label="Calendar"
            active={activeTab === 'calendar'}
            onClick={() => { setActiveTab('calendar'); setIsSidebarOpen(false); }}
          />
          <NavItem
            icon={<TrendingUp size={18} />}
            label="Analytics"
            active={activeTab === 'analytics'}
            onClick={() => { setActiveTab('analytics'); setIsSidebarOpen(false); }}
          />
        </nav>

        <div className="p-6 bg-zinc-950 border-t border-white/10 shrink-0">
          <div className="flex items-center gap-3 mb-6 px-2">
            <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-[#D4AF37] border border-white/5 shrink-0">
              <UserCircle size={24} />
            </div>
            <div className="overflow-hidden text-left">
              <p className="text-[10px] font-black uppercase tracking-widest truncate">
                {adminData?.name || "Accessing..."}
              </p>
              <p className="text-[8px] text-zinc-500 font-bold truncate italic">
                {adminData?.email || "..."}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowLogoutModal(true)}
            className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all text-red-400 hover:bg-red-500/10 group bg-red-500/5 border border-red-500/10"
          >
            <LogOut size={18} />
            <span className="text-[11px] font-black uppercase tracking-[0.2em]">Logout</span>
          </button>
        </div>
      </aside>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm z-[75] lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 overflow-y-auto scroll-smooth relative">
        <div className="max-w-7xl mx-auto p-6 lg:p-12 pb-32">
          <header className="mb-8 lg:mb-12">
            <h2 className="text-4xl lg:text-6xl font-serif italic font-black tracking-tighter text-zinc-900">
              {activeTab === 'bookings' ? 'Bookings' :
                activeTab === 'calendar' ? 'Calendar' : 'Analytics'}
            </h2>
            <p className="text-zinc-400 text-[10px] font-black uppercase tracking-[0.4em] mt-3 italic">
              Management Terminal
            </p>
          </header>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
              <div className="w-10 h-10 border-4 border-[#D4AF37]/20 border-t-[#D4AF37] rounded-full animate-spin" />
              <span className="text-[#D4AF37] font-black text-[10px] tracking-[0.5em] uppercase">Syncing...</span>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              {activeTab === 'bookings' && (
                <Reservations
                  bookings={bookings}
                  onStatusUpdate={updateStatus}
                  onDelete={deleteBooking}
                />
              )}
              {activeTab === 'calendar' && (
                <CalendarView bookings={bookings} />
              )}
              {activeTab === 'analytics' && (
                <Analytics bookings={bookings} />
              )}
            </div>
          )}
        </div>
      </main>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] bg-zinc-950/80 backdrop-blur-xl flex items-center justify-center p-6">
          <div className="bg-white rounded-[3rem] p-10 max-w-sm w-full text-center shadow-2xl">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-xl font-black uppercase tracking-tighter text-zinc-900">Sign Out?</h3>
            <div className="flex flex-col gap-2 mt-8">
              <button onClick={handleLogout} className="w-full py-4 bg-zinc-900 text-white rounded-xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-zinc-800 transition-all">Logout</button>
              <button onClick={() => setShowLogoutModal(false)} className="w-full py-4 bg-zinc-100 text-zinc-400 rounded-xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-zinc-200 transition-all">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function NavItem({ icon, label, active = false, onClick }: { icon: any, label: string, active?: boolean, onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 group ${active
        ? 'bg-[#D4AF37] text-zinc-950 shadow-xl shadow-[#D4AF37]/20 scale-[1.02]'
        : 'text-zinc-500 hover:text-white hover:bg-white/5'
        }`}
    >
      <span className={`${active ? 'text-zinc-950' : 'group-hover:text-[#D4AF37]'} transition-colors`}>
        {icon}
      </span>
      <span className="text-[10px] font-black uppercase tracking-[0.2em]">{label}</span>
    </button>
  );
}