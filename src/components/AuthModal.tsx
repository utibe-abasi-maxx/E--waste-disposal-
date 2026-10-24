import React, { useState } from 'react';
import { UserProfile, UserRole } from '../types';
import { CleanSpotStore } from '../services/storage';
import { INITIAL_USERS } from '../data/seedData';
import { X, Mail, Lock, User, Sparkles, CheckCircle2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: UserProfile, isNewUser?: boolean) => void;
  defaultRoleHint?: UserRole;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  defaultRoleHint,
}) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;



  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please provide your email address.');
      return;
    }

    const users = CleanSpotStore.getUsers();
    const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (isSignUp) {
      if (!name) {
        setError('Please enter your full name.');
        return;
      }
      const newUser: UserProfile = {
        id: `user_${Date.now()}`,
        name: name,
        email: email,
        phone: '',
        state: 'Akwa Ibom State',
        lga: '',
        gender: 'Prefer not to say',
        role: defaultRoleHint || 'reporter',
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        points: 0,
        createdAt: new Date().toISOString(),
      };
      CleanSpotStore.setCurrentUser(newUser);
      onAuthSuccess(newUser, true);
      onClose();
    } else {
      if (existing) {
        CleanSpotStore.setCurrentUser(existing);
        onAuthSuccess(existing, false);
        onClose();
      } else {
        // First time sign-in with this email, create user and direct to role & profile setup
        const newUser: UserProfile = {
          id: `user_${Date.now()}`,
          name: email.split('@')[0].replace(/[._]/g, ' '),
          email: email,
          phone: '',
          state: 'Akwa Ibom State',
          lga: '',
          gender: 'Prefer not to say',
          role: defaultRoleHint || 'reporter',
          avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
          points: 0,
          createdAt: new Date().toISOString(),
        };
        CleanSpotStore.setCurrentUser(newUser);
        onAuthSuccess(newUser, true);
        onClose();
      }
    }
  };

  const handleQuickDemoSelect = (user: UserProfile) => {
    CleanSpotStore.setCurrentUser(user);
    onAuthSuccess(user, false);
    onClose();
  };

  const handleNewTestAccount = (role: UserRole) => {
    const freshUser: UserProfile = {
      id: `user_fresh_${Date.now()}`,
      name: '',
      email: `citizen_${Math.floor(Math.random() * 9000 + 1000)}@cleanspot.ng`,
      phone: '',
      state: 'Akwa Ibom State',
      lga: '',
      gender: 'Prefer not to say',
      role: role,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      points: 0,
      createdAt: new Date().toISOString(),
    };
    CleanSpotStore.setCurrentUser(freshUser);
    onAuthSuccess(freshUser, true);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-emerald-100 overflow-hidden">
        {/* Header with eco gradient */}
        <div className="bg-gradient-to-br from-emerald-600 via-green-600 to-teal-700 p-6 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto mb-3 shadow-inner">
            <Sparkles className="w-6 h-6 text-emerald-100" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">
            {isSignUp ? 'Join CleanSpot Akwa Ibom' : 'Welcome to CleanSpot'}
          </h2>
          <p className="text-emerald-100 text-sm mt-1">
            {isSignUp
              ? 'Join Akwa Ibom citizens and collectors building a cleaner state'
              : 'Sign in to report waste or pick materials for free recycling'}
          </p>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <span className="font-semibold">Error:</span> {error}
            </div>
          )}

          {/* Email Password Form */}
          <form onSubmit={handleFormSubmit} className="space-y-3.5">
            {isSignUp && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Osas Ighodaro"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all shadow-md shadow-emerald-600/20 active:scale-[0.99] text-sm"
            >
              {isSignUp ? 'Create CleanSpot Account' : 'Sign In with Email'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
              }}
              className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold underline underline-offset-2"
            >
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </button>
          </div>

          {/* Quick Demo Fast-Track Section */}
          <div className="mt-6 pt-5 border-t border-gray-100 bg-emerald-50/50 -mx-6 -mb-6 p-6 rounded-b-3xl">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-900 mb-2.5 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              1-Click Demo Profiles (For Testing):
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoSelect(INITIAL_USERS[0])}
                className="text-left p-2.5 bg-white border border-emerald-200 rounded-xl hover:border-emerald-400 hover:shadow-sm transition-all"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">📢</span>
                  <div>
                    <div className="text-xs font-bold text-gray-800">Emem (Reporter)</div>
                    <div className="text-[10px] text-gray-500">Eket Citizen • 420 pts</div>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoSelect(INITIAL_USERS[1])}
                className="text-left p-2.5 bg-white border border-emerald-200 rounded-xl hover:border-emerald-400 hover:shadow-sm transition-all"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">🚚</span>
                  <div>
                    <div className="text-xs font-bold text-gray-800">Aniekan (Collector)</div>
                    <div className="text-[10px] text-gray-500">Ibom Green • 640 KG</div>
                  </div>
                </div>
              </button>
            </div>

            <div className="mt-2.5 text-center">
              <button
                type="button"
                onClick={() => handleNewTestAccount(defaultRoleHint || 'reporter')}
                className="text-[11px] text-emerald-800 hover:text-emerald-950 font-medium underline"
              >
                + Test Full Onboarding Flow (Fresh User with Role & Profile Step)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
