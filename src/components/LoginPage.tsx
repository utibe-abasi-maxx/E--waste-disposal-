import React, { useState } from 'react';
import { UserProfile, UserRole, isAgent } from '../types';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import {
  auth,
  db,
  getOrCreateUserDocument,
} from '../services/firebaseService';
import {
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
  Recycle,
} from 'lucide-react';
import { Footer } from './Footer';

interface LoginPageProps {
  onLoginSuccess: (user: UserProfile) => void;
  onRequireProfileSetup?: (uid: string, email: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onRequireProfileSetup,
}) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 1) After successful login, check if user document exists in Firestore 'users' collection and has completed profile.
  // If not completed, redirect to Step 2 (/complete-profile).
  const handleSignIn = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');

    const cleanEmail = email.trim();
    if (!cleanEmail || !password.trim()) {
      setError('Please enter both your email address and password.');
      return;
    }

    setLoading(true);

    try {
      // Direct Firebase Auth call signInWithEmailAndPassword
      const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);
      const user = userCredential.user;

      // Check user document in Firestore 'users' collection
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists() || userDocSnap.data()?.profileCompleted !== true) {
        // Step 2 profile is NOT completed yet: redirect to Step 2
        setLoading(false);
        if (onRequireProfileSetup) {
          onRequireProfileSetup(user.uid, cleanEmail);
        }
        return;
      }

      const data = userDocSnap.data() as any;
      const userProfile: UserProfile = {
        id: user.uid,
        uid: user.uid,
        name: data.fullName || data.name || cleanEmail.split('@')[0],
        fullName: data.fullName || data.name || '',
        email: data.email || cleanEmail,
        phone: data.phone || '',
        state: data.state || 'Akwa Ibom State',
        lga: data.lga || '',
        street: data.street || data.streetAddress || '',
        streetAddress: data.street || data.streetAddress || '',
        roadStreet: data.street || data.streetAddress || '',
        bio: data.bio || '',
        role: (data.role === 'recovery' || isAgent(data.role)) ? 'recovery' : (data.role as UserRole) || 'disposer',
        qualification: data.qualification || '',
        profilePhotoUrl: localStorage.getItem(`profilePhoto_${user.uid}`) || data.photoURL || data.profilePhotoUrl || data.avatarUrl || user.photoURL || '',
        avatarUrl: localStorage.getItem(`profilePhoto_${user.uid}`) || data.photoURL || data.profilePhotoUrl || data.avatarUrl || user.photoURL || '',
        photoURL: localStorage.getItem(`profilePhoto_${user.uid}`) || data.photoURL || data.profilePhotoUrl || data.avatarUrl || user.photoURL || null,
        companyName: data.companyName || '',
        yearsExp: data.yearsExp ? Number(data.yearsExp) : undefined,
        vehicleType: data.vehicleType || '',
        idCardUrl: data.idCardUrl || '',
        points: data.points ?? 100,
        profileCompleted: true,
        createdAt: data.createdAt ? String(data.createdAt) : new Date().toISOString(),
        ...data,
      };

      setLoading(false);
      onLoginSuccess(userProfile);
    } catch (err: any) {
      setLoading(false);
      let message = 'Incorrect email or password. Please try again.';
      if (
        err?.code === 'auth/user-not-found' ||
        err?.code === 'auth/wrong-password' ||
        err?.code === 'auth/invalid-credential'
      ) {
        message = 'Invalid email or password. If you do not have an account yet, switch to "Create Account" below.';
      } else if (err?.code === 'auth/invalid-email') {
        message = 'Please enter a valid email address.';
      } else if (err?.code === 'auth/too-many-requests') {
        message = 'Access temporarily disabled due to many failed login attempts. Please wait a moment or reset password.';
      } else if (err?.message) {
        message = err.message;
      }
      setError(message);
    }
  };

  // STEP 1: AUTH (Email + Password signup with Firebase Auth)
  // After user creates account, redirect them to Step 2 (/complete-profile). They CANNOT enter main app until they finish this.
  const handleSignUp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');

    const cleanEmail = email.trim();
    if (!cleanEmail || !password.trim()) {
      setError('Please enter both your email address and password.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Password and confirmation password do not match.');
      return;
    }

    setLoading(true);

    try {
      // Firebase Auth createUserWithEmailAndPassword
      const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      const user = userCredential.user;

      // Initialize pending user profile in Firestore 'users' collection with profileCompleted: false
      const userDocRef = doc(db, 'users', user.uid);
      try {
        await setDoc(userDocRef, {
          uid: user.uid,
          email: cleanEmail,
          fullName: cleanEmail.split('@')[0],
          profileCompleted: false,
          onboardingStep: 'profile',
          state: 'Akwa Ibom State',
          createdAt: new Date().toISOString(),
        }, { merge: true });
      } catch (createErr) {
        console.warn('Initializing pending profile note:', createErr);
      }

      setLoading(false);
      // Immediately transition to Step 2: Complete Profile Page
      if (onRequireProfileSetup) {
        onRequireProfileSetup(user.uid, cleanEmail);
      }
    } catch (err: any) {
      setLoading(false);
      let message = 'Registration failed. Please check your details.';
      if (err?.code === 'auth/email-already-in-use') {
        message = 'An account with this email already exists. Switch to "Sign In" below to log in.';
      } else if (err?.code === 'auth/invalid-email') {
        message = 'Please provide a valid email address.';
      } else if (err?.code === 'auth/weak-password') {
        message = 'Password should be at least 6 characters.';
      } else if (err?.message) {
        message = err.message;
      }
      setError(message);
    }
  };

  const handleEmailAuthSubmit = (e: React.FormEvent) => {
    if (isSignUp) {
      handleSignUp(e);
    } else {
      handleSignIn(e);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-900 flex flex-col items-center justify-center p-4 sm:p-6 text-white relative overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Background Glows */}
      <div className="absolute top-0 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -right-40 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 text-gray-900 shadow-2xl border border-white/20 relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-600/30 mb-3">
            <Recycle className="w-8 h-8 animate-pulse" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-emerald-950 uppercase">
            E-Waste Disposal
          </h1>
          <p className="text-sm font-semibold text-emerald-700 tracking-wide mt-0.5">
            Akwa Ibom State
          </p>
          <p className="text-xs text-gray-500 mt-2 max-w-xs mx-auto">
            Report electronic waste for safe recycling or claim collections across Akwa Ibom State.
          </p>
        </div>

        {/* Tab Toggle: Sign In vs Sign Up */}
        <div className="flex bg-gray-100 p-1 rounded-2xl mb-5">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(false);
              setError('');
            }}
            className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              !isSignUp
                ? 'bg-white text-emerald-800 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsSignUp(true);
              setError('');
            }}
            className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              isSignUp
                ? 'bg-white text-emerald-800 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium flex flex-col gap-2">
            <div className="flex items-start gap-2">
              <span className="font-bold text-red-600 shrink-0">Note:</span>
              <span className="flex-1">{error}</span>
            </div>
            {error.includes('Create Account') && !isSignUp && (
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(true);
                  setError('');
                }}
                className="self-start text-xs font-bold text-emerald-700 bg-white hover:bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-300 transition-colors shadow-xs"
              >
                Switch to Create Account &rarr;
              </button>
            )}
            {error.includes('Sign In') && isSignUp && (
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(false);
                  setError('');
                }}
                className="self-start text-xs font-bold text-emerald-700 bg-white hover:bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-300 transition-colors shadow-xs"
              >
                Switch to Sign In &rarr;
              </button>
            )}
          </div>
        )}

        {/* Email + Password Form */}
        <form onSubmit={handleEmailAuthSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-gray-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isSignUp ? 'Create a strong password (6+ chars)' : 'Enter your password'}
                className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-gray-900"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {isSignUp && (
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-gray-900"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 mt-2 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>{isSignUp ? 'Create Account & Continue' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Security & Multi-device guarantee badge */}
        <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-center gap-2 text-[11px] text-gray-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Secured by Firebase Authentication & Firestore</span>
        </div>
      </div>

      <div className="w-full max-w-md mx-auto mt-6">
        <Footer />
      </div>
    </div>
  );
};
