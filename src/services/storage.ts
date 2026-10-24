import { WasteReport, UserProfile, NotificationItem, CollectionRecord, ChatMessage } from '../types';
import { INITIAL_USERS, INITIAL_REPORTS, INITIAL_NOTIFICATIONS, INITIAL_CHATS } from '../data/seedData';
import { calculateCollectorRating, getCollectorLevelInfo, canAccessWaste, getAvailableWastes } from './rating';

const STORAGE_KEYS = {
  USERS: 'ewaste_users_v4',
  REPORTS: 'ewaste_reports_v4',
  NOTIFICATIONS: 'ewaste_notifications_v4',
  CURRENT_USER_ID: 'ewaste_current_user_id_v4',
  COLLECTIONS: 'ewaste_collections_v4',
  CHATS: 'ewaste_chats_v4',
};

/**
 * Safely writes to localStorage with automatic QuotaExceededError protection and payload slimming.
 */
export function safeSetItem(key: string, value: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, value);
  } catch (err) {
    console.warn(`[CleanSpotStore] localStorage quota exceeded or error for key ${key}:`, err);
    // If it's REPORTS, sanitize it by stripping bulky base64 strings and limiting count
    if (key === STORAGE_KEYS.REPORTS) {
      try {
        const rawReports = JSON.parse(value);
        if (Array.isArray(rawReports)) {
          // Keep only the most recent 25 reports, and prune bulky base64 images (>30KB)
          const sanitized = rawReports.slice(0, 25).map((r: any) => {
            const copy = { ...r };
            if (typeof copy.photoUrl === 'string' && copy.photoUrl.startsWith('data:') && copy.photoUrl.length > 30000) {
              copy.photoUrl = '';
            }
            if (typeof copy.imageUrl === 'string' && copy.imageUrl.startsWith('data:') && copy.imageUrl.length > 30000) {
              copy.imageUrl = '';
            }
            if (Array.isArray(copy.photos)) {
              copy.photos = copy.photos.filter((p: string) => typeof p === 'string' && (!p.startsWith('data:') || p.length <= 30000));
            }
            if (typeof copy.cleanPhoto === 'string' && copy.cleanPhoto.startsWith('data:') && copy.cleanPhoto.length > 30000) {
              copy.cleanPhoto = '';
            }
            if (typeof copy.proofPhoto === 'string' && copy.proofPhoto.startsWith('data:') && copy.proofPhoto.length > 30000) {
              copy.proofPhoto = '';
            }
            return copy;
          });
          localStorage.setItem(key, JSON.stringify(sanitized));
          return;
        }
      } catch (innerErr) {
        console.warn('[CleanSpotStore] Failed to write sanitized reports to localStorage:', innerErr);
      }
    }
  }
}

// Dispatch store event for reactivity across components
export const emitStoreUpdate = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('cleanspot_store_update'));
  }
};

export class CleanSpotStore {
  // Initialize storage with Akwa Ibom data
  static init() {
    if (typeof window === 'undefined') return;

    // Purge corrupted/oversized reports from previous quota explosions (>1MB in localStorage)
    try {
      const existingReports = localStorage.getItem(STORAGE_KEYS.REPORTS);
      if (existingReports && existingReports.length > 1_000_000) {
        const parsed = JSON.parse(existingReports);
        if (Array.isArray(parsed)) {
          const slimmed = parsed.slice(0, 20).map((r: any) => {
            const copy = { ...r };
            if (typeof copy.photoUrl === 'string' && copy.photoUrl.startsWith('data:') && copy.photoUrl.length > 30000) copy.photoUrl = '';
            if (typeof copy.imageUrl === 'string' && copy.imageUrl.startsWith('data:') && copy.imageUrl.length > 30000) copy.imageUrl = '';
            if (copy.photos) copy.photos = [];
            return copy;
          });
          safeSetItem(STORAGE_KEYS.REPORTS, JSON.stringify(slimmed));
        }
      }
    } catch {
      // Safe fallback
    }

    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      safeSetItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    }

