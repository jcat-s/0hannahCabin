import React, { useState } from "react";
import { auth, db } from "../../shared/lib/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { Chrome, User, Smartphone, MapPin, ArrowRight } from "lucide-react";

export function AuthPage() {
  const [loading, setLoading] = useState(false);
  const [userAuth, setUserAuth] = useState<any>(null);

  // Legal Identity Fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [mobile, setMobile] = useState("");
  const [address, setAddress] = useState("");

  const handleGoogleLogin = async () => {
    // TypeScript Safety Check: Pinapatunayan na initialized ang Firebase
    if (!auth || !db) {
      alert("Firebase is not properly initialized. Please check your connection.");
      return;
    }

    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userDoc = await getDoc(doc(db, "users", user.uid));

      if (userDoc.exists()) {
        window.location.reload(); // Pasok agad kung registered na
      } else {
        setUserAuth(user);

        // Auto-split Google display name para sa convenience ng guest
        if (user.displayName) {
          const names = user.displayName.split(" ");
          setFirstName(names[0] || "");
          setLastName(names.slice(1).join(" ") || "");
        }
      }
    } catch (error) {
      console.error("Login Error:", error);
      alert("Browser blocked the popup or connection failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleFinalSubmit = async () => {
    // Basic validation
    if (!firstName || !lastName || !mobile || !address) {
      alert("Please provide all legal information.");
      return;
    }

    // TypeScript Safety Check
    if (!db || !userAuth) return;

    setLoading(true);
    try {
      await setDoc(doc(db, "users", userAuth.uid), {
        uid: userAuth.uid,
        firstName,
        lastName,
        fullName: `${firstName} ${lastName}`,
        email: userAuth.email,
        mobile,
        address,
        photoURL: userAuth.photoURL, // Image URL mula sa Google
        role: "guest",
        createdAt: serverTimestamp(),
      });
      window.location.reload();
    } catch (error) {
      console.error("Save Error:", error);
      alert("Failed to save profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] flex items-center justify-center p-6 text-zinc-900">
      <div className="max-w-xl w-full space-y-8">
        <div className="text-center">
          <h2 className="text-[#D4AF37] tracking-[0.6em] font-black text-[10px] uppercase mb-3">The Ohannah Experience</h2>
          <h1 className="text-5xl font-serif italic">Guest Portal</h1>
        </div>

        <div className="bg-white rounded-[3.5rem] p-12 shadow-sm border border-zinc-100">
          {!userAuth ? (
            <div className="text-center space-y-10 py-10">
              <h3 className="text-xl font-bold text-zinc-800 tracking-tight">Exclusive Access</h3>
              <button
                disabled={loading}
                onClick={handleGoogleLogin}
                className="w-full py-6 px-8 rounded-[2rem] bg-zinc-950 text-white flex items-center justify-between group hover:shadow-2xl transition-all disabled:opacity-50"
              >
                <div className="flex items-center gap-5">
                  <Chrome size={22} className={loading ? "animate-spin" : ""} />
                  <span className="text-[11px] font-black uppercase tracking-[0.3em]">
                    {loading ? "Connecting..." : "Continue with Google"}
                  </span>
                </div>
                <ArrowRight size={20} />
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Section: Legal Identity */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37] ml-2">Legal Identity</h3>

                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-4 ml-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400">First Name</label>
                    <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Last Name</label>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)}
                      placeholder="e.g. Juan" className="w-full p-5 rounded-2xl bg-zinc-50 border-none outline-none text-sm font-medium focus:ring-1 ring-[#D4AF37]/20"
                    />
                    <input
                      type="text" value={lastName} onChange={(e) => setLastName(e.target.value)}
                      placeholder="e.g. Dela Cruz" className="w-full p-5 rounded-2xl bg-zinc-50 border-none outline-none text-sm font-medium focus:ring-1 ring-[#D4AF37]/20"
                    />
                  </div>
                </div>
              </div>

              {/* Section: Contact */}
              <div className="space-y-2">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-2">Contact Number</h3>
                <input
                  type="tel" value={mobile} onChange={(e) => setMobile(e.target.value)}
                  placeholder="Enter Mobile Number" className="w-full p-5 rounded-2xl bg-zinc-50 border-none outline-none text-sm font-medium focus:ring-1 ring-[#D4AF37]/20"
                />
              </div>

              {/* Section: Address */}
              <div className="space-y-2">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-2">Permanent Address</h3>
                <textarea
                  value={address} onChange={(e) => setAddress(e.target.value)}
                  placeholder="House No., Street, City, Province"
                  className="w-full p-5 rounded-2xl bg-zinc-50 border-none outline-none text-sm font-medium min-h-[100px] resize-none focus:ring-1 ring-[#D4AF37]/20"
                />
              </div>

              <button
                disabled={loading}
                onClick={handleFinalSubmit}
                className="w-full py-6 mt-4 rounded-[2rem] bg-zinc-950 text-white text-[11px] font-black uppercase tracking-[0.4em] hover:bg-[#D4AF37] transition-all disabled:opacity-50 active:scale-95"
              >
                {loading ? "Establishing Profile..." : "Establish Profile"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}