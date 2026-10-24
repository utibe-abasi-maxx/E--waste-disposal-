export type UserRole = 'recovery' | 'agent' | 'collector' | 'disposer' | 'reporter' | 'disposal';

export const isAgent = (role?: string): boolean => {
  if (!role) return false;
  const r = String(role).toLowerCase().trim();
  return r === 'recovery' || r === 'agent' || r === 'collector' || r === 'recovery_agent';
};

export const isDisposer = (role?: string): boolean => {
  if (!role) return false;
  const r = String(role).toLowerCase().trim();
  return (
    (r === 'disposer' || r === 'reporter' || r === 'disposal' || r === 'disposal_agent' || r === 'citizen') &&
    !isAgent(role)
  );
};

export type WasteType = 'Plastic' | 'Organic' | 'Metal' | 'General' | 'Hazardous';

export type WasteSize = 'Small' | 'Medium' | 'Huge';

export type WasteStatus = 'pending' | 'claimed' | 'collected';

export type CollectorLevel = 'beginner' | 'medium' | 'expert';

export interface UserProfile {
  id: string; // or uid
  uid?: string;
  name: string;
  fullName?: string;
  email: string;
  phone: string;
  age?: number;
  dob?: string;
  state: string;
  lga: string;
  street?: string;
  streetAddress?: string;
  roadStreet?: string;
  address?: string;
  bio?: string;
  role: UserRole;
  qualification?: string;
  occupation?: string;
  profilePhotoUrl?: string;
  avatarUrl: string;
  photoUrl?: string;
  photoURL?: string | null;
  onboardingStep?: 'profile' | 'education' | 'completed' | string;
  // Specific fields for Recovery Agent
  companyName?: string;
  yearsExp?: number;
  vehicleType?: 'Truck' | 'Van' | 'Motorcycle' | 'None' | string;
  idCardUrl?: string;
  // Account stats & progress
  points: number;
  profileCompleted?: boolean;
  gender?: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
  savedReportIds?: string[];
  isVerifiedCollector?: boolean;
  totalKgCollected?: number;
  reportsCount?: number;
  collectionsCount?: number;
  confirmedCleanedCount?: number;
  totalCleanedWastes?: number;
  cleanupsCount?: number;
  stars?: number;
  ratingStars?: number;
  level?: CollectorLevel;
  createdAt: string;
}

export interface WasteReport {
  id: string;
  reporterId: string;
  reporterName: string;
  reporterPhone?: string;
  reporterAvatar?: string;
  // Disposer aliases
  disposerId?: string;
  disposerName?: string;
  disposerPhone?: string;
  disposerAvatar?: string;
  disposerPhotoURL?: string | null;
  photoURL?: string | null;
  locationLga?: string;
  photoUrl: string;
  imageUrl?: string;
  photos?: string[];
  latitude?: number;
  longitude?: number;
  lat: number;
  lng: number;
  roadStreet?: string;
  fullAddress?: string;
  state?: string;
  address: string;
  postalCode?: string;
  lga: string;
  wasteType: WasteType;
  size: WasteSize;
  description: string;
  status: WasteStatus | 'pending' | 'claimed' | 'collected' | 'completed';
  isClaimed?: boolean;
  isAvailable?: boolean;
  collectorId?: string;
  claimedBy?: string; // collectorId
  collectorName?: string;
  collectorPhone?: string;
  collectorAvatar?: string;
  collectorRatingStars?: number;
  collectorLevel?: CollectorLevel;
  proofPhoto?: string;
  cleanPhoto?: string;
  collectedKg?: number;
  createdAt: string;
  createdTime?: string;
  claimedAt?: string;
  claimTime?: string;
  expiresAt?: string; // claimedAt + 72 hours
  claimExpiresAt?: string;
  claimExpiry?: string;
  expiryTime?: string;
  failedClaimBy?: string[];
  blockedCollectors?: string[];
  collectedAt?: string;
  // Acknowledgement & Completion
  acknowledgement?: boolean;
  acknowledgedAt?: string;
  waitingAcknowledgement?: boolean;
  // Feature 1: Private Chat
  chatClosed?: boolean;
  // Feature 2: Reporter Rating & Confirmation
  reporterConfirmedClean?: boolean;
  reporterRatingStars?: number;
  reporterRatingFeedback?: string;
  reporterRatedAt?: string;
}

export interface ChatMessage {
  id: string;
  reportId?: string;
  wasteId?: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  senderAvatar?: string;
  text: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'claimed' | 'collected' | 'points' | 'welcome' | 'chat' | 'rating' | 'acknowledged';
  reportId?: string;
  read: boolean;
  createdAt: string;
}

export interface CollectionRecord {
  id: string;
  reportId: string;
  collectorId: string;
  collectorName: string;
  proofPhoto: string;
  collectedKg: number;
  wasteType: WasteType;
  address: string;
  lga: string;
  collectedAt: string;
}

export interface SuggestionComment {
  id: string;
  suggestionId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  authorRole: UserRole;
  text: string;
  createdAt: string;
}

export interface CommunitySuggestion {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  userRole: UserRole;
  userLga?: string;
  title?: string;
  content: string;
  photoUrl?: string;
  likeCount: number;
  likedBy: string[];
  commentsCount?: number;
  createdAt: string;
}

