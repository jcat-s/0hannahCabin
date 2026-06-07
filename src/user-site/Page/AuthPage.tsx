import React, { useState } from "react";
import { auth, db } from "../../shared/lib/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { Chrome, ArrowRight } from "lucide-react";

export function AuthPage() {
  const [loading, setLoading] = useState(false);
  const [userAuth, setUserAuth] = useState<any>(null);

  // Legal Identity Fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  // Dynamic Contact Fields for International Support
  const [dialCode, setDialCode] = useState("+63");
  const [mobile, setMobile] = useState("");

  // Flexible Address Fields (No hardcoding)
  const [country, setCountry] = useState("Philippines");
  const [stateProvince, setStateProvince] = useState("");
  const [city, setCity] = useState("");
  const [streetAddress, setStreetAddress] = useState("");

  const handleGoogleLogin = async () => {
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
        window.location.reload();
      } else {
        setUserAuth(user);

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

  // Restrict mobile input to numbers only, allowing up to 15 digits (International Standard)
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, "");
    if (rawValue.length <= 15) {
      setMobile(rawValue);
    }
  };

  // Allow dynamic dial codes (e.g., +1, +82, +44)
  const handleDialCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow '+' and numbers
    if (/^[+0-9]*$/.test(value) && value.length <= 5) {
      setDialCode(value);
    }
  };

  const handleFinalSubmit = async () => {
    const fullAddress = `${streetAddress}, ${city}, ${stateProvince}, ${country}`;
    const fullMobile = `${dialCode}${mobile}`;

    // Basic validation
    if (!firstName || !lastName || !mobile || !country || !stateProvince || !city || !streetAddress) {
      alert("Please complete all legal information correctly.");
      return;
    }

    if (!db || !userAuth) return;

    setLoading(true);
    try {
      await setDoc(doc(db, "users", userAuth.uid), {
        uid: userAuth.uid,
        firstName,
        lastName,
        fullName: `${firstName} ${lastName}`,
        email: userAuth.email,
        mobile: fullMobile,
        address: fullAddress,
        photoURL: userAuth.photoURL,
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
                <div className="flex items-center bg-zinc-50 rounded-2xl focus-within:ring-1 ring-[#D4AF37]/20 overflow-hidden">
                  <input
                    type="text"
                    value={dialCode}
                    onChange={handleDialCodeChange}
                    placeholder="+63"
                    className="w-20 pl-5 py-5 pr-2 bg-transparent border-r border-zinc-200 outline-none text-sm font-medium text-zinc-500 text-center"
                  />
                  <input
                    type="tel"
                    value={mobile}
                    onChange={handlePhoneChange}
                    placeholder="000 000 0000"
                    className="w-full py-5 px-4 bg-transparent border-none outline-none text-sm font-medium"
                  />
                </div>
              </div>

              {/* Section: Address */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-2 mt-2">Permanent Address</h3>

                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="Country"
                    className="w-full p-5 rounded-2xl bg-zinc-50 border-none outline-none text-sm font-medium focus:ring-1 ring-[#D4AF37]/20"
                  />
                  <input
                    type="text"
                    value={stateProvince}
                    onChange={(e) => setStateProvince(e.target.value)}
                    placeholder="State / Province"
                    className="w-full p-5 rounded-2xl bg-zinc-50 border-none outline-none text-sm font-medium focus:ring-1 ring-[#D4AF37]/20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City / Municipality"
                    className="w-full p-5 rounded-2xl bg-zinc-50 border-none outline-none text-sm font-medium focus:ring-1 ring-[#D4AF37]/20"
                  />
                  <input
                    type="text"
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                    placeholder="Street, House No."
                    className="w-full p-5 rounded-2xl bg-zinc-50 border-none outline-none text-sm font-medium focus:ring-1 ring-[#D4AF37]/20"
                  />
                </div>
              </div>

              <button
                disabled={loading}
                onClick={handleFinalSubmit}
                className="w-full py-6 mt-6 rounded-[2rem] bg-zinc-950 text-white text-[11px] font-black uppercase tracking-[0.4em] hover:bg-[#D4AF37] transition-all disabled:opacity-50 active:scale-95"
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