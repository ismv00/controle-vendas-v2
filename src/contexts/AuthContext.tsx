'use client'

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../lib/firebase";
import { subscribeToUserProfile } from "../services/userProfileService";

interface AuthContextData {
    user: User | null;
    loading: boolean;
    companyName: string;
    logoUrl: string;
    monthlyGoal: number;
    pixKey: string;
}

const AuthContext = createContext<AuthContextData>({
    user: null,
    loading: true,
    companyName: '',
    logoUrl: '',
    monthlyGoal: 0,
    pixKey: '',
});

export function AuthProvider({ children }: {
    children:
    React.ReactNode
}) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true)
    const [companyName, setCompanyName] = useState('');
    const [logoUrl, setLogoUrl] = useState('');
    const [monthlyGoal, setMonthlyGoal] = useState(0);
    const [pixKey, setPixKey] = useState('');

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
            setLogoUrl(profile.logoUrl);
            setMonthlyGoal(profile.monthlyGoal);
            setPixKey(profile.pixKey);
        });

        return () => {
            unsubscribe();
            setCompanyName('');
            setLogoUrl('');
            setMonthlyGoal(0);
            setPixKey('');
        };
    }, [user]);

    return (
        <AuthContext.Provider value={{ user, loading, companyName, logoUrl, monthlyGoal, pixKey }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    return useContext(AuthContext);
}