    if (!localStorage.getItem(STORAGE_KEYS.REPORTS)) {
      safeSetItem(STORAGE_KEYS.REPORTS, JSON.stringify(INITIAL_REPORTS));
    }

    if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
      safeSetItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
    }

    if (!localStorage.getItem(STORAGE_KEYS.CHATS)) {
      safeSetItem(STORAGE_KEYS.CHATS, JSON.stringify(INITIAL_CHATS));
    }

  }

  // User Management
  static getUsers(): UserProfile[] {
    this.init();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USERS);
      return data ? JSON.parse(data) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  }

  static getCurrentUser(): UserProfile | null {
    this.init();
    try {
      const currentId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
      if (!currentId) return null;
      const users = this.getUsers();
      return users.find((u) => u.id === currentId) || null;
    } catch {
      return null;
    }
  }

  static setCurrentUser(user: UserProfile | null) {
    if (!user) {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
    } else {
      safeSetItem(STORAGE_KEYS.CURRENT_USER_ID, user.id);
      const users = this.getUsers();
      const index = users.findIndex((u) => u.id === user.id);
      if (index >= 0) {
        users[index] = user;
      } else {
        users.push(user);
      }
      safeSetItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    }
    emitStoreUpdate();
  }

  static addUser(user: UserProfile): void {
    const users = this.getUsers();
    const index = users.findIndex((u) => u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase());
    if (index >= 0) {
      users[index] = { ...users[index], ...user };
    } else {
      users.push(user);
    }
    safeSetItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    emitStoreUpdate();
  }

  static updateUserProfile(updated: Partial<UserProfile> & { id: string }): UserProfile {
    const users = this.getUsers();
    const index = users.findIndex((u) => u.id === updated.id);
    let user: UserProfile;
    if (index >= 0) {
      user = { ...users[index], ...updated };
      // Recalculate rating and level if collector
      if (user.role === 'collector') {
        const cleans = user.confirmedCleanedCount ?? user.collectionsCount ?? 0;
        user.ratingStars = user.ratingStars !== undefined ? user.ratingStars : calculateCollectorRating(cleans);
        user.level = getCollectorLevelInfo(user.ratingStars, cleans).level;
      }
      users[index] = user;
    } else {
      user = updated as UserProfile;
      if (user.role === 'collector') {
        user.ratingStars = user.ratingStars ?? 0;
        user.confirmedCleanedCount = user.confirmedCleanedCount ?? 0;
        user.level = 'beginner';
      }
      users.push(user);
    }
    safeSetItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    if (this.getCurrentUser()?.id === user.id) {
      safeSetItem(STORAGE_KEYS.CURRENT_USER_ID, user.id);
    }
    emitStoreUpdate();
    return user;
  }

  // Update Account Profile (Full Name, Age, Email, Password, Phone, Avatar)
  static updateAccount(
    userId: string,
    data: {
      name?: string;
      age?: number;
      email?: string;
      password?: string;
      phone?: string;
      avatarUrl?: string;
    }
  ): UserProfile {
    const updated = this.updateUserProfile({
      id: userId,
      ...data,
      profileCompleted: true,
    });
    return updated;
  }

  // -------------------------------------------------------------
  // REQUIREMENT 1: 72 HOURS CLAIM & AUTO-RETURN SYSTEM
  // -------------------------------------------------------------
  static checkExpiredClaims(): boolean {
    if (typeof window === 'undefined') return false;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.REPORTS);
      if (!data) return false;
      const reports: WasteReport[] = JSON.parse(data);
      const now = Date.now();
      let changed = false;

      reports.forEach((report) => {
        if (report.status === 'claimed') {
          const expiryIso = report.expiresAt || report.expiryTime || report.claimExpiry;
          let expiryMs: number | null = null;
          if (expiryIso) {
            expiryMs = new Date(expiryIso).getTime();
          } else if (report.claimedAt || report.claimTime) {
            expiryMs = new Date(report.claimedAt || report.claimTime!).getTime() + 72 * 60 * 60 * 1000;
          }

          // If 72 hours passed and not cleaned, auto-return to platform
          if (expiryMs && now > expiryMs) {
            const previousCollectorId = report.claimedBy || report.collectorId;

            // Status becomes AVAILABLE / PENDING (red card)
            report.status = 'pending';
            report.collectorId = undefined;
            report.claimedBy = undefined;
            report.collectorName = undefined;
            report.collectorPhone = undefined;
            report.collectorAvatar = undefined;
            report.claimedAt = undefined;
            report.claimTime = undefined;
            report.expiresAt = undefined;
            report.expiryTime = undefined;
            report.claimExpiry = undefined;
            report.chatClosed = false;

            // Collector who lost it can STILL see it and claim it again
            changed = true;

            if (previousCollectorId) {
              this.addNotification({
                userId: previousCollectorId,
                title: '72-Hour Timer Expired',
                message: `The 72-hour timer for "${report.address.slice(0, 35)}..." expired. The waste returned to the main feed, and you can claim it again whenever you are ready!`,
                type: 'claimed',
                reportId: report.id,
              });
            }

            if (report.reporterId) {
              this.addNotification({
                userId: report.reporterId,
                title: 'Waste Returned to Feed',
                message: `Your reported waste at "${report.address.slice(0, 35)}..." was returned to the main platform after 72 hours and is now available for pickup.`,
                type: 'claimed',
                reportId: report.id,
              });
            }
          }
        }
      });

      if (changed) {
        safeSetItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
        emitStoreUpdate();
      }
      return changed;
    } catch {
      return false;
    }
  }

  /**
   * Helper to simulate 72 hours passing on a claimed report for instant testing
   */
  static expireClaimForTesting(reportId: string): boolean {
    if (typeof window === 'undefined') return false;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.REPORTS);
      if (!data) return false;
      const reports: WasteReport[] = JSON.parse(data);
      const index = reports.findIndex((r) => r.id === reportId);
      if (index === -1) return false;

      // Set expiry to 1 minute in the past
      reports[index].expiresAt = new Date(Date.now() - 60000).toISOString();
      reports[index].expiryTime = new Date(Date.now() - 60000).toISOString();
      reports[index].claimExpiry = new Date(Date.now() - 60000).toISOString();
      safeSetItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));

      // Trigger automatic return
      return this.checkExpiredClaims();
    } catch {
      return false;
    }
  }

  // Reports
  static getReports(): WasteReport[] {
    this.init();
    this.checkExpiredClaims();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.REPORTS);
      let reports: WasteReport[] = data ? JSON.parse(data) : INITIAL_REPORTS;

      // Normalize all reports to have structured address fields
      return reports.map((r) => {
        const roadStreet = r.roadStreet || r.address || '';
        const lga = r.lga || '';
        const postalCode = r.postalCode || '';
        const state = r.state || 'Akwa Ibom';
        const fullAddress = r.fullAddress || [roadStreet, lga, state, postalCode, 'Nigeria'].filter(Boolean).join(', ');
        const latitude = r.latitude ?? r.lat;
        const longitude = r.longitude ?? r.lng;
        return {
          ...r,
          roadStreet,
          lga,
          postalCode,
          fullAddress,
          state,
          latitude,
          longitude,
          lat: latitude,
          lng: longitude,
        };
      });
    } catch {
      return INITIAL_REPORTS;
    }
  }

  // Synchronize reports directly from live Firestore onSnapshot listener
  static syncReports(realtimeReports: WasteReport[]): void {
    if (typeof window === 'undefined') return;
    try {
      // Create a lightweight copy for offline localStorage caching to never exceed quota
      const lightweightReports = realtimeReports.slice(0, 30).map((r) => {
        const copy: any = { ...r };
        if (typeof copy.photoUrl === 'string' && copy.photoUrl.startsWith('data:') && copy.photoUrl.length > 30000) {
          copy.photoUrl = '';
        }
        if (typeof copy.imageUrl === 'string' && copy.imageUrl.startsWith('data:') && copy.imageUrl.length > 30000) {
          copy.imageUrl = '';
        }
        if (Array.isArray(copy.photos)) {
          copy.photos = copy.photos.filter((p: string) => typeof p === 'string' && (!p.startsWith('data:') || p.length <= 30000));
        }
        if (typeof copy.cleanPhoto === 'string' && copy.cleanPhoto.startsWith('data:') && copy.cleanPhoto.length > 30000) {
          copy.cleanPhoto = '';
        }
        if (typeof copy.proofPhoto === 'string' && copy.proofPhoto.startsWith('data:') && copy.proofPhoto.length > 30000) {
          copy.proofPhoto = '';
        }
        return copy;
      });
      safeSetItem(STORAGE_KEYS.REPORTS, JSON.stringify(lightweightReports));
    } catch {
      // safe fallback
    }
    emitStoreUpdate();
  }

  // Returns all available wastes without filtering by size or level
  static getAvailableWastes(user?: UserProfile | null): WasteReport[] {
    return this.getReports();
  }

  static getReportById(id: string): WasteReport | undefined {
    return this.getReports().find((r) => r.id === id);
  }

  static createReport(newReport: Omit<WasteReport, 'id' | 'createdAt' | 'status'>): WasteReport {
    const reports = this.getReports();
    const report: WasteReport = {
      ...newReport,
      id: `report_${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
      failedClaimBy: [],
      blockedCollectors: [],
    };

    reports.unshift(report);
    safeSetItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));

    // Award +50 points to reporter
    const reporter = this.getUsers().find((u) => u.id === newReport.reporterId);
    if (reporter) {
      this.updateUserProfile({
        id: reporter.id,
        points: (reporter.points || 0) + 50,
        reportsCount: (reporter.reportsCount || 0) + 1,
      });

      this.addNotification({
        userId: reporter.id,
        title: 'Waste Reported! +50 Eco Points',
        message: `Your report at "${newReport.address.slice(0, 35)}..." has been mapped in Akwa Ibom. Local collectors can now claim it for free recycling.`,
        type: 'points',
        reportId: report.id,
      });
    }

    emitStoreUpdate();
    return report;
  }

  /**
   * Claim Waste Report:
   * Waste collector can claim ANY waste IMMEDIATELY after it is reported.
   * UNLIMITED number of wastes can be claimed with no limit and no waiting period.
   */
  static claimReport(
    reportId: string,
    collector: UserProfile
  ): { success: boolean; report?: WasteReport; error?: string } {
    const reports = this.getReports();
    const index = reports.findIndex((r) => r.id === reportId);
    if (index === -1) return { success: false, error: 'Report not found' };

    const report = reports[index];
    if (report.status !== 'pending') {
      return { success: false, error: 'This waste has already been claimed.' };
    }

    // Any collector can claim any size immediately with zero restrictions
    const canClaimImmediately = true;

    const totalCleaned = collector.totalCleanedWastes ?? collector.collectionsCount ?? 0;
    const collectorStars = calculateCollectorRating(totalCleaned);
    const collectorLevel = collector.level ?? getCollectorLevelInfo(collectorStars).level;

    const now = Date.now();
    const claimedAt = new Date(now).toISOString();
    const expiresAt = new Date(now + 72 * 60 * 60 * 1000).toISOString();

    report.status = 'claimed';
    report.claimedBy = collector.id;
    report.collectorId = collector.id;
    report.collectorName = collector.name;
    report.collectorPhone = collector.phone;
    report.collectorAvatar = collector.avatarUrl;
    report.collectorRatingStars = collectorStars;
    report.collectorLevel = collectorLevel;
    report.claimedAt = claimedAt;
    report.claimTime = claimedAt;
    report.expiresAt = expiresAt;
    report.expiryTime = expiresAt;
    report.claimExpiry = expiresAt;

    reports[index] = report;
    safeSetItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));

    // Notify Reporter including Collector's star rating
    const starText = collectorStars > 0 ? `(${collectorStars.toFixed(1)}★)` : '(New Collector)';
    this.addNotification({
      userId: report.reporterId,
      title: 'Waste Claimed by Collector!',
      message: `${collector.name} ${starText} claimed your reported waste at ${report.address}. 72-hour cleanup timer is active!`,
      type: 'claimed',
      reportId: report.id,
    });

    // Notify collector (72-hour timer started)
    this.addNotification({
      userId: collector.id,
      title: 'Waste Claimed! 72-Hour Timer Active',
      message: `You claimed ${report.size} waste at ${report.address}. You have 72 hours to clean and upload proof before it auto-returns to platform.`,
      type: 'claimed',
      reportId: report.id,
    });

    emitStoreUpdate();
    return { success: true, report };
  }

  /**
   * Unclaim Waste Report:
   * Recovery agent releases claim back to pending state.
   */
  static unclaimReport(reportId: string): boolean {
    const reports = this.getReports();
    const index = reports.findIndex((r) => r.id === reportId);
    if (index === -1) return false;

    const report = reports[index];
    report.status = 'pending';
    report.isClaimed = false;
    report.isAvailable = true;
    report.collectorId = undefined;
    report.claimedBy = undefined;
    report.collectorName = undefined;
    report.collectorPhone = undefined;
    report.collectorAvatar = undefined;
    report.claimedAt = undefined;
    report.claimTime = undefined;
    report.expiresAt = undefined;
    report.expiryTime = undefined;
    report.claimExpiry = undefined;
    report.cleanPhoto = undefined;
    report.proofPhoto = undefined;
    report.waitingAcknowledgement = false;
    report.acknowledgement = false;
    report.chatClosed = false;

    reports[index] = report;
    safeSetItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
    emitStoreUpdate();
    return true;
  }

  /**
   * Delete Waste Report:
   * Citizen disposer can delete own broadcasted waste report.
   */
  static deleteReport(reportId: string): boolean {
    const reports = this.getReports();
    const filtered = reports.filter((r) => r.id !== reportId);
    if (filtered.length === reports.length) return false;

    safeSetItem(STORAGE_KEYS.REPORTS, JSON.stringify(filtered));
    emitStoreUpdate();
    return true;
  }

  /**
   * Mark Waste as Cleaned / Collected
   * Automatically closes private chat, awards points, and increments totalCleanedWastes.
   */
  static completeCollection(
    reportId: string,
    proofPhoto: string,
    collectedKg: number,
    collector: UserProfile
  ): WasteReport | null {
    const reports = this.getReports();
    const index = reports.findIndex((r) => r.id === reportId);
    if (index === -1) return null;

    const report = reports[index];
    report.status = 'collected';
    report.proofPhoto = proofPhoto;
    report.collectedKg = collectedKg;
    report.collectedAt = new Date().toISOString();

    // Chat closes automatically when waste is marked as cleaned
    report.chatClosed = true;

    reports[index] = report;
    safeSetItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));

    const pointsEarned = Math.round(collectedKg * 10);
    const previousCleaned = collector.totalCleanedWastes ?? collector.collectionsCount ?? 0;
    const newTotalCleaned = previousCleaned + 1;
    const newStars = calculateCollectorRating(newTotalCleaned);
    const newLevel = getCollectorLevelInfo(newStars).level;

    this.updateUserProfile({
      id: collector.id,
      points: (collector.points || 0) + pointsEarned,
      totalKgCollected: (collector.totalKgCollected || 0) + collectedKg,
      collectionsCount: newTotalCleaned,
      totalCleanedWastes: newTotalCleaned,
      ratingStars: newStars,
      level: newLevel,
    });

    const reporter = this.getUsers().find((u) => u.id === report.reporterId);
    if (reporter) {
      this.updateUserProfile({
        id: reporter.id,
        points: (reporter.points || 0) + 100,
      });

      this.addNotification({
        userId: reporter.id,
        title: 'Spot Cleaned! Please Rate & Confirm Quality',
        message: `${collector.name} uploaded proof of cleaning ${collectedKg} KG at ${report.address}. Review the clean photo and confirm if it was cleaned well to award collector stars!`,
        type: 'rating',
        reportId: report.id,
      });
    }

    emitStoreUpdate();
    return report;
  }

  /**
   * Reporter confirms if it was cleaned well and rates the collector
   */
  static confirmCleanedWell(
    reportId: string,
    reporter: UserProfile,
    ratingStars: number = 5,
    feedback?: string
  ): { success: boolean; report?: WasteReport; error?: string } {
    const reports = this.getReports();
    const index = reports.findIndex((r) => r.id === reportId);
    if (index === -1) return { success: false, error: 'Report not found' };

    const report = reports[index];
    if (report.reporterId !== reporter.id) {
      return { success: false, error: 'Only the reporter who created this report can confirm and rate the cleanup.' };
    }

    if (report.status !== 'collected') {
      return { success: false, error: 'This report has not been marked as collected yet.' };
    }

    report.reporterConfirmedClean = true;
    report.reporterRatingStars = ratingStars;
    report.reporterRatingFeedback = feedback || 'Cleaned well and thoroughly verified.';
    report.reporterRatedAt = new Date().toISOString();

    reports[index] = report;
    safeSetItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));

    // Update Collector's confirmed cleans and star rating!
    if (report.collectorId) {
      const collector = this.getUsers().find((u) => u.id === report.collectorId);
      if (collector) {
        const prevConfirmed = collector.confirmedCleanedCount || 0;
        const newConfirmed = prevConfirmed + 1;
        const newRating = calculateCollectorRating(newConfirmed);
        const newLevel = getCollectorLevelInfo(newRating, newConfirmed).level;

        this.updateUserProfile({
          id: collector.id,
          confirmedCleanedCount: newConfirmed,
          ratingStars: newRating,
          level: newLevel,
          points: (collector.points || 0) + 50,
        });

        // Notify Collector
        this.addNotification({
          userId: collector.id,
          title: `Cleanup Confirmed Well! ⭐ Rating: ${newRating.toFixed(1)}★`,
          message: `${reporter.name} confirmed your cleaning at ${report.address} was cleaned well (${ratingStars}★ review)! You now have ${newConfirmed} confirmed cleanings (${newLevel.toUpperCase()}).`,
          type: 'rating',
          reportId: report.id,
        });
      }
    }

    // Award bonus points to reporter for verifying
    this.updateUserProfile({
      id: reporter.id,
      points: (reporter.points || 0) + 25,
    });

    emitStoreUpdate();
    return { success: true, report };
  }

  // -------------------------------------------------------------
  // REQUIREMENT 1: BOOKMARKS / SAVED WASTES
  // -------------------------------------------------------------
  static toggleBookmark(userId: string, reportId: string): boolean {
    const user = this.getUsers().find((u) => u.id === userId);
    if (!user) return false;
    const currentList = user.savedReportIds || [];
    const exists = currentList.includes(reportId);
    const updated = exists ? currentList.filter((id) => id !== reportId) : [...currentList, reportId];

    this.updateUserProfile({
      id: userId,
      savedReportIds: updated,
    });
    return !exists;
  }

  static isBookmarked(userId: string, reportId: string): boolean {
    const user = this.getUsers().find((u) => u.id === userId);
    return Boolean(user?.savedReportIds?.includes(reportId));
  }

  static getSavedReports(userId: string): WasteReport[] {
    const user = this.getUsers().find((u) => u.id === userId);
    const savedIds = user?.savedReportIds || [];
    const all = this.getReports();
    return all.filter((r) => savedIds.includes(r.id));
  }

  // -------------------------------------------------------------
  // PRIVATE CHAT METHODS
  // -------------------------------------------------------------
  static getChats(): Record<string, ChatMessage[]> {
    this.init();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CHATS);
      return data ? JSON.parse(data) : INITIAL_CHATS;
    } catch {
      return INITIAL_CHATS;
    }
  }

  static getMessages(reportId: string): ChatMessage[] {
    const chats = this.getChats();
    return chats[reportId] || [];
  }

  static canAccessChat(report: WasteReport, userId: string): boolean {
    if (!report || !userId) return false;
    return report.reporterId === userId || report.collectorId === userId;
  }

  static sendMessage(
    reportId: string,
    sender: UserProfile,
    text: string
  ): { success: boolean; message?: ChatMessage; error?: string } {
    if (!text.trim()) {
      return { success: false, error: 'Message cannot be empty.' };
    }

    const report = this.getReportById(reportId);
    if (!report) {
      return { success: false, error: 'Waste report not found.' };
    }

    if (report.status === 'pending') {
      return { success: false, error: 'Chat only opens once a collector claims this waste report.' };
    }

    if (sender.id !== report.reporterId && sender.id !== report.collectorId) {
      return {
        success: false,
        error: 'Private chat is strictly restricted to the Reporter and the assigned Collector.',
      };
    }

    if (report.status === 'collected' || report.chatClosed) {
      return {
        success: false,
        error: 'Chat closed automatically because this waste has already been cleaned and verified.',
      };
    }

    const chats = this.getChats();
    const thread = chats[reportId] ? [...chats[reportId]] : [];

    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      reportId: report.id,
      senderId: sender.id,
      senderName: sender.name,
      senderRole: sender.role,
      senderAvatar: sender.avatarUrl,
      text: text.trim(),
      createdAt: new Date().toISOString(),
    };

    thread.push(newMsg);
    chats[reportId] = thread;
    safeSetItem(STORAGE_KEYS.CHATS, JSON.stringify(chats));

    const recipientId = sender.id === report.reporterId ? report.collectorId : report.reporterId;
    if (recipientId) {
      const senderRoleLabel = sender.role === 'reporter' ? 'Reporter' : 'Collector';
      this.addNotification({
        userId: recipientId,
        title: `Message from ${senderRoleLabel} (${sender.name})`,
        message: text.trim().slice(0, 100),
        type: 'chat',
        reportId: report.id,
      });
    }

    emitStoreUpdate();
    return { success: true, message: newMsg };
  }

  // Notifications
  static getNotifications(userId?: string): NotificationItem[] {
    this.init();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      const list: NotificationItem[] = data ? JSON.parse(data) : INITIAL_NOTIFICATIONS;
      if (!userId) return list;
      return list.filter((n) => n.userId === userId);
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  }

  static addNotification(item: Omit<NotificationItem, 'id' | 'createdAt' | 'read'>): NotificationItem {
    const list = this.getNotifications();
    const newNotif: NotificationItem = {
      ...item,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      read: false,
      createdAt: new Date().toISOString(),
    };
    list.unshift(newNotif);
    safeSetItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(list));
    emitStoreUpdate();
    return newNotif;
  }

  static markNotificationAsRead(id: string) {
    const list = this.getNotifications();
    const item = list.find((n) => n.id === id);
    if (item) {
      item.read = true;
      safeSetItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(list));
      emitStoreUpdate();
    }
  }

  static markAllNotificationsAsRead(userId: string) {
    const list = this.getNotifications();
    list.forEach((n) => {
      if (n.userId === userId) n.read = true;
    });
    safeSetItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(list));
    emitStoreUpdate();
  }

  // System Stats
  static getStats() {
    const reports = this.getReports();
    const users = this.getUsers();

    const pendingCount = reports.filter((r) => r.status === 'pending').length;
    const claimedCount = reports.filter((r) => r.status === 'claimed').length;
    const collectedCount = reports.filter((r) => r.status === 'collected').length;

    const totalKg = reports.reduce((acc, r) => acc + (r.collectedKg || 0), 0);
    const totalReports = reports.length;
    const totalCleaned = collectedCount;
    const activeCollectors = users.filter((u) => u.role === 'collector').length;

    return {
      totalReports,
      totalCleaned,
      totalKg,
      pendingCount,
      claimedCount,
      collectedCount,
      activeCollectors,
    };
  }

  // Quick reset to Akwa Ibom defaults
  static resetToDefaults() {
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.REPORTS);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
    localStorage.removeItem(STORAGE_KEYS.CHATS);
    this.init();
    emitStoreUpdate();
  }
}
