import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // 1. Import BrowserRouter
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from '../shared/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import AdminApp from './AdminApp';
import { AdminLogin } from './AdminAuth';
import '../styles/index.css';

function Root() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        if (!auth) return;

        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            console.log("Auth State Changed:", currentUser ? "User Logged In" : "User Logged Out");
            setUser(currentUser);

            if (currentUser && db) {
                try {
                    const adminDoc = await getDoc(doc(db, "admins", currentUser.uid));
                    const isAdminUser = adminDoc.exists() && adminDoc.data().role === "admin";
                    setIsAdmin(!!isAdminUser);
                } catch (e) {
                    console.error("Error checking admin registry:", e);
                    setIsAdmin(false);
                }
            } else {
                setIsAdmin(false);
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <div className="text-[#D4AF37] font-black tracking-[0.5em] animate-pulse text-[10px] uppercase">
                    Verifying Encrypted Access...
                </div>
            </div>
        );
    }

    // The user's authentication status and admin registry determine which UI to show.
    // Only allow access to AdminApp when the authenticated user is also registered as an admin.
    return user && isAdmin ? <AdminApp /> : <AdminLogin />;
}

const rootElement = document.getElementById('root');
if (rootElement) {
    ReactDOM.createRoot(rootElement).render(
        <React.StrictMode>
            {/* Wrap the Root component in BrowserRouter */}
            <BrowserRouter>
                <Root />
            </BrowserRouter>
        </React.StrictMode>
    );
}