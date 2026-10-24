/**
 * Google Maps External Browser Link Generator
 * Opens Google Maps in external Chrome/browser using exact full address query.
 */

export interface LocationReportTarget {
  latitude?: number;
  longitude?: number;
  lat?: number;
  lng?: number;
  roadStreet?: string;
  address?: string;
  lga?: string;
  postalCode?: string;
  fullAddress?: string;
  state?: string;
}

/**
 * Builds the exact address query string: `${road}, ${lga}, ${state}, ${postalCode}, Nigeria`
 */
export function buildGoogleMapsAddressQuery(report: LocationReportTarget): string {
  const road = (report.roadStreet || report.address || '').trim();
  const lga = (report.lga || '').trim();
  const state = (report.state || 'Akwa Ibom').trim();
  const postalCode = (report.postalCode || '').trim();

  return `${road}, ${lga}, ${state}, ${postalCode}, Nigeria`;
}

/**
 * Builds the exact Google Maps URL using:
 * https://www.google.com/maps/search/?api=1&query=${query}
 */
export function buildGoogleMapsWebUrl(report: LocationReportTarget): string {
  const fullAddress = buildGoogleMapsAddressQuery(report);
  const query = encodeURIComponent(fullAddress);
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

/**
 * Opens Google Maps in a new tab:
 * const fullAddress = `${road}, ${lga}, ${state}, ${postalCode}, Nigeria`;
 * const query = encodeURIComponent(fullAddress);
 * window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
 */
export const openInGoogleMap = (report: LocationReportTarget): void => {
  if (typeof window === 'undefined') return;

  const road = (report.roadStreet || report.address || '').trim();
  const lga = (report.lga || '').trim();
  const state = (report.state || 'Akwa Ibom').trim();
  const postalCode = (report.postalCode || '').trim();

  const fullAddress = `${road}, ${lga}, ${state}, ${postalCode}, Nigeria`;
  const query = encodeURIComponent(fullAddress);
  window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
};

/**
 * External browser window opener helper
 */
export function openInExternalBrowser(url: string): void {
  if (typeof window !== 'undefined') {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}
