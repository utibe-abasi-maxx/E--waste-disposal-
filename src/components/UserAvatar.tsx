import React, { useState } from 'react';
import { UserProfile } from '../types';
import { auth } from '../services/firebaseService';

interface UserAvatarProps {
  user?: UserProfile | null;
  photoUrl?: string | null;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  borderClassName?: string;
}

export function getUserEffectivePhotoURL(user?: UserProfile | null, directPhotoUrl?: string | null): string | null {
  const isInvalidUrl = (url?: string | null) => {
    if (!url || typeof url !== 'string' || !url.trim()) return true;
    const lower = url.toLowerCase();
    return lower.includes('unsplash.com') || lower.includes('placeholder') || lower.includes('dicebear');
  };

  // 1. Direct photo URL passed in if valid
  if (directPhotoUrl && !isInvalidUrl(directPhotoUrl)) {
    return directPhotoUrl;
  }
  // 2. Firebase Auth: auth.currentUser.photoURL
  if (auth.currentUser?.photoURL && !isInvalidUrl(auth.currentUser.photoURL)) {
    return auth.currentUser.photoURL;
  }
  // 3. Firestore: users/{userId}.photoURL
  if (user?.photoURL && !isInvalidUrl(user.photoURL)) {
    return user.photoURL;
  }
  if (user?.profilePhotoUrl && !isInvalidUrl(user.profilePhotoUrl)) {
    return user.profilePhotoUrl;
  }
  if (user?.avatarUrl && !isInvalidUrl(user.avatarUrl)) {
    return user.avatarUrl;
  }
  // 4. LocalStorage cache for profilePhoto_{userId}
  const uid = user?.id || user?.uid || auth.currentUser?.uid;
  if (uid) {
    try {
      const cached = localStorage.getItem(`profilePhoto_${uid}`);
      if (cached && !isInvalidUrl(cached)) {
        return cached;
      }
    } catch {
      // Ignore localStorage error
    }
  }
  return null;
}

export function getUserInitials(name?: string, email?: string): string {
  const effectiveName = (name && name.trim()) || (email && email.split('@')[0]) || 'EW';
  const parts = effectiveName.trim().split(/\s+/);
  if (parts.length >= 2 && parts[0] && parts[1]) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return effectiveName.substring(0, 2).toUpperCase();
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  user,
  photoUrl,
  name,
  size = 'md',
  className = '',
  borderClassName = 'border border-emerald-400',
}) => {
  const [imageError, setImageError] = useState(false);
  const effectivePhoto = !imageError ? getUserEffectivePhotoURL(user, photoUrl) : null;
  const effectiveName = name || user?.fullName || user?.name || user?.email || 'User';
  const initials = getUserInitials(effectiveName, user?.email);

  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-14 h-14 text-base',
    xl: 'w-16 h-16 sm:w-20 sm:h-20 text-xl font-black',
  }[size];

  if (effectivePhoto && effectivePhoto.trim() !== '') {
    return (
      <img
        src={effectivePhoto}
        alt={effectiveName}
        onError={() => setImageError(true)}
        className={`${sizeClasses} rounded-2xl object-cover shrink-0 ${borderClassName} ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeClasses} rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white font-black flex items-center justify-center tracking-wider shrink-0 shadow-sm ${borderClassName} ${className}`}
      title={effectiveName}
    >
      {initials}
    </div>
  );
};
