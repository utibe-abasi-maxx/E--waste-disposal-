import { CollectorLevel, WasteSize, UserProfile } from '../types';

/**
 * CleanSpot Rating & Level Calculation Service
 *
 * Formula: stars = (totalCleanedWastes / 10) capped at 5 stars. Allow half stars.
 * - 5 waste pickups = 0.5 star
 * - 10 waste pickups = 1 star
 * - 20 waste pickups = 2 stars
 * - up to 100 waste pickups = 5 stars
 */

export function calculateCollectorRating(totalCleanedWastes: number = 0): number {
  const safeCount = Math.max(0, totalCleanedWastes);
  const raw = safeCount / 10;
  // Floor to nearest 0.5 star interval
  const halfStarRounded = Math.floor(raw * 2) / 2;
  const stars = Math.min(5.0, Math.max(0, halfStarRounded));
  return Number(stars.toFixed(1));
}

export function formatCollectorStarsText(stars: number, totalCleanedWastes: number = 0): string {
  const full = Math.floor(stars);
  const hasHalf = stars - full >= 0.5;
  const starsString = '⭐'.repeat(Math.max(1, full)) + (hasHalf ? '½' : '');
  return `This collector is ${starsString} (${totalCleanedWastes} wastes cleaned)`;
}

export interface LevelInfo {
  level: CollectorLevel;
  title: string;
  badgeClass: string;
  badgeTextColor: string;
  icon: string;
  allowedSizes: WasteSize[];
  summary: string;
  unlockedDescription: string;
  nextMilestoneText?: string;
  cleansUntilNextMilestone?: number;
}

export function getCollectorLevelInfo(rating: number, confirmedCleans: number = 0): LevelInfo {
  if (rating < 2.5) {
    const cleansToMedium = Math.max(0, 25 - confirmedCleans);
    return {
      level: 'beginner',
      title: 'Beginner Level',
      badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
      badgeTextColor: 'text-amber-800',
      icon: '🥉',
      allowedSizes: ['Small', 'Medium', 'Huge'],
      summary: 'Verified Collector: All job sizes accessible (Small, Medium & Huge)',
      unlockedDescription: 'All Waste Sizes Accessible (Small, Medium & Huge)',
      nextMilestoneText: cleansToMedium > 0 ? `${cleansToMedium} more confirmed cleans to reach Medium Level (2.5★)` : undefined,
      cleansUntilNextMilestone: cleansToMedium,
    };
  } else if (rating <= 4.0) {
    const cleansToExpert = Math.max(0, 45 - confirmedCleans);
    return {
      level: 'medium',
      title: 'Medium Level',
      badgeClass: 'bg-blue-100 text-blue-900 border-blue-300',
      badgeTextColor: 'text-blue-800',
      icon: '🥈',
      allowedSizes: ['Small', 'Medium', 'Huge'],
      summary: 'Experienced Collector: All job sizes accessible (Small, Medium & Huge)',
      unlockedDescription: 'All Waste Sizes Accessible (Small, Medium & Huge)',
      nextMilestoneText: cleansToExpert > 0 ? `${cleansToExpert} more confirmed cleans to reach Expert Level (4.5★)` : undefined,
      cleansUntilNextMilestone: cleansToExpert,
    };
  } else {
    return {
      level: 'expert',
      title: 'Expert Level',
      badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-400',
      badgeTextColor: 'text-emerald-800',
      icon: '🥇',
      allowedSizes: ['Small', 'Medium', 'Huge'],
      summary: 'Master Recycler: All job sizes accessible (Small, Medium & Huge)',
      unlockedDescription: 'All Waste Sizes Accessible (Small, Medium & Huge)',
    };
  }
}

/**
 * Checks if a collector can claim a specific waste size.
 * Every collector - beginner, intermediate, expert - can access and claim ANY size: small, medium, huge.
 * Zero size restrictions.
 */
export function canCollectorClaimWaste(
  collector?: UserProfile | null,
  size?: WasteSize
): { allowed: boolean; reason?: string; requiredStars: number; requiredLevel: string } {
  // Everyone can access every size - no restriction
  return { allowed: true, requiredStars: 0, requiredLevel: 'All Levels' };
}

/**
 * Section 3 Helpers:
 * canAccessWaste: everyone can access every size - no restriction
 * getAvailableWastes: no filtering by size or level, return all wastes
 */
export const canAccessWaste = (user?: UserProfile | null, waste?: any): boolean => {
  return true;
};

export const getAvailableWastes = <T>(allWastes: T[], user?: UserProfile | null): T[] => {
  return allWastes;
};

/**
 * Renders star display array helper
 */
export function getStarDisplay(rating: number): { full: number; half: boolean; empty: number } {
  const clamped = Math.max(0, Math.min(5, rating));
  const full = Math.floor(clamped);
  const hasHalf = clamped - full >= 0.5;
  const empty = 5 - full - (hasHalf ? 1 : 0);
  return { full, half: hasHalf, empty };
}
