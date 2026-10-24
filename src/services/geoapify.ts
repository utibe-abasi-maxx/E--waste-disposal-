/**
 * Geoapify Location & Mapping Service for CleanSpot Akwa Ibom
 * Key hardcoded as requested: 8e1d20da981f48af9b92c4135964fa94
 */

export const GEOAPIFY_API_KEY = "8e1d20da981f48af9b92c4135964fa94";

export interface GeoapifyReverseResult {
  formatted: string;
  roadStreet: string;
  lga: string;
  postalCode: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
}

/**
 * Reverse geocodes latitude/longitude coordinates to street, LGA, and postal code
 */
export async function reverseGeocode(
  lat: number,
  lon: number
): Promise<GeoapifyReverseResult | null> {
  try {
    const url = `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lon}&format=json&apiKey=${GEOAPIFY_API_KEY}`;
    const res = await fetch(url);
    if (!res.ok) return null;

    const data = await res.json();
    const result = data.results?.[0];
    if (!result) return null;

    const roadStreet =
      result.street ||
      result.name ||
      result.address_line1 ||
      result.suburb ||
      result.formatted ||
      '';

    const lga =
      result.county ||
      result.city ||
      result.district ||
      result.state_district ||
      'Akwa Ibom';

    const postalCode = result.postcode || '524101';
    const state = result.state || 'Akwa Ibom State';

    return {
      formatted: result.formatted || `${roadStreet}, ${lga}, ${state}`,
      roadStreet,
      lga,
      postalCode,
      state,
      country: result.country || 'Nigeria',
      latitude: result.lat ?? lat,
      longitude: result.lon ?? lon,
    };
  } catch (err) {
    console.warn('Geoapify reverse geocoding note:', err);
    return null;
  }
}

/**
 * Searches addresses or landmarks across Akwa Ibom
 */
export async function searchAddress(query: string): Promise<GeoapifyReverseResult[]> {
  try {
    const trimmed = query.trim();
    if (!trimmed) return [];

    const searchQuery = `${trimmed}, Akwa Ibom, Nigeria`;
    const url = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(
      searchQuery
    )}&format=json&apiKey=${GEOAPIFY_API_KEY}`;

    const res = await fetch(url);
    if (!res.ok) return [];

    const data = await res.json();
    return (data.results || []).map((r: any) => ({
      formatted: r.formatted,
      roadStreet: r.street || r.name || r.address_line1 || trimmed,
      lga: r.county || r.city || r.district || 'Akwa Ibom',
      postalCode: r.postcode || '524101',
      state: r.state || 'Akwa Ibom State',
      country: r.country || 'Nigeria',
      latitude: r.lat,
      longitude: r.lon,
    }));
  } catch (err) {
    console.warn('Geoapify address search note:', err);
    return [];
  }
}

/**
 * Forward geocodes an address query to latitude and longitude
 */
export async function forwardGeocode(
  query: string
): Promise<{ latitude: number; longitude: number } | null> {
  try {
    const trimmed = query.trim();
    if (!trimmed) return null;

    const url = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(
      trimmed
    )}&format=json&apiKey=${GEOAPIFY_API_KEY}`;

    const res = await fetch(url);
    if (!res.ok) return null;

    const data = await res.json();
    const first = data.results?.[0];
    if (first && typeof first.lat === 'number' && typeof first.lon === 'number') {
      return { latitude: first.lat, longitude: first.lon };
    }
    return null;
  } catch (err) {
    console.warn('Geoapify forward geocoding note:', err);
    return null;
  }
}

/**
 * Generates a high-quality Geoapify static map preview image URL
 */
export function getGeoapifyStaticMapUrl(
  lat: number,
  lon: number,
  zoom: number = 15,
  width: number = 500,
  height: number = 250,
  markerColor: string = '%2310b981' // emerald color
): string {
  return `https://maps.geoapify.com/v1/staticmap?style=osm-bright&width=${width}&height=${height}&center=lonlat:${lon},${lat}&zoom=${zoom}&marker=lonlat:${lon},${lat};color:${markerColor};size:medium&apiKey=${GEOAPIFY_API_KEY}`;
}

/**
 * Generates map tile layer URL for raster tiles
 */
export function getGeoapifyTileUrl(style: string = 'osm-bright'): string {
  return `https://maps.geoapify.com/v1/tile/${style}/{z}/{x}/{y}.png?apiKey=${GEOAPIFY_API_KEY}`;
}
