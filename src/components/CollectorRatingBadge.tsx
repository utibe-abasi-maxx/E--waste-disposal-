import React from 'react';
import { calculateCollectorRating } from '../services/rating';

interface CollectorRatingBadgeProps {
  collectorName?: string;
  ratingStars?: number;
  totalCleanedWastes?: number;
  showDetails?: boolean;
  className?: string;
}

/**
 * FEATURE 3: Star Rating Badge for Collectors
 * Formats: "This collector is ⭐⭐ (20 wastes cleaned)"
 * Formula: stars = (totalCleanedWastes / 10) capped at 5 stars. Allows half stars.
 */
export const CollectorRatingBadge: React.FC<CollectorRatingBadgeProps> = ({
  collectorName,
  ratingStars,
  totalCleanedWastes = 0,
  showDetails = true,
  className = '',
}) => {
  const stars = ratingStars !== undefined ? ratingStars : calculateCollectorRating(totalCleanedWastes);
  const fullStars = Math.floor(stars);
  const hasHalfStar = stars - fullStars >= 0.5;

  return (
    <div
      className={`inline-flex items-center flex-wrap gap-1 px-2.5 py-1 rounded-xl bg-amber-50/95 border border-amber-200 text-amber-950 text-xs font-semibold shadow-2xs ${className}`}
      title={`Rating: ${stars.toFixed(1)} stars based on ${totalCleanedWastes} cleaned waste pickups`}
    >
      <span className="text-gray-700 font-medium">This collector is</span>
      <span className="inline-flex items-center text-amber-500 font-bold">
        {fullStars > 0 ? (
          '⭐'.repeat(fullStars)
        ) : (
          <span className="text-[11px] text-amber-500 font-bold">⭐</span>
        )}
        {hasHalfStar && <span className="text-amber-600 font-black ml-0.5">½</span>}
      </span>
      {showDetails && (
        <span className="text-[11px] text-amber-900 font-bold ml-0.5">
          ({totalCleanedWastes} {totalCleanedWastes === 1 ? 'waste' : 'wastes'} cleaned)
        </span>
      )}
    </div>
  );
};
