import React, { useState, useRef } from 'react';
import { UserProfile, UserRole } from '../types';
import { safeUploadProfile, saveUserProfile, saveUserProfilePhoto, auth, db } from '../services/firebaseService';
import { updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { CleanSpotStore } from '../services/storage';
import { compressImageToDataUrl } from '../services/imageOptimizer';
import { akwaIbomLGAs } from '../data/seedData';
import {
  User,
  Phone,
  MapPin,
  Upload,
  CheckCircle2,
  AlertCircle,
  Truck,
  Recycle,
  Shield,
  Briefcase,
  Calendar,
  Camera,
  ArrowRight,
  Sparkles,
  Building,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Footer } from './Footer';

interface ProfileSetupPageProps {
  userId: string;
  initialEmail: string;
  onProfileComplete: (user: UserProfile) => void;
}

export const ProfileSetupPage: React.FC<ProfileSetupPageProps> = ({
  userId,
  initialEmail,
  onProfileComplete,
}) => {
  // Step 2 Role selection: 'disposer' (Waste Disposer) or 'agent' (Recovery Agent)
  const [selectedRole, setSelectedRole] = useState<'disposer' | 'agent'>('disposer');

  // NO HARDCODED OR AUTO-FILLED VALUES: All values are empty strings by default
  const [qualification, setQualification] = useState('');
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [dob, setDob] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedLga, setSelectedLga] = useState('');
  const [streetAddress, setStreetAddress] = useState('');

  // Profile Picture File & Preview (COMPULSORY - Stored locally)
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string>('');

  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState<string>('');
  const [error, setError] = useState('');

  const profilePhotoInputRef = useRef<HTMLInputElement>(null);

  // Handle Profile Photo selection
  const handleProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfilePhotoFile(file);
      try {
        const previewUrl = URL.createObjectURL(file);
        setProfilePhotoPreview(previewUrl);
      } catch {
        // Fallback preview
      }
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');

    // PROFILE PHOTO COMPULSORY CHECK - Never use window.alert() in iframe
    if (!profilePhotoFile && !profilePhotoPreview) {
      setError('Please upload your profile photo. It is compulsory.');
      return;
    }

    if (!fullName.trim()) {
      setError('Please enter your Full Name.');
      return;
    }

    if (!qualification.trim()) {
      setError('Please provide your Qualification/Occupation (e.g. Student, Trader, Civil Servant, Engineer).');
      return;
    }

    if (!dob) {
      setError('Please select your Date of Birth.');
      return;
    }

    const birthDate = new Date(dob);
    const today = new Date();
    let calculatedAge = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      calculatedAge--;
    }
    if (calculatedAge < 18) {
      setError('You must be at least 18 years old to enroll in Akwa Ibom State E-Waste.');
      return;
    }

    if (!selectedLga) {
      setError('Please select your Local Government Area (LGA) in Akwa Ibom State.');
      return;
    }

    if (!phone.trim()) {
      setError('Please enter your Phone Number.');
      return;
    }

    setLoading(true);
    setLoadingText('Saving your details & proceeding to Stage 3...');

    // Guarantee valid, non-empty user ID and email
    const effectiveUserId =
      userId ||
      auth.currentUser?.uid ||
      CleanSpotStore.getCurrentUser()?.id ||
      `user_${Date.now()}`;
    const effectiveEmail =
      initialEmail ||
      auth.currentUser?.email ||
      CleanSpotStore.getCurrentUser()?.email ||
      'member@cleanspot.ng';

    try {
      // 1. Profile Picture: Compress to <= 45KB JPEG Data URL to prevent localStorage QuotaExceededError
      let localPhoto = profilePhotoPreview || '';
      if (profilePhotoFile) {
        try {
          const compressed = await compressImageToDataUrl(profilePhotoFile, {
            maxWidth: 400,
            maxHeight: 400,
            quality: 0.65,
            maxSizeBytes: 45 * 1024,
          });
          if (compressed) localPhoto = compressed;
        } catch {
          // If compression fails, read as basic data URL
          try {
            const reader = new FileReader();
            const base64Promise = new Promise<string>((resolve) => {
              reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
              reader.onerror = () => resolve('');
              reader.readAsDataURL(profilePhotoFile);
            });
            const b64 = await base64Promise;
            if (b64) localPhoto = b64;
          } catch {
            // Keep preview
          }
        }
      }

      // Safely persist photo in localStorage
      if (localPhoto) {
        try {
          localStorage.setItem(`profilePhoto_${effectiveUserId}`, localPhoto);
        } catch {
          // safe fallback
        }
      }

      // 2. Map role: 'agent' selection roots as 'recovery'
      const roleToSave: UserRole = selectedRole === 'agent' ? 'recovery' : 'disposer';
      const cleanQual = qualification.trim();
      const cleanName = fullName.trim();
      const cleanStreet = streetAddress.trim() || `${selectedLga}, Akwa Ibom`;
      const cleanCompany = companyName.trim();

      // 3. Complete User Profile Payload
      const profilePayload: UserProfile = {
        id: effectiveUserId,
        uid: effectiveUserId,
        email: effectiveEmail.trim().toLowerCase(),
        role: roleToSave,
        fullName: cleanName,
        name: cleanName,
        companyName: cleanCompany,
        qualification: cleanQual,
        occupation: cleanQual,
        photoURL: localPhoto,
        profilePhotoUrl: localPhoto,
        avatarUrl: localPhoto,
        phone: phone.trim(),
        lga: selectedLga,
        state: 'Akwa Ibom State',
        address: cleanStreet,
        street: cleanStreet,
        streetAddress: cleanStreet,
        roadStreet: cleanStreet,
        dob: dob,
        age: calculatedAge,
        onboardingStep: 'education',
        profileCompleted: true,
        points: 100,
        createdAt: new Date().toISOString(),
      };

      // 4. Update Firebase Auth displayName if available
      if (auth.currentUser) {
        try {
          await updateProfile(auth.currentUser, {
            displayName: cleanName,
          });
        } catch (authErr) {
          console.warn('Notice updating auth displayName:', authErr);
        }
      }

      // 5. Save to Firestore collection "users" with a timeout race so slow network never hangs navigation
      try {
        const userDocRef = doc(db, 'users', effectiveUserId);
        const firestoreWrite = setDoc(
          userDocRef,
          {
            uid: effectiveUserId,
            email: effectiveEmail.trim().toLowerCase(),
            fullName: cleanName,
            name: cleanName,
            phone: phone.trim(),
            lga: selectedLga,
            state: 'Akwa Ibom State',
            address: cleanStreet,
            street: cleanStreet,
            streetAddress: cleanStreet,
            roadStreet: cleanStreet,
            companyName: cleanCompany,
            qualification: cleanQual,
            occupation: cleanQual,
            role: roleToSave,
            dob: dob,
            age: calculatedAge,
            onboardingStep: 'education',
            profileCompleted: true,
            points: 100,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
        const timeout = new Promise((resolve) => setTimeout(resolve, 3000));
        await Promise.race([firestoreWrite, timeout]);
      } catch (directFsErr) {
        console.warn('Firestore write note (local store fallback):', directFsErr);
      }

      // 6. Update local CleanSpotStore
      CleanSpotStore.updateUserProfile(profilePayload);
      CleanSpotStore.setCurrentUser(profilePayload);

      // 7. Confetti celebration (safely wrapped)
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // Safe in sandboxed iframe
      }

      // 8. IMMEDIATELY navigate to Stage 3 (Waste Education)
      setLoading(false);
      onProfileComplete(profilePayload);
    } catch (err: any) {
      console.warn('Enrollment notice:', err);
      setLoading(false);
      setError(err?.message || 'An error occurred while saving your profile. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900 py-10 px-4 sm:px-6 lg:px-8 text-gray-100 font-['Plus_Jakarta_Sans',sans-serif] relative">
      {/* Background Decorative Rings */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-2xl mx-auto relative z-10 space-y-6">
        {/* Government App Header & Official Emblem */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 text-gray-900 shadow-2xl border border-emerald-500/20 text-left">
          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 border-b border-gray-100 pb-5">
            <div className="flex items-center gap-3.5">
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-emerald-800 to-green-600 flex items-center justify-center text-white shadow-md shadow-emerald-700/30">
                <Recycle className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-black uppercase tracking-widest text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Official Portal
                  </span>
                  <span className="text-[11px] font-bold text-gray-500">
                    Akwa Ibom State
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight mt-0.5">
                  Enrollment: Step 2 of 3
                </h1>
                <p className="text-xs text-gray-500">
                  Fill your occupation and profile details to enter the waste education portal.
                </p>
              </div>
            </div>

            <div className="text-right hidden sm:block">
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
                <Shield className="w-3.5 h-3.5 text-emerald-600" />
                Step 2 Complete Profile
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs font-bold mb-1.5">
              <span className="text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                Step 2: Profile & Occupation &rarr; Next: Education & Guide
              </span>
              <span className="text-emerald-700 bg-emerald-100/70 px-2.5 py-0.5 rounded-full font-extrabold text-[11px]">
                Part 2
              </span>
            </div>
            <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-600 to-teal-500 h-full rounded-full transition-all duration-500"
                style={{ width: '66%' }}
              />
            </div>
            <p className="text-[11px] text-gray-500 mt-1.5">
              Signed in as <strong className="text-gray-800">{initialEmail}</strong>
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 flex items-start gap-3 text-red-800 text-sm shadow-sm animate-shake text-left">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Required Information</p>
              <p className="text-xs text-red-700 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* STEP 2 ENROLLMENT FORM */}
        <form
          onSubmit={handleSubmit}
          className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 text-gray-900 shadow-2xl border border-emerald-500/20 space-y-5 text-left"
        >
          {/* 1. ROLE SELECTION TOGGLE */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Select Your Role in Akwa Ibom State:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedRole('disposer')}
                className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                  selectedRole === 'disposer'
                    ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500/20 text-emerald-950 font-bold'
                    : 'border-gray-200 hover:border-emerald-300 text-gray-700 bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Recycle className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-black">Waste Disposer</span>
                </div>
                <p className="text-[10px] text-gray-500 mt-1">
                  Citizens, Homes, Offices reporting waste
                </p>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole('agent')}
                className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                  selectedRole === 'agent'
                    ? 'border-teal-600 bg-teal-50/70 ring-2 ring-teal-500/20 text-teal-950 font-bold'
                    : 'border-gray-200 hover:border-teal-300 text-gray-700 bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-teal-600" />
                  <span className="text-xs font-black">Recovery Agent</span>
                </div>
                <p className="text-[10px] text-gray-500 mt-1">
                  Verified collectors picking up scrap
                </p>
              </button>
            </div>
          </div>

          {/* 2. PROFILE PICTURE SELECTION - COMPULSORY */}
          <div className={`p-4 rounded-2xl border-2 transition-all ${
            profilePhotoFile ? 'bg-emerald-50/50 border-emerald-400' : 'bg-red-50/30 border-red-300'
          }`}>
            <label className="block text-xs font-black text-gray-900 mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1 text-red-600 font-bold">
                Profile Photo is Compulsory - Required <span className="text-red-600 font-black text-sm">*</span>
              </span>
              <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                profilePhotoFile ? 'bg-emerald-600 text-white' : 'bg-red-100 text-red-800 border border-red-300'
              }`}>
                {profilePhotoFile ? 'Photo Selected' : 'Required'}
              </span>
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-gray-200 overflow-hidden flex items-center justify-center border-2 border-emerald-500 shrink-0 shadow-md">
                {profilePhotoPreview ? (
                  <img
                    src={profilePhotoPreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Camera className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <div className="flex-1 text-center sm:text-left">
                <input
                  type="file"
                  ref={profilePhotoInputRef}
                  accept="image/*"
                  onChange={handleProfilePhotoChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => profilePhotoInputRef.current?.click()}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition-all inline-flex items-center gap-2 cursor-pointer shadow-sm active:scale-95"
                >
                  <Upload className="w-4 h-4" />
                  {profilePhotoFile ? 'Change Profile Photo' : 'Upload Profile Photo *'}
                </button>
                <p className={`text-xs mt-1.5 font-bold ${profilePhotoFile ? 'text-emerald-700' : 'text-red-600'}`}>
                  {profilePhotoFile
                    ? `✓ ${profilePhotoFile.name}`
                    : 'Profile photo is required. Click above to select an image.'}
                </p>
              </div>
            </div>
          </div>

          {/* 3. QUALIFICATION / OCCUPATION */}
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200">
            <label className="block text-xs font-black text-gray-900 uppercase tracking-wide mb-1 flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-emerald-700" />
              <span>Qualification / Occupation <span className="text-red-600">*</span></span>
            </label>
            <input
              type="text"
              required
              value={qualification}
              onChange={(e) => setQualification(e.target.value)}
              placeholder={selectedRole === 'agent' ? "e.g. Scrap Recycler, Technician, Collector" : "e.g. Student, Trader, Civil Servant"}
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          {/* 3b. RECOVERY AGENT COMPANY / BUSINESS NAME */}
          {selectedRole === 'agent' && (
            <div className="p-4 bg-teal-50/60 rounded-2xl border border-teal-200">
              <label className="block text-xs font-black text-teal-950 uppercase tracking-wide mb-1 flex items-center gap-1.5">
                <Building className="w-4 h-4 text-teal-700" />
                <span>Recycling Company / Enterprise Name</span>
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Eket Green Recyclers Ltd or Independent Collector"
                className="w-full px-4 py-2.5 bg-white border border-teal-300 rounded-xl text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-teal-500 outline-none"
              />
              <p className="text-[10px] text-teal-800 mt-1">Saved to your official Recovery Agent record in Akwa Ibom State.</p>
            </div>
          )}

          {/* 4. OTHER DETAILS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Full Name <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. John Ekpo"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
                />
              </div>
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Date of Birth (18+) <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="date"
                  required
                  value={dob}
                  max={new Date(Date.now() - 18 * 365.25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none cursor-pointer"
                />
              </div>
            </div>

            {/* Local Government Area (LGA) */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                LGA (Akwa Ibom State) <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <select
                  required
                  value={selectedLga}
                  onChange={(e) => setSelectedLga(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none cursor-pointer font-medium"
                >
                  <option value="">Select Your LGA</option>
                  {akwaIbomLGAs.map((lga) => (
                    <option key={lga} value={lga}>
                      {lga}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Phone Number <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 08012345678"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
                />
              </div>
            </div>

            {/* Street / Road Address */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Street / Road Address
              </label>
              <input
                type="text"
                value={streetAddress}
                onChange={(e) => setStreetAddress(e.target.value)}
                placeholder="e.g. 14 Grace Bill Road"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
              />
            </div>
          </div>

          {/* Loading status indicator */}
          {loading && (
            <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3 text-xs text-emerald-900 font-bold flex items-center gap-2.5">
              <div className="w-4 h-4 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin shrink-0" />
              <span>{loadingText || 'Saving your details...'}</span>
            </div>
          )}

          {/* SUBMIT BUTTON: Continue to Stage 3 (Waste Education) */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 bg-gradient-to-r from-emerald-600 via-green-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold rounded-2xl transition-all shadow-xl shadow-emerald-700/25 flex items-center justify-center gap-2 text-base active:scale-[0.99] cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>Saving details & proceeding to Stage 3...</span>
                </>
              ) : (
                <>
                  <span>Continue to Stage 3: Waste Education</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
            {!profilePhotoFile && (
              <p className="text-xs text-center text-amber-700 font-semibold mt-2">
                * Tip: Upload your profile photo above to complete Step 2.
              </p>
            )}
            <p className="text-[11px] text-center text-gray-500 mt-1.5">
              Next Stage: Waste Education & Environmental Guide for Akwa Ibom State
            </p>
          </div>
        </form>

        {/* Footer */}
        <div className="pt-6">
          <Footer />
        </div>
      </div>
    </div>
  );
};
