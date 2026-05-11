import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // 1. Import BrowserRouter
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../shared/lib/firebase';
import AdminApp from './AdminApp';
import { AdminLogin } from './AdminAuth';
import '../styles/index.css';

function Root() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!auth) return;

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

    // 2. Ang User login status ay magdedetermine kung anong UI ang lalabas,
    // pero dapat pareho silang nasa loob ng Router context.
    return user ? <AdminApp /> : <AdminLogin />;
}

const rootElement = document.getElementById('root');
if (rootElement) {
    ReactDOM.createRoot(rootElement).render(
        <React.StrictMode>
            {/* 3. I-wrap ang buong Root sa BrowserRouter */}
            <BrowserRouter>
                <Root />
            </BrowserRouter>
        </React.StrictMode>
    );
}