import React, { useState } from "react";
import { auth, db } from "../../shared/lib/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { Chrome, User, Smartphone, MapPin, ArrowRight } from "lucide-react";

export function AuthPage() {
  const [loading, setLoading] = useState(false);
  const [userAuth, setUserAuth] = useState<any>(null);

  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [address, setAddress] = useState("");

  const handleGoogleLogin = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userDoc = await getDoc(doc(db, "users", user.uid));

      if (userDoc.exists()) {
        window.location.reload(); // Pasok na agad kung registered na
      } else {
        setUserAuth(user);
        setFullName(user.displayName || "");
      }
    } catch (error) {
      console.error("Login Error:", error);
      alert("Naka-block ang popup sa browser mo. Paki-allow po.");
    } finally {
      setLoading(false);
    }
  };

  const handleFinalSubmit = async () => {
    if (!fullName || !mobile || !address) return;
    setLoading(true);
    try {
      await setDoc(doc(db, "users", userAuth.uid), {
        uid: userAuth.uid,
        fullName,
        email: userAuth.email,
        mobile,
        address,
        photoURL: userAuth.photoURL,
        createdAt: serverTimestamp(),
      });
      window.location.reload();
    } catch (error) {
      console.error("Save Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] flex items-center justify-center p-6">
      <div className="max-w-xl w-full space-y-8">
        <div className="text-center">
          <h2 className="text-[#D4AF37] tracking-[0.6em] font-black text-[10px] uppercase mb-3">The Ohannah Experience</h2>
          <h1 className="text-5xl font-serif italic text-zinc-900">Guest Portal</h1>
        </div>

        <div className="bg-white rounded-[3.5rem] p-12 shadow-sm border border-zinc-100">
          {!userAuth ? (
            <div className="text-center space-y-10 py-10">
              <h3 className="text-xl font-bold text-zinc-800">Exclusive Access</h3>
              <button
                onClick={handleGoogleLogin}
                className="w-full py-6 px-8 rounded-[2rem] bg-zinc-950 text-white flex items-center justify-between group hover:shadow-2xl transition-all"
              >
                <div className="flex items-center gap-5">
                  <Chrome size={22} />
                  <span className="text-[11px] font-black uppercase tracking-[0.3em]">Continue with Google</span>
                </div>
                <ArrowRight size={20} />
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              <input
                type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
                placeholder="Full Name" className="w-full p-5 rounded-2xl bg-zinc-50 border-none outline-none"
              />
              <input
                type="text" value={mobile} onChange={(e) => setMobile(e.target.value)}
                placeholder="Mobile Number" className="w-full p-5 rounded-2xl bg-zinc-50 border-none outline-none"
              />
              <input
                type="text" value={address} onChange={(e) => setAddress(e.target.value)}
                placeholder="Address" className="w-full p-5 rounded-2xl bg-zinc-50 border-none outline-none"
              />
              <button
                onClick={handleFinalSubmit}
                className="w-full py-6 rounded-[2rem] bg-zinc-950 text-white text-[11px] font-black uppercase tracking-[0.4em]"
              >
                Establish Profile
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}