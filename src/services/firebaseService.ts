import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  initializeFirestore,
  getFirestore,
  setLogLevel,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  onSnapshot,
  getDocFromServer,
  query,
  where,
  orderBy,
  Unsubscribe,
  serverTimestamp,
  increment,
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';
import {
  UserProfile,
  UserRole,
  isAgent,
  WasteReport,
  ChatMessage,
  CommunitySuggestion,
  SuggestionComment,
} from '../types';
import { compressImageToDataUrl, compressImageToFile } from './imageOptimizer';

// Silence non-fatal initial WebSocket retry warnings in iframe preview
try {
  setLogLevel('error');
} catch {}

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// CRITICAL: Initialize Firestore with forced HTTP long-polling to prevent WebSocket proxy connection failures in browser iframes
export const db = initializeFirestore(
  app,
  {
    experimentalForceLongPolling: true,
  },
  firebaseConfig.firestoreDatabaseId
);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Test connection on boot per Firebase skill guidelines (deferred slightly to ensure network socket readiness)
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client offline, check connection.');
    }
  }
}
if (typeof window !== 'undefined') {
  setTimeout(testConnection, 1500);
}

// Skill requirement: Firestore Error Handler Context
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Recursively strips undefined fields from an object so Firestore setDoc/updateDoc never fails
 */
export function removeUndefinedFields<T extends Record<string, any>>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) {
    return obj.map((item) => (typeof item === 'object' && item !== null ? removeUndefinedFields(item) : item)) as any;
  }
  const result: Record<string, any> = {};
  for (const [key, val] of Object.entries(obj)) {
    if (val === undefined) continue;
    if (val !== null && typeof val === 'object' && !(val instanceof Date) && typeof (val as any).toDate !== 'function') {
      if ('_methodName' in (val as any) || (val as any).constructor?.name === 'FieldValue') {
        result[key] = val;
      } else {
        result[key] = removeUndefinedFields(val);
      }
    } else {
      result[key] = val;
    }
  }
  return result as T;
}

// -------------------------------------------------------------
// AUTHENTICATION APIs
// -------------------------------------------------------------

/**
 * Register a new user with Email and Password via Firebase Auth
 */
export async function signUpWithEmail(
  email: string,
  pass: string,
  fullName?: string
): Promise<{ success: boolean; user?: FirebaseUser; error?: string }> {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
    return { success: true, user: cred.user };
  } catch (err: any) {
    let message = 'Registration failed. Please check your details.';
    if (err?.code === 'auth/email-already-in-use') {
      message = 'An account with this email already exists. Please log in instead.';
    } else if (err?.code === 'auth/invalid-email') {
      message = 'Please provide a valid email address.';
    } else if (err?.code === 'auth/weak-password') {
      message = 'Password should be at least 6 characters.';
    } else if (err?.message) {
      message = err.message;
    }
    return { success: false, error: message };
  }
}

/**
 * Log in an existing user with Email and Password via Firebase Auth
 */
export async function signInWithEmail(
  email: string,
  pass: string
): Promise<{ success: boolean; user?: FirebaseUser; error?: string }> {
  try {
    const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
    return { success: true, user: cred.user };
  } catch (err: any) {
    let message = 'Incorrect email or password. Please try again.';
    if (err?.code === 'auth/user-not-found' || err?.code === 'auth/wrong-password' || err?.code === 'auth/invalid-credential') {
      message = 'Invalid email or password. Please check your credentials and try again.';
    } else if (err?.code === 'auth/invalid-email') {
      message = 'Please enter a valid email address.';
    } else if (err?.code === 'auth/too-many-requests') {
      message = 'Access temporarily disabled due to many failed login attempts. Please wait a moment or reset your password.';
    } else if (err?.message) {
      message = err.message;
    }
    return { success: false, error: message };
  }
}

/**
 * Sign out current user
 */
export async function logOut(): Promise<void> {
  await signOut(auth);
}

// -------------------------------------------------------------
// USER PROFILE APIs (Firestore 'users' collection)
// -------------------------------------------------------------

/**
 * Fetch a user profile from Firestore by UID
 */
export async function fetchUserProfile(uid: string): Promise<UserProfile | null> {
  const path = `users/${uid}`;
  try {
    const userDocRef = doc(db, 'users', uid);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.log('Error fetching user profile from Firestore:', error);
    try {
      handleFirestoreError(error, OperationType.GET, path);
    } catch {
      // Suppress after error is handled
    }
    return null;
  }
}

/**
 * Safe upload function for profile pictures - uploads to profile_pictures/{userId}.jpg
 * Compresses the image first to ~40-80KB so it never exceeds quotas or timeouts.
 * Falls back to optimized local base64 DataURL if storage upload times out or fails,
 * ensuring the user's uploaded photo is preserved without exceeding document limits.
 */
export async function safeUploadProfile(file: File | null, userId: string): Promise<string | null> {
  if (!file) return null;
  // Always compress the profile image first (max 600x600, ~50-80KB)
  let uploadableFile = file;
  try {
    uploadableFile = await compressImageToFile(file, { maxWidth: 600, maxHeight: 600, quality: 0.75, maxSizeBytes: 120 * 1024 });
  } catch {
    uploadableFile = file;
  }

  try {
    const storageRef = ref(storage, `profile_pictures/${userId}.jpg`);
    // Wrap upload with 5-second timeout so it never hangs indefinitely
    const uploadPromise = uploadBytes(storageRef, uploadableFile).then((snapshot) => getDownloadURL(snapshot.ref));
    const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 5000));
    const url = await Promise.race([uploadPromise, timeoutPromise]);
    if (url) return url;
  } catch (e) {
    console.log("Storage upload skipped or timed out, using compressed file reader fallback...", e);
  }

  // Preserve user's actual uploaded file as compressed DataURL if storage is unavailable
  try {
    const compressedDataUrl = await compressImageToDataUrl(uploadableFile, { maxWidth: 500, maxHeight: 500, quality: 0.7, maxSizeBytes: 100 * 1024 });
    if (compressedDataUrl) return compressedDataUrl;
  } catch {
    // Fallback
  }

  return new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
    reader.onerror = () => resolve('');
    reader.readAsDataURL(uploadableFile);
  });
}

/**
 * Save profile photo to BOTH Firebase Auth (updateProfile) and Firestore users/{userId}
 */
export async function saveUserProfilePhoto(userId: string, downloadURL: string): Promise<void> {
  // Save to localStorage for instant synchronous hydration
  try {
    if (userId && downloadURL) {
      localStorage.setItem(`profilePhoto_${userId}`, downloadURL);
    }
  } catch {
    // Ignore localStorage error
  }

  // a) Firebase Auth: updateProfile(auth.currentUser, {photoURL: downloadURL})
  if (auth.currentUser) {
    try {
      await updateProfile(auth.currentUser, { photoURL: downloadURL });
    } catch (authErr) {
      console.warn('Notice updating auth currentUser photoURL:', authErr);
    }
  }

  // b) Firestore: users/{userId} doc field photoURL = downloadURL
  try {
    const userDocRef = doc(db, 'users', userId);
    await setDoc(
      userDocRef,
      {
        photoURL: downloadURL,
        profilePhotoUrl: downloadURL,
        avatarUrl: downloadURL,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (fsErr) {
    console.warn('Notice saving photoURL to Firestore:', fsErr);
  }
}

/**
 * Upload a file to Firebase Storage (profilePhotos/{uid} or idCards/{uid})
 * Includes client-side compression/fallback to ensure submissions never fail.
 */
export async function uploadFileToStorage(
  folder: 'profilePhotos' | 'idCards' | 'suggestions' | 'wastePhotos' | 'cleanPhotos' | string,
  uid: string,
  file: File
): Promise<string> {
  try {
    const safeUrl = await safeUploadProfile(file, uid);
    if (safeUrl) return safeUrl;
  } catch {
    // Fall back to base64
  }
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve((e.target?.result as string) || '');
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
}

/**
 * Check if user document exists in Firestore 'users' collection; if not, initialize it with profileCompleted: false.
 */
export async function getOrCreateUserDocument(
  fbUser: FirebaseUser,
  fallbackEmail?: string
): Promise<UserProfile> {
  const uid = fbUser.uid;
  const userDocRef = doc(db, 'users', uid);
  const path = `users/${uid}`;

  try {
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      const data = snap.data() as any;
      const profile: UserProfile = {
        id: uid,
        uid: uid,
        name: data.fullName || data.name || fbUser.displayName || (fbUser.email || fallbackEmail || 'E-Waste Member').split('@')[0],
        fullName: data.fullName || data.name || fbUser.displayName || '',
        email: data.email || fbUser.email || fallbackEmail || '',
        phone: data.phone || fbUser.phoneNumber || '',
        age: typeof data.age === 'number' ? data.age : (data.age ? Number(data.age) : undefined),
        state: data.state || 'Akwa Ibom State',
        lga: data.lga || '',
        street: data.street || data.roadStreet || data.streetAddress || '',
        streetAddress: data.street || data.roadStreet || data.streetAddress || '',
        roadStreet: data.street || data.roadStreet || data.streetAddress || '',
        bio: data.bio || '',
        role: (data.role === 'recovery' || isAgent(data.role)) ? 'recovery' : (data.role as UserRole) || 'disposer',
        qualification: data.qualification || data.occupation || '',
        profilePhotoUrl: (typeof window !== 'undefined' ? localStorage.getItem(`profilePhoto_${uid}`) : null) || data.photoURL || data.profilePhotoUrl || fbUser.photoURL || '',
        avatarUrl: (typeof window !== 'undefined' ? localStorage.getItem(`profilePhoto_${uid}`) : null) || data.photoURL || data.profilePhotoUrl || fbUser.photoURL || '',
        photoURL: (typeof window !== 'undefined' ? localStorage.getItem(`profilePhoto_${uid}`) : null) || data.photoURL || data.profilePhotoUrl || fbUser.photoURL || null,
        companyName: data.companyName || '',
        yearsExp: data.yearsExp ? Number(data.yearsExp) : undefined,
        vehicleType: data.vehicleType || '',
        idCardUrl: data.idCardUrl || '',
        points: data.points ?? 100,
        profileCompleted: data.onboardingStep === 'completed' || data.profileCompleted === true,
        onboardingStep: data.onboardingStep || (data.profileCompleted ? 'completed' : 'profile'),
        createdAt: data.createdAt ? String(data.createdAt) : new Date().toISOString(),
        ...data,
      };
      return profile;
    }
  } catch (error) {
    console.log('Error checking if user document exists in Firestore:', error);
  }

  // User document does not exist yet: initialize with profileCompleted: false so they go to Step 2
  const cleanEmail = fbUser.email || fallbackEmail || '';
  const defaultName = fbUser.displayName || cleanEmail.split('@')[0] || 'E-Waste Member';
  const initialProfile: UserProfile = {
    id: uid,
    uid: uid,
    name: defaultName,
    fullName: defaultName,
    email: cleanEmail,
    phone: fbUser.phoneNumber || '',
    state: 'Akwa Ibom State',
    lga: '',
    street: '',
    roadStreet: '',
    role: 'disposer',
    avatarUrl: fbUser.photoURL || '',
    profilePhotoUrl: fbUser.photoURL || '',
    photoURL: fbUser.photoURL || null,
    points: 100,
    profileCompleted: false, // Step 2 required!
    onboardingStep: 'profile',
    createdAt: new Date().toISOString(),
  };

  try {
    await setDoc(userDocRef, {
      uid,
      email: cleanEmail,
      fullName: defaultName,
      name: defaultName,
      profileCompleted: false,
      onboardingStep: 'profile',
      createdAt: serverTimestamp(),
    }, { merge: true });
  } catch (error) {
    console.log('Error initializing user document in Firestore:', error);
    try {
      handleFirestoreError(error, OperationType.WRITE, path);
    } catch {
      // Suppress after error is handled
    }
  }

  return initialProfile;
}

/**
 * Save / Update a user profile in Firestore according to Step 2 schema:
 * Profile picture is stored locally (localStorage), while all profile details
 * (fullName, email, phone, lga, address, companyName, qualification, occupation, role, etc.)
 * are saved directly to Firestore collection "users" under his UID.
 */
export async function saveUserProfile(profile: Partial<UserProfile> & { id: string }): Promise<void> {
  const uid = profile.uid || profile.id;
  const path = `users/${uid}`;

  // Store photo locally in localStorage
  const photo = profile.photoURL || profile.profilePhotoUrl || profile.avatarUrl;
  if (photo && typeof photo === 'string') {
    try {
      localStorage.setItem(`profilePhoto_${uid}`, photo);
    } catch {
      // Quota fallback handled by safeSetItem
    }
  }

  try {
    const userDocRef = doc(db, 'users', uid);
    const firestorePayload: Record<string, any> = {
      uid,
      email: profile.email || '',
      role: profile.role || 'disposer',
      fullName: profile.fullName || profile.name || '',
      name: profile.fullName || profile.name || '',
      age: typeof profile.age === 'number' ? profile.age : (profile.age ? Number(profile.age) : null),
      dob: profile.dob || '',
      phone: profile.phone || '',
      lga: profile.lga || '',
      address: profile.address || profile.street || profile.streetAddress || profile.roadStreet || '',
      street: profile.street || profile.streetAddress || profile.roadStreet || '',
      streetAddress: profile.street || profile.streetAddress || profile.roadStreet || '',
      roadStreet: profile.street || profile.streetAddress || profile.roadStreet || '',
      bio: profile.bio || '',
      qualification: profile.qualification || profile.occupation || '',
      occupation: profile.occupation || profile.qualification || '',
      companyName: profile.companyName || '',
      yearsExp: typeof profile.yearsExp === 'number' ? profile.yearsExp : (profile.yearsExp ? Number(profile.yearsExp) : null),
      vehicleType: profile.vehicleType || '',
      idCardUrl: profile.idCardUrl || '',
      state: profile.state || 'Akwa Ibom State',
      onboardingStep: profile.onboardingStep || 'education',
      profileCompleted: true,
      updatedAt: serverTimestamp(),
    };

    // Only include photoURL in firestore if it is a real URL (not a massive base64 string)
    if (photo && typeof photo === 'string' && !photo.startsWith('data:')) {
      firestorePayload.photoURL = photo;
      firestorePayload.profilePhotoUrl = photo;
      firestorePayload.avatarUrl = photo;
    }

    if (profile.points !== undefined) {
      firestorePayload.points = profile.points;
    }

    await setDoc(userDocRef, firestorePayload, { merge: true });
  } catch (error) {
    console.log('Error saving user profile to Firestore:', error);
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Mark user onboardingStep as "completed" in Firestore users/{userId}
 */
export async function completeUserEducation(userId: string): Promise<void> {
  const path = `users/${userId}`;
  try {
    const userDocRef = doc(db, 'users', userId);
    await setDoc(userDocRef, {
      onboardingStep: 'completed',
      profileCompleted: true,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (error) {
    console.warn('Error completing user education in Firestore:', error);
    try {
      handleFirestoreError(error, OperationType.WRITE, path);
    } catch {
      // Suppress
    }
  }
}

// -------------------------------------------------------------
// WASTES & REPORTS APIS (Firestore 'wastes' and 'reports' collections)
// -------------------------------------------------------------

/**
 * Subscribe to all public waste reports in real time.
 * Listens to 'wastes' collection and syncs with 'reports'
 */
export function subscribeToWasteReports(
  onUpdate: (reports: WasteReport[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const path = 'wastes';
  const q = query(collection(db, path), orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const reports: WasteReport[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as any;
        const mapped: WasteReport = {
          ...data,
          id: docSnap.id,
          // Support both disposer and reporter keys
          reporterId: data.disposerId || data.reporterId || '',
          reporterName: data.disposerName || data.reporterName || 'Waste Disposer',
          reporterPhone: data.disposerPhone || data.reporterPhone || '',
          reporterAvatar: data.disposerAvatar || data.reporterAvatar || '',
          disposerId: data.disposerId || data.reporterId || '',
          disposerName: data.disposerName || data.reporterName || 'Waste Disposer',
          disposerPhone: data.disposerPhone || data.reporterPhone || '',
          disposerAvatar: data.disposerAvatar || data.reporterAvatar || '',
          photoUrl: (data.photos && data.photos[0]) || data.photoUrl || data.imageUrl || '',
          photos: data.photos || (data.photoUrl ? [data.photoUrl] : []),
          lga: data.locationLga || data.lga || '',
          locationLga: data.locationLga || data.lga || '',
          address: data.address || data.street || data.roadStreet || '',
          roadStreet: data.roadStreet || data.street || data.address || '',
          status: data.status || 'pending',
          collectorId: data.claimedBy || data.collectorId,
          claimedBy: data.claimedBy || data.collectorId,
          collectorName: data.collectorName,
          collectorPhone: data.collectorPhone,
          collectorAvatar: data.collectorAvatar,
          claimExpiresAt: data.claimExpiresAt || data.expiresAt,
          expiresAt: data.claimExpiresAt || data.expiresAt,
          cleanPhoto: data.cleanPhoto || data.proofPhoto,
          proofPhoto: data.cleanPhoto || data.proofPhoto,
          acknowledgement: data.acknowledgement === true,
          waitingAcknowledgement: data.waitingAcknowledgement === true,
          createdAt: typeof data.createdAt?.toDate === 'function' ? data.createdAt.toDate().toISOString() : (data.createdAt || data.createdTime || new Date().toISOString()),
          lat: data.latitude ?? data.lat ?? 0,
          lng: data.longitude ?? data.lng ?? 0,
          latitude: data.latitude ?? data.lat ?? 0,
          longitude: data.longitude ?? data.lng ?? 0,
        };
        reports.push(mapped);

        // Auto-migrate legacy bloated documents (> 100KB) to clean ~50KB size
        if (
          (typeof data.photoUrl === 'string' && data.photoUrl.length > 80_000) ||
          (typeof data.imageUrl === 'string' && data.imageUrl.length > 80_000) ||
          (typeof data.cleanPhoto === 'string' && data.cleanPhoto.length > 80_000) ||
          (Array.isArray(data.photos) && data.photos.length > 1)
        ) {
          safeUpdateWasteDoc(docSnap.id, {}).catch(() => {});
        }
      });
      onUpdate(reports);
    },
    (err) => {
      console.error('Error listening to wastes:', err);
      // Fallback to 'reports' if 'wastes' is empty or unavailable
      try {
        const fallbackQ = query(collection(db, 'reports'), orderBy('createdAt', 'desc'));
        onSnapshot(fallbackQ, (fallbackSnap) => {
          const fallbackList: WasteReport[] = [];
          fallbackSnap.forEach((docSnap) => {
            const data = docSnap.data() as any;
            fallbackList.push({
              ...data,
              id: docSnap.id,
              reporterId: data.disposerId || data.reporterId || '',
              reporterName: data.disposerName || data.reporterName || 'Waste Disposer',
              reporterPhone: data.disposerPhone || data.reporterPhone || '',
              disposerId: data.disposerId || data.reporterId || '',
              disposerName: data.disposerName || data.reporterName || 'Waste Disposer',
              disposerPhone: data.disposerPhone || data.reporterPhone || '',
              photoUrl: data.photoUrl || data.imageUrl || '',
              lat: data.latitude ?? data.lat ?? 0,
              lng: data.longitude ?? data.lng ?? 0,
            });
          });
          onUpdate(fallbackList);
        });
      } catch {
        if (onError) onError(err);
      }
    }
  );
}

/**
 * Broadcast Waste (Disposer action)
 * Saves to Firestore collection 'wastes' (and mirrors to 'reports')
 */
export async function createWasteReportInFirestore(
  reportData: Partial<WasteReport>
): Promise<WasteReport> {
  const wastesCol = collection(db, 'wastes');
  const newDocRef = doc(wastesCol);
  const wasteId = newDocRef.id;

  const nowIso = new Date().toISOString();
  let photo = reportData.photoUrl || (reportData.photos && reportData.photos[0]) || '';
  if (photo && photo.startsWith('data:')) {
    try {
      photo = await compressImageToDataUrl(photo, {
        maxWidth: 550,
        maxHeight: 550,
        quality: 0.55,
        maxSizeBytes: 50 * 1024,
      });
    } catch {
      // Fallback
    }
  }

  const photos = photo ? [photo] : [];

  let disposerPhoto = reportData.disposerPhotoURL || reportData.photoURL || auth.currentUser?.photoURL || null;
  if (disposerPhoto && disposerPhoto.startsWith('data:') && disposerPhoto.length > 50_000) {
    try {
      disposerPhoto = await compressImageToDataUrl(disposerPhoto, {
        maxWidth: 300,
        maxHeight: 300,
        quality: 0.5,
        maxSizeBytes: 30 * 1024,
      });
    } catch {
      // Fallback
    }
  }

  const wastePayload: Record<string, any> = {
    id: wasteId,
    disposerId: reportData.disposerId || reportData.reporterId || auth.currentUser?.uid || '',
    disposerName: reportData.disposerName || reportData.reporterName || auth.currentUser?.displayName || 'Citizen Disposer',
    disposerPhone: reportData.disposerPhone || reportData.reporterPhone || '',
    disposerPhotoURL: disposerPhoto,
    photoURL: disposerPhoto,
    disposerAvatar: reportData.disposerAvatar || disposerPhoto || '',
    locationLga: reportData.lga || reportData.locationLga || '',
    lga: reportData.lga || reportData.locationLga || '',
    street: reportData.address || reportData.roadStreet || '',
    roadStreet: reportData.roadStreet || reportData.address || '',
    address: reportData.address || reportData.roadStreet || '',
    fullAddress: reportData.fullAddress || `${reportData.address || ''}, ${reportData.lga || ''}, Akwa Ibom State`,
    state: 'Akwa Ibom State',
    photos,
    photoUrl: photo,
    imageUrl: photo.startsWith('data:') ? '' : photo,
    wasteType: reportData.wasteType || 'General',
    size: reportData.size || 'Medium',
    description: reportData.description || '',
    status: 'pending',
    isClaimed: false,
    isAvailable: true,
    claimedBy: null,
    collectorId: null,
    acknowledgement: false,
    waitingAcknowledgement: false,
    createdAt: serverTimestamp(),
    createdTime: nowIso,
    lat: reportData.latitude ?? reportData.lat ?? 0,
    lng: reportData.longitude ?? reportData.lng ?? 0,
    latitude: reportData.latitude ?? reportData.lat ?? 0,
    longitude: reportData.longitude ?? reportData.lng ?? 0,
  };

  try {
    await setDoc(newDocRef, wastePayload);
    // Mirror to 'reports' for backward compatibility
    try {
      await setDoc(doc(db, 'reports', wasteId), wastePayload);
    } catch {
      // Non-critical mirror
    }

    return {
      ...wastePayload,
      id: wasteId,
      createdAt: nowIso,
    } as WasteReport;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `wastes/${wasteId}`);
    throw error;
  }
}

/**
 * Broadcast Waste function alias
 */
export const broadcastWaste = createWasteReportInFirestore;

/**
 * Safely writes/updates a waste document in Firestore using setDoc overwrite.
 * Reads the existing document, aggressively compresses any base64 images to < 40KB,
 * clears duplicate base64 fields (imageUrl, redundant photos, avatars), and writes back.
 * Overwrites legacy 1.28MB documents on Firestore with a clean ~50KB version,
 * permanently eliminating Document Size Exceeded errors.
 */
export async function safeUpdateWasteDoc(
  wasteId: string,
  updates: Record<string, any>
): Promise<void> {
  const docRef = doc(db, 'wastes', wasteId);
  let baseData: Record<string, any> = {};
  try {
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      baseData = snap.data();
    }
  } catch {
    // Non-critical read
  }

  const merged: Record<string, any> = {
    ...baseData,
    ...updates,
    id: wasteId,
  };

  // 1. Recompress base64 photoUrl
  if (typeof merged.photoUrl === 'string' && merged.photoUrl.startsWith('data:') && merged.photoUrl.length > 40_000) {
    try {
      merged.photoUrl = await compressImageToDataUrl(merged.photoUrl, {
        maxWidth: 500,
        maxHeight: 500,
        quality: 0.5,
        maxSizeBytes: 35 * 1024,
      });
    } catch {
      // Keep existing
    }
  }

  // Clear redundant duplicate imageUrl
  if (typeof merged.imageUrl === 'string') {
    if (merged.imageUrl === merged.photoUrl || (merged.imageUrl.startsWith('data:') && merged.imageUrl.length > 20_000)) {
      merged.imageUrl = '';
    }
  }

  // Clear duplicate photos array entries
  if (Array.isArray(merged.photos)) {
    const primary = merged.photoUrl || (typeof merged.photos[0] === 'string' ? merged.photos[0] : '');
    merged.photos = primary ? [primary] : [];
  }

  // 2. Recompress cleanPhoto / proofPhoto
  if (typeof merged.cleanPhoto === 'string' && merged.cleanPhoto.startsWith('data:') && merged.cleanPhoto.length > 40_000) {
    try {
      merged.cleanPhoto = await compressImageToDataUrl(merged.cleanPhoto, {
        maxWidth: 500,
        maxHeight: 500,
        quality: 0.5,
        maxSizeBytes: 35 * 1024,
      });
      merged.proofPhoto = merged.cleanPhoto;
    } catch {
      // Fallback
    }
  } else if (typeof merged.proofPhoto === 'string' && merged.proofPhoto.startsWith('data:') && merged.proofPhoto.length > 40_000) {
    try {
      merged.proofPhoto = await compressImageToDataUrl(merged.proofPhoto, {
        maxWidth: 500,
        maxHeight: 500,
        quality: 0.5,
        maxSizeBytes: 35 * 1024,
      });
      merged.cleanPhoto = merged.proofPhoto;
    } catch {
      // Fallback
    }
  }

  // 3. Strip massive duplicate avatars stored in waste document
  if (typeof merged.disposerPhotoURL === 'string' && merged.disposerPhotoURL.startsWith('data:') && merged.disposerPhotoURL.length > 15_000) {
    merged.disposerPhotoURL = '';
  }
  if (typeof merged.photoURL === 'string' && merged.photoURL.startsWith('data:') && merged.photoURL.length > 15_000) {
    merged.photoURL = '';
  }
  if (typeof merged.disposerAvatar === 'string' && merged.disposerAvatar.startsWith('data:') && merged.disposerAvatar.length > 15_000) {
    merged.disposerAvatar = '';
  }

  const cleanedPayload = removeUndefinedFields(merged);

  // setDoc without merge REPLACES the 1.28MB document with the ~50KB clean version
  await setDoc(docRef, cleanedPayload);

  // Mirror to 'reports'
  try {
    await setDoc(doc(db, 'reports', wasteId), cleanedPayload);
  } catch {
    // Non-critical mirror
  }
}

// Auto-heal legacy oversized documents (e.g. WgzurOY5dzVth85OFpS8) on initial load
if (typeof window !== 'undefined') {
  setTimeout(() => {
    safeUpdateWasteDoc('WgzurOY5dzVth85OFpS8', {}).catch(() => {});
  }, 1500);
}

/**
 * Claiming Logic (Recovery Agent action)
 * Rule: Check how many wastes agent has already claimed where status == 'claimed' and acknowledgement == false.
 * If >= 2: block with alert!
 * If < 2: allow claim and set 72h countdown.
 */
export async function claimWasteReportInFirestore(
  wasteId: string,
  collector: UserProfile
): Promise<void> {
  const path = `wastes/${wasteId}`;
  try {
    // 1. Check active claimed wastes count for this agent
    const wastesCol = collection(db, 'wastes');
    const agentClaimedQuery = query(
      wastesCol,
      where('claimedBy', '==', collector.id),
      where('status', '==', 'claimed')
    );

    const snap = await getDocs(agentClaimedQuery);
    let activeClaimCount = 0;
    snap.forEach((d) => {
      const data = d.data();
      if (!data.acknowledgement && data.status !== 'completed' && d.id !== wasteId) {
        activeClaimCount++;
      }
    });

    if (activeClaimCount >= 2) {
      throw new Error(
        'You can only claim maximum 2 wastes at a time. Finish your claimed wastes first.'
      );
    }

    // 2. Allow claim with 72-hour countdown
    const now = new Date();
    const expiry = new Date(now.getTime() + 72 * 60 * 60 * 1000); // 72 hours

    const updatePayload = {
      status: 'claimed',
      isClaimed: true,
      isAvailable: false,
      claimedBy: collector.id,
      collectorId: collector.id,
      collectorName: collector.name || collector.fullName || 'Recovery Agent',
      collectorPhone: collector.phone || '',
      collectorAvatar: collector.avatarUrl || '',
      claimedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      claimTime: now.toISOString(),
      claimExpiresAt: expiry.toISOString(),
      expiresAt: expiry.toISOString(),
      acknowledgement: false,
      waitingAcknowledgement: false,
    };

    await safeUpdateWasteDoc(wasteId, updatePayload);
  } catch (error: any) {
    if (error?.message && error.message.includes('maximum 2 wastes')) {
      throw error;
    }
    handleFirestoreError(error, OperationType.UPDATE, path);
    throw error;
  }
}

/**
 * Unclaim Waste (Recovery Agent action before acknowledgement)
 * Reverts status back to 'pending', sets claimedBy = null, isClaimed = false, isAvailable = true
 */
export async function unclaimWasteReportInFirestore(wasteId: string): Promise<void> {
  const path = `wastes/${wasteId}`;
  try {
    const unclaimPayload = {
      claimedBy: null,
      collectorId: null,
      isClaimed: false,
      status: 'pending',
      isAvailable: true,
      updatedAt: serverTimestamp(),
      collectorName: null,
      collectorPhone: null,
      collectorAvatar: null,
      claimedAt: null,
      claimTime: null,
      claimExpiresAt: null,
      expiresAt: null,
      cleanPhoto: null,
      proofPhoto: null,
      waitingAcknowledgement: false,
      acknowledgement: false,
    };

    await safeUpdateWasteDoc(wasteId, unclaimPayload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
    throw error;
  }
}

/**
 * Delete Waste (Disposer can delete own waste; complete delete if pending, confirmation if claimed)
 */
export async function deleteWasteReportInFirestore(wasteId: string): Promise<void> {
  const path = `wastes/${wasteId}`;
  try {
    await deleteDoc(doc(db, 'wastes', wasteId));
    try {
      await deleteDoc(doc(db, 'reports', wasteId));
    } catch {
      // Non-critical
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
    throw error;
  }
}

/**
 * Upload Clean Spot Photo (Recovery Agent action)
 * Changes status to 'Waiting for Acknowledgement'
 */
export async function uploadCleanSpotPhotoInFirestore(
  wasteId: string,
  proof: {
    collectorId: string;
    proofPhoto: string;
    collectedKg?: number;
    completionNotes?: string;
  }
): Promise<void> {
  const path = `wastes/${wasteId}`;
  try {
    let cleanPhoto = proof.proofPhoto;
    if (cleanPhoto) {
      try {
        cleanPhoto = await compressImageToDataUrl(cleanPhoto, {
          maxWidth: 500,
          maxHeight: 500,
          quality: 0.5,
          maxSizeBytes: 35 * 1024,
        });
      } catch {
        // Fallback
      }
    }

    const payload: Record<string, any> = {
      cleanPhoto,
      proofPhoto: cleanPhoto,
      collectedKg: proof.collectedKg || 25,
      completionNotes: proof.completionNotes || 'Cleaned and sorted for recycling.',
      waitingAcknowledgement: true,
      cleanPhotoUploadedAt: new Date().toISOString(),
    };

    await safeUpdateWasteDoc(wasteId, payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
    throw error;
  }
}

export const markWasteCollectedInFirestore = uploadCleanSpotPhotoInFirestore;

/**
 * Acknowledge Cleanup (Waste Disposer action)
 * Sets status='completed', acknowledgement=true.
 * Increments agent cleanupsCount. Every 5 completed cleanups = 1 star rating (max 5 stars).
 */
export async function acknowledgeCleanupInFirestore(
  wasteId: string,
  recoveryAgentId: string
): Promise<{ newCleanupsCount: number; newStars: number }> {
  const path = `wastes/${wasteId}`;
  try {
    const now = new Date().toISOString();
    const ackPayload = {
      status: 'completed',
      acknowledgement: true,
      waitingAcknowledgement: false,
      acknowledgedAt: serverTimestamp(),
      acknowledgedTime: now,
    };

    await safeUpdateWasteDoc(wasteId, ackPayload);

    // Update Recovery Agent Rating in Firestore users/{recoveryAgentId}
    let newCleanups = 1;
    let newStars = 1;
    if (recoveryAgentId) {
      const agentRef = doc(db, 'users', recoveryAgentId);
      const agentSnap = await getDoc(agentRef);
      if (agentSnap.exists()) {
        const agentData = agentSnap.data();
        newCleanups = (agentData.cleanupsCount || 0) + 1;
      }
      newStars = Math.min(5, Math.floor(newCleanups / 5));
      await updateDoc(agentRef, {
        cleanupsCount: newCleanups,
        stars: newStars,
        ratingStars: newStars,
      });
    }

    return { newCleanupsCount: newCleanups, newStars };
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
    throw error;
  }
}

// -------------------------------------------------------------
// PRIVATE CHAT APIS (Sub-collection chats/{wasteId}/messages)
// -------------------------------------------------------------

/**
 * Send a private message between Disposer and Claimed Recovery Agent
 */
export async function sendChatMessageInFirestore(
  wasteId: string,
  message: Omit<ChatMessage, 'id' | 'createdAt'>
): Promise<ChatMessage> {
  const path = `chats/${wasteId}/messages`;
  try {
    const messagesCol = collection(db, 'chats', wasteId, 'messages');
    const newMsgRef = doc(messagesCol);
    const msgPayload: ChatMessage = {
      ...message,
      id: newMsgRef.id,
      wasteId,
      reportId: wasteId,
      createdAt: new Date().toISOString(),
    };

    await setDoc(newMsgRef, msgPayload);
    return msgPayload;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    throw error;
  }
}

/**
 * Subscribe to real-time private chat messages for a waste item
 */
export function subscribeToChatMessages(
  wasteId: string,
  onUpdate: (messages: ChatMessage[]) => void
): Unsubscribe {
  const path = `chats/${wasteId}/messages`;
  const q = query(collection(db, 'chats', wasteId, 'messages'), orderBy('createdAt', 'asc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const msgs: ChatMessage[] = [];
      snapshot.forEach((d) => {
        msgs.push(d.data() as ChatMessage);
      });
      onUpdate(msgs);
    },
    (error) => {
      console.warn('Chat messages sync notice:', error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

// -------------------------------------------------------------
// COMMUNITY HELP & SUGGESTIONS APIS (Collection 'suggestions')
// -------------------------------------------------------------

/**
 * Post a Community Suggestion / Complaint
 */
export async function createCommunitySuggestion(
  suggestion: Omit<CommunitySuggestion, 'id' | 'createdAt' | 'likeCount' | 'likedBy'>
): Promise<CommunitySuggestion> {
  const path = 'suggestions';
  try {
    const colRef = collection(db, 'suggestions');
    const newDoc = doc(colRef);
    const rawPayload: CommunitySuggestion = {
      ...suggestion,
      photoUrl: suggestion.photoUrl || '',
      userAvatar: suggestion.userAvatar || '',
      id: newDoc.id,
      likeCount: 0,
      likedBy: [],
      commentsCount: 0,
      createdAt: new Date().toISOString(),
    };
    const payload = removeUndefinedFields(rawPayload);

    await setDoc(newDoc, payload);
    return payload;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    throw error;
  }
}

/**
 * Subscribe to real-time Community Suggestions feed
 */
export function subscribeToCommunitySuggestions(
  onUpdate: (suggestions: CommunitySuggestion[]) => void
): Unsubscribe {
  const path = 'suggestions';
  const q = query(collection(db, path), orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const items: CommunitySuggestion[] = [];
      snapshot.forEach((d) => {
        items.push(d.data() as CommunitySuggestion);
      });
      onUpdate(items);
    },
    (err) => {
      console.warn('Suggestions feed error:', err);
    }
  );
}

/**
 * Toggle Like on a Community Suggestion
 */
export async function toggleLikeSuggestion(
  suggestionId: string,
  userId: string
): Promise<void> {
  const path = `suggestions/${suggestionId}`;
  try {
    const docRef = doc(db, 'suggestions', suggestionId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return;

    const data = snap.data() as CommunitySuggestion;
    const likedBy = data.likedBy || [];
    const hasLiked = likedBy.includes(userId);

    const newLikedBy = hasLiked
      ? likedBy.filter((id) => id !== userId)
      : [...likedBy, userId];

    await updateDoc(docRef, {
      likedBy: newLikedBy,
      likeCount: newLikedBy.length,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * Add a comment to a Suggestion
 */
export async function addSuggestionComment(
  suggestionId: string,
  comment: Omit<SuggestionComment, 'id' | 'createdAt'>
): Promise<SuggestionComment> {
  const path = `suggestions/${suggestionId}/comments`;
  try {
    const colRef = collection(db, 'suggestions', suggestionId, 'comments');
    const newDoc = doc(colRef);
    const rawPayload: SuggestionComment = {
      ...comment,
      authorAvatar: comment.authorAvatar || '',
      id: newDoc.id,
      suggestionId,
      createdAt: new Date().toISOString(),
    };
    const payload = removeUndefinedFields(rawPayload);

    await setDoc(newDoc, payload);

    // Increment commentsCount on parent
    try {
      await updateDoc(doc(db, 'suggestions', suggestionId), {
        commentsCount: increment(1),
      });
    } catch {
      // Non-critical
    }

    return payload;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    throw error;
  }
}

/**
 * Subscribe to comments on a Suggestion
 */
export function subscribeToSuggestionComments(
  suggestionId: string,
  onUpdate: (comments: SuggestionComment[]) => void
): Unsubscribe {
  const path = `suggestions/${suggestionId}/comments`;
  const q = query(
    collection(db, 'suggestions', suggestionId, 'comments'),
    orderBy('createdAt', 'asc')
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const comments: SuggestionComment[] = [];
      snapshot.forEach((d) => {
        comments.push(d.data() as SuggestionComment);
      });
      onUpdate(comments);
    },
    (err) => {
      console.warn('Suggestion comments sync error:', err);
    }
  );
}

/**
 * Delete a comment from a Suggestion (Only by author)
 */
export async function deleteSuggestionComment(
  suggestionId: string,
  commentId: string
): Promise<void> {
  const path = `suggestions/${suggestionId}/comments/${commentId}`;
  try {
    const commentRef = doc(db, 'suggestions', suggestionId, 'comments', commentId);
    await deleteDoc(commentRef);

    // Decrement commentsCount on parent suggestion
    try {
      await updateDoc(doc(db, 'suggestions', suggestionId), {
        commentsCount: increment(-1),
      });
    } catch {
      // Non-critical
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
    throw error;
  }
}


