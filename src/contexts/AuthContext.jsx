import { createContext, useContext, useState, useEffect } from 'react';
import { auth, db, googleProvider } from '../firebase';
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    signOut,
    updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

const AuthContext = createContext(null);

/**
 * AuthProvider
 * Provides: { user, loading, login, register, loginWithGoogle, logout }
 *
 * register(email, password, fullName):
 *   - Creates Firebase Auth user
 *   - Updates displayName via updateProfile
 *   - Creates users/{uid}/profile doc in Firestore with name + email + createdAt
 *
 * loginWithGoogle():
 *   - Signs in via Google popup
 *   - Creates profile doc on first sign-in (idempotent — skips if exists)
 */
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            setUser(firebaseUser);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // ─── Email + Password login ────────────────────────────────────────
    const login = (email, password) => {
        return signInWithEmailAndPassword(auth, email, password);
    };

    // ─── Email + Password register ─────────────────────────────────────
    const register = async (email, password, fullName) => {
        const { user: newUser } = await createUserWithEmailAndPassword(auth, email, password);

        // Set displayName in Firebase Auth
        await updateProfile(newUser, { displayName: fullName });

        // Create user profile doc in Firestore
        await setDoc(doc(db, 'users', newUser.uid, 'profile', 'info'), {
            uid: newUser.uid,
            email: newUser.email,
            name: fullName,
            provider: 'email',
            createdAt: serverTimestamp(),
        });

        return newUser;
    };

    // ─── Google Sign-In ────────────────────────────────────────────────
    const loginWithGoogle = async () => {
        const { user: googleUser } = await signInWithPopup(auth, googleProvider);

        // Only create profile doc if it doesn't exist (first time)
        const profileRef = doc(db, 'users', googleUser.uid, 'profile', 'info');
        const snap = await getDoc(profileRef);

        if (!snap.exists()) {
            await setDoc(profileRef, {
                uid: googleUser.uid,
                email: googleUser.email,
                name: googleUser.displayName || '',
                provider: 'google',
                createdAt: serverTimestamp(),
            });
        }

        return googleUser;
    };

    // ─── Logout ───────────────────────────────────────────────────────
    const logout = () => signOut(auth);

    const value = { user, loading, login, register, loginWithGoogle, logout };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
}
