import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { auth, googleProvider } from "../lib/firebase";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  signupWithEmail: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  goBackToApp: () => void; // Idinagdag para sa Back Button functionality
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const loginWithEmail = async (email: string, password: string) => {
    if (!auth) {
      throw new Error("Authentication is not configured.");
    }
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signupWithEmail = async (email: string, password: string) => {
    if (!auth) {
      throw new Error("Authentication is not configured.");
    }
    await createUserWithEmailAndPassword(auth, email, password);
  };

  const loginWithGoogle = async () => {
    if (!auth) {
      throw new Error("Authentication is not configured.");
    }

    // SOLUSYON SA TS ERROR: Sinisiguro natin sa TS na nageexist ang googleProvider bago gamitin
    if (!googleProvider) {
      throw new Error("Google Authentication Provider is not properly initialized.");
    }

    try {
      const result = await signInWithPopup(auth, googleProvider);
      console.log("Successfully logged in via Google Popup:", result.user);
    } catch (error: any) {
      if (error.code === "auth/popup-blocked") {
        console.error("Popup was blocked by the browser. Please enable popups for this site.");
        alert("Paki-allow ang pop-ups sa iyong browser para makapag-login gamit ang Google.");
      } else if (error.code === "auth/popup-closed-by-user") {
        console.warn("User closed the popup before finishing login.");
      } else {
        console.error("Google Auth Error:", error);
        throw error;
      }
    }
  };

  const logout = async () => {
    if (!auth) {
      return;
    }
    await signOut(auth);
  };

  // BAGONG IMPLEMENTASYON: Back button handler para bumalik sa booking form o landing page
  const goBackToApp = () => {
    // Kung gumagamit ka ng react-router-dom, pwede mong palitan ito ng navigate(-1) o navigate("/")
    window.location.href = "/";
  };

  const value: AuthContextValue = {
    user,
    loading,
    loginWithEmail,
    signupWithEmail,
    loginWithGoogle,
    logout,
    goBackToApp,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}