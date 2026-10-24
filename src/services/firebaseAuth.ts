import {
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
} from 'firebase/firestore';
import { auth, db } from './firebaseService';
import { UserProfile } from '../types';
import { CleanSpotStore } from './storage';

export { auth, db };

/**
 * Multi-user direct account login for user's personal Google email
 * Creates / fetches user and saves to Firestore & local storage
 */
export async function registerOrLoginUser(
  email: string,
  name?: string
): Promise<UserProfile> {
  const cleanEmail = email.trim().toLowerCase();
  const existing = CleanSpotStore.getUsers().find(
    (u) => u.email.toLowerCase() === cleanEmail
  );

  if (existing) {
    CleanSpotStore.setCurrentUser(existing);
    return existing;
  }

  const newUser: UserProfile = {
    id: `user_${Date.now()}`,
    name: name?.trim() || cleanEmail.split('@')[0],
    email: cleanEmail,
    phone: '+234 800 000 0000',
    state: 'Akwa Ibom State',
    lga: 'Uyo (Capital City)',
    gender: 'Prefer not to say',
    role: 'reporter',
    avatarUrl:
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    points: 100,
    totalCleanedWastes: 0,
    collectionsCount: 0,
    reportsCount: 0,
    createdAt: new Date().toISOString(),
    profileCompleted: false,
  };

  try {
    const userDocRef = doc(db, 'users', newUser.id);
    await setDoc(userDocRef, newUser, { merge: true });
  } catch {
    // offline fallback
  }

  CleanSpotStore.addUser(newUser);
  CleanSpotStore.setCurrentUser(newUser);
  return newUser;
}
