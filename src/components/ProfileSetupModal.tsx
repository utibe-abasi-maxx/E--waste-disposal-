import React, { useState, useRef } from 'react';
import { UserProfile, UserRole } from '../types';
import { AKWA_IBOM_LGAS } from '../data/seedData';
import { CleanSpotStore } from '../services/storage';
import { safeUploadProfile, saveUserProfilePhoto } from '../services/firebaseService';
import { Camera, MapPin, Phone, User, Check, Sparkles, Upload, AlertCircle } from 'lucide-react';

interface ProfileSetupModalProps {
  isOpen: boolean;
  currentUser: UserProfile;
  assignedRole: UserRole;
  onCompleted: (updatedUser: UserProfile) => void;
}

export const ProfileSetupModal: React.FC<ProfileSetupModalProps> = ({
  isOpen,
  currentUser,
  assignedRole,
  onCompleted,
}) => {
  // Empty values by default - no hardcoding
  const [fullName, setFullName] = useState(currentUser.name || '');
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [state] = useState('Akwa Ibom State');
  const [lga, setLga] = useState(currentUser.lga || '');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other' | 'Prefer not to say'>(
    currentUser.gender || 'Prefer not to say'
  );

  // Profile photo state (COMPULSORY)
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>(currentUser.photoURL || currentUser.avatarUrl || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const preview = URL.createObjectURL(file);
      setPhotoPreview(preview);
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // COMPULSORY PHOTO CHECK
    if (!photoFile && !photoPreview) {
      setError('Please upload your profile photo. It is compulsory.');
      return;
    }

    if (!fullName.trim()) {
      setError('Please enter your Full Name.');
      return;
    }

    if (!lga) {
      setError('Please select your LGA.');
      return;
    }

    if (!phone.trim()) {
      setError('Please enter your Phone Number.');
      return;
    }

    setLoading(true);

    try {
      let downloadURL = photoPreview;
      if (photoFile) {
        const uploaded = await safeUploadProfile(photoFile, currentUser.id);
        if (uploaded) {
          downloadURL = uploaded;
        }
      }

      // Save to Firebase Auth, Firestore, and localStorage
      if (downloadURL) {
        try {
          await saveUserProfilePhoto(currentUser.id, downloadURL);
        } catch (photoErr) {
          console.warn('Notice saving profile photo:', photoErr);
        }
      }

      const updated = CleanSpotStore.updateUserProfile({
        id: currentUser.id,
        name: fullName.trim(),
        fullName: fullName.trim(),
        phone: phone.trim(),
        state,
        lga,
        gender,
        role: assignedRole,
        photoURL: downloadURL,
        profilePhotoUrl: downloadURL,
        avatarUrl: downloadURL,
        isVerifiedCollector: assignedRole === 'collector' || assignedRole === 'agent',
        points: currentUser.points || 100,
        profileCompleted: true,
      });

      setLoading(false);
      onCompleted(updated);
    } catch (err: any) {
      setLoading(false);
      setError(err?.message || 'Error saving profile.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-emerald-100 dark:border-slate-800 overflow-hidden max-h-[92vh] flex flex-col text-gray-900 dark:text-gray-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-green-700 p-5 text-white shrink-0">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-white/20 rounded-full text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" /> Step 2: Personal Profile
          </div>
          <h2 className="text-xl font-bold">Complete Your {assignedRole === 'collector' || assignedRole === 'agent' ? 'Recovery Agent' : 'Waste Disposer'} Profile</h2>
          <p className="text-emerald-100 text-xs mt-0.5">
            Akwa Ibom State E-Waste Disposal & Safe Recycling Network
          </p>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-left">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Profile Photo - COMPULSORY */}
          <div className={`p-4 rounded-2xl border-2 transition-all ${
            photoFile || photoPreview ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-400' : 'bg-red-50/40 dark:bg-red-950/20 border-red-300'
          }`}>
            <label className="block text-xs font-black text-gray-900 dark:text-gray-100 mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1 text-red-600 dark:text-red-400 font-bold">
                Profile Photo is Compulsory - Required <span className="text-red-600 font-black text-sm">*</span>
              </span>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                photoFile || photoPreview ? 'bg-emerald-600 text-white' : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
              }`}>
                {photoFile || photoPreview ? 'Photo Ready' : 'Required'}
              </span>
            </label>

            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-emerald-500 shadow-sm shrink-0 bg-gray-100 dark:bg-slate-800 flex items-center justify-center">
                {photoPreview ? (
                  <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="w-6 h-6 text-gray-400" />
                )}
              </div>

              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm active:scale-95"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{photoFile || photoPreview ? 'Change Photo' : 'Upload Profile Photo *'}</span>
                </button>
                <p className={`text-[11px] mt-1 font-semibold ${photoFile || photoPreview ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                  {photoFile ? `✓ ${photoFile.name}` : 'Photo is required to proceed.'}
                </p>
              </div>
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              Full Name <span className="text-red-600">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. John Ekpo"
                required
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
              />
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              Phone Number <span className="text-red-600">*</span>
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 08012345678"
                required
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
              />
            </div>
          </div>

          {/* Location: State & LGA */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">State</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={state}
                  disabled
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 text-gray-700 dark:text-gray-300 text-sm cursor-not-allowed font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                LGA (Akwa Ibom State) <span className="text-red-600">*</span>
              </label>
              <select
                value={lga}
                onChange={(e) => setLga(e.target.value)}
                required
                className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium cursor-pointer"
              >
                <option value="">Select Your LGA</option>
                {AKWA_IBOM_LGAS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Gender */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">Gender</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['Male', 'Female', 'Other', 'Prefer not to say'] as const).map((g) => (
                <button
                  type="button"
                  key={g}
                  onClick={() => setGender(g)}
                  className={`py-2 px-3 text-xs font-medium rounded-xl border transition-all text-center cursor-pointer ${
                    gender === g
                      ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 font-bold ring-1 ring-emerald-500'
                      : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="pt-3">
            <button
              type="submit"
              disabled={(!photoFile && !photoPreview) || loading}
              className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-2xl transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 text-sm active:scale-[0.99] cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>Saving Profile...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Complete Setup & Launch Dashboard</span>
                </>
              )}
            </button>
            {!photoFile && !photoPreview && (
              <p className="text-xs text-center text-red-600 dark:text-red-400 font-bold mt-2">
                * Profile Photo is Compulsory - Required
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
