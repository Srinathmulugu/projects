import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { FirebaseError } from 'firebase/app';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  User,
} from 'firebase/auth';
import { auth, firebaseConfigError } from '@/lib/firebase';
import api from '@/lib/api';

interface AuthContextType {
  user: User | null;
  profile: any;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

const mapAuthError = (error: unknown) => {
  if (!(error instanceof FirebaseError)) {
    return error;
  }

  switch (error.code) {
    case 'auth/configuration-not-found':
      return new Error(
        'Firebase Authentication is not configured correctly for this app. Verify the web app credentials in frontend/.env.local, restart Vite, and ensure Email/Password sign-in is enabled in Firebase Console.'
      );
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return new Error('Invalid email or password.');
    case 'auth/email-already-in-use':
      return new Error('An account with this email already exists.');
    case 'auth/invalid-email':
      return new Error('Enter a valid email address.');
    case 'auth/weak-password':
      return new Error('Password must be at least 6 characters.');
    default:
      return error;
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = async () => {
    if (!auth?.currentUser) {
      setProfile(null);
      return;
    }
    try {
      const res = await api.get('/auth/profile');
      setProfile(res.data);
    } catch {
      setProfile(null);
    }
  };

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await refreshProfile();
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    if (!auth) {
      throw new Error(firebaseConfigError || 'Firebase is not configured.');
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      throw mapAuthError(error);
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    if (!auth) {
      throw new Error(firebaseConfigError || 'Firebase is not configured.');
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
      throw mapAuthError(error);
    }

    await api.post('/auth/register', { name });
  };

  const logout = async () => {
    if (!auth) {
      throw new Error(firebaseConfigError || 'Firebase is not configured.');
    }
    await signOut(auth);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, refreshProfile, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
