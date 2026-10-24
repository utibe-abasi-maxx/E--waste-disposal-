import { useState, useEffect } from 'react';

/**
 * 72-Hour Claim Countdown Timer Service
 *
 * When a collector claims a waste, it is locked for 72 hours (expiresAt = claimedAt + 72h).
 * Shows live: "Claimed - 71h 45m 12s left to clean".
 * If not cleaned within 72 hours, it automatically returns to the main platform as PENDING (red).
 */

export interface RemainingTimeInfo {
  totalMs: number;
  isExpired: boolean;
  formatted: string;
  shortFormatted: string;
  liveText: string;
  hours: number;
  minutes: number;
  seconds: number;
  percentRemaining: number;
}

export function getRemainingClaimTime(expiresAt?: string, claimedAt?: string): RemainingTimeInfo {
  let targetExpiryMs: number | null = null;

  if (expiresAt) {
    targetExpiryMs = new Date(expiresAt).getTime();
  } else if (claimedAt) {
    targetExpiryMs = new Date(claimedAt).getTime() + 72 * 60 * 60 * 1000;
  }

  if (!targetExpiryMs) {
    return {
      totalMs: 72 * 3600 * 1000,
      isExpired: false,
      formatted: '72h 00m 00s left to clean',
      shortFormatted: '72h 00m 00s',
      liveText: 'Claimed - 72h 00m 00s left to clean',
      hours: 72,
      minutes: 0,
      seconds: 0,
      percentRemaining: 100,
    };
  }

  const nowMs = Date.now();
  const diff = targetExpiryMs - nowMs;

  if (diff <= 0) {
    return {
      totalMs: 0,
      isExpired: true,
      formatted: 'Expired - Returned to Platform',
      shortFormatted: 'Expired',
      liveText: 'Expired (Auto-returned)',
      hours: 0,
      minutes: 0,
      seconds: 0,
      percentRemaining: 0,
    };
  }

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  const total72h = 72 * 3600 * 1000;
  const percentRemaining = Math.max(0, Math.min(100, (diff / total72h) * 100));

  const pad = (n: number) => n.toString().padStart(2, '0');
  const timeStr = `${hours}h ${pad(minutes)}m ${pad(seconds)}s`;

  return {
    totalMs: diff,
    isExpired: false,
    formatted: `${timeStr} left to clean`,
    shortFormatted: timeStr,
    liveText: `Claimed - ${timeStr} left to clean`,
    hours,
    minutes,
    seconds,
    percentRemaining,
  };
}

/**
 * Live Countdown Hook that ticks every 1 second
 */
export function useLiveClaimTimer(expiresAt?: string, claimedAt?: string): RemainingTimeInfo {
  const [timeInfo, setTimeInfo] = useState(() => getRemainingClaimTime(expiresAt, claimedAt));

  useEffect(() => {
    setTimeInfo(getRemainingClaimTime(expiresAt, claimedAt));
    const interval = setInterval(() => {
      const updated = getRemainingClaimTime(expiresAt, claimedAt);
      setTimeInfo(updated);
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, claimedAt]);

  return timeInfo;
}
