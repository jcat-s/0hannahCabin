import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { onAuthStateChanged, User } from 'firebase/auth'; // Import User type for TS
import { auth } from '../shared/lib/firebase';
import AdminApp from './AdminApp';
import { AdminLogin } from './AdminAuth';
import '../styles/index.css'; // Siguraduhing tama ang path ng CSS mo

function Root() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!auth) return;

        // Ito ang "Secret Sauce" - nakikinig ito sa auth changes
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            console.log("Auth State Changed:", currentUser ? "User Logged In" : "User Logged Out");
            setUser(currentUser);
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

    // KUNG WALANG USER, LOGIN PAGE. KUNG MERON, ADMIN APP.
    return user ? <AdminApp /> : <AdminLogin />;
}

// Siguraduhing naka-wrap sa StrictMode at Root component ang nire-render
const rootElement = document.getElementById('root');
if (rootElement) {
    ReactDOM.createRoot(rootElement).render(
        <React.StrictMode>
            <Root />
        </React.StrictMode>
    );
}