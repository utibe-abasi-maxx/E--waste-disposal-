import React, { useEffect, useState } from 'react';
import { Clock, AlertTriangle, RotateCcw } from 'lucide-react';
import { getRemainingClaimTime, RemainingTimeInfo } from '../services/timer';
import { CleanSpotStore } from '../services/storage';

interface ClaimCountdownBadgeProps {
  expiresAt?: string;
  claimedAt?: string;
  className?: string;
  compact?: boolean;
}

export const ClaimCountdownBadge: React.FC<ClaimCountdownBadgeProps> = ({
  expiresAt,
  claimedAt,
  className = '',
  compact = false,
}) => {
  const [timeInfo, setTimeInfo] = useState<RemainingTimeInfo>(() =>
    getRemainingClaimTime(expiresAt, claimedAt)
  );

  useEffect(() => {
    setTimeInfo(getRemainingClaimTime(expiresAt, claimedAt));

    const interval = setInterval(() => {
      const current = getRemainingClaimTime(expiresAt, claimedAt);
      setTimeInfo(current);

      if (current.isExpired) {
        // Automatically return waste to platform
        CleanSpotStore.checkExpiredClaims();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, claimedAt]);

  const isLowTime = !timeInfo.isExpired && timeInfo.hours < 12;

  if (timeInfo.isExpired) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-black bg-red-100 text-red-800 border border-red-300 ${className}`}
      >
        <RotateCcw className="w-3.5 h-3.5 text-red-600 animate-spin" />
        <span>72h Expired • Returning to Platform</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition-colors ${
        isLowTime
          ? 'bg-red-50 text-red-700 border border-red-200 animate-pulse'
          : 'bg-amber-100 text-amber-950 border border-amber-300'
      } ${className}`}
      title="Collector must clean and upload proof before 72 hours or the waste returns to platform"
    >
      <Clock className={`w-3.5 h-3.5 ${isLowTime ? 'text-red-600' : 'text-amber-700'}`} />
      <span>
        {compact ? `${timeInfo.shortFormatted} left` : timeInfo.liveText}
      </span>
    </span>
  );
};
