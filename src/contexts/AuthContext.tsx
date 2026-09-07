'use client'

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../lib/firebase";
import { subscribeToUserProfile } from "../services/userProfileService";

interface AuthContextData {
    user: User | null;
    loading: boolean;
    companyName: string;
}

const AuthContext = createContext<AuthContextData>({
    user: null,
    loading: true,
    companyName: '',
});

export function AuthProvider({ children }: {
    children:
    React.ReactNode
}) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true)
    const [companyName, setCompanyName] = useState('');

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            setUser(firebaseUser);
            setLoading(false)
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!user) return;

        const unsubscribe = subscribeToUserProfile(user.uid, (profile) => {
            setCompanyName(profile.companyName);
        });

        return () => {
            unsubscribe();
            setCompanyName('');
        };
    }, [user]);

    return (
        <AuthContext.Provider value={{ user, loading, companyName }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    return useContext(AuthContext);
}
