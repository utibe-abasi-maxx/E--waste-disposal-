import React, { useState, useMemo } from 'react';
import { WasteReport, UserProfile, isDisposer, isAgent } from '../types';
import { AKWA_IBOM_LGAS } from '../data/seedData';
import { buildGoogleMapsWebUrl, openInExternalBrowser, openInGoogleMap } from '../services/mapLinks';
import { ClaimCountdownBadge } from './ClaimCountdownBadge';
import { CollectorRatingBadge } from './CollectorRatingBadge';
import { getGeoapifyStaticMapUrl } from '../services/geoapify';
import {
  MapPin,
  Filter,
  Truck,
  Plus,
  PlusCircle,
  Eye,
  CheckCircle2,
  Calendar,
  Phone,
  Sparkles,
  MessageSquare,
  Star,
  Lock,
  Compass,
  Clock,
  ExternalLink,
} from 'lucide-react';

interface ExploreMapViewProps {
  reports: WasteReport[];
  currentUser: UserProfile | null;
  onOpenReportModal: () => void;
  onClaimWaste: (report: WasteReport) => void;
  onOpenProofModal: (report: WasteReport) => void;
  onOpenWasteDetails?: (report: WasteReport) => void;
  onCloseMap?: () => void;
}

export const ExploreMapView: React.FC<ExploreMapViewProps> = ({
  reports,
  currentUser,
  onOpenReportModal,
  onClaimWaste,
  onOpenProofModal,
  onOpenWasteDetails,
  onCloseMap,
}) => {
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'claimed' | 'collected'>('all');
  const [wasteTypeFilter, setWasteTypeFilter] = useState<string>('all');
  const [lgaFilter, setLgaFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReport, setSelectedReport] = useState<WasteReport | null>(null);

  const pendingCount = useMemo(() => reports.filter((r) => r.status === 'pending').length, [reports]);
  const claimedCount = useMemo(() => reports.filter((r) => r.status === 'claimed').length, [reports]);
  const collectedCount = useMemo(() => reports.filter((r) => r.status === 'collected').length, [reports]);

  const filteredReports = reports.filter((r) => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (wasteTypeFilter !== 'all' && r.wasteType !== wasteTypeFilter) return false;
    if (lgaFilter !== 'all' && !r.lga.includes(lgaFilter)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchAddr = r.address.toLowerCase().includes(q);
      const matchLga = r.lga.toLowerCase().includes(q);
      const matchDesc = r.description.toLowerCase().includes(q);
      const matchType = r.wasteType.toLowerCase().includes(q);
      const matchZip = r.postalCode?.toLowerCase().includes(q);
      if (!matchAddr && !matchLga && !matchDesc && !matchType && !matchZip) return false;
    }
    return true;
  });

  // Calculate my active claims if collector
  const myClaimedCount = currentUser
    ? reports.filter((r) => r.status === 'claimed' && r.collectorId === currentUser.id).length
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-left">
      {/* Title & Action Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full mb-1">
            <Compass className="w-3.5 h-3.5" />
            <span>Akwa Ibom Waste Spot Navigator (External Chrome Maps)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Explore Waste Dumps in Akwa Ibom State
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Browse reported recyclable waste spots across Eket, Uyo, and all 31 LGAs. Tap "Open Location in Google Maps" to open exact GPS directions on Google Maps website.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onCloseMap && (
            <button
              type="button"
              onClick={onCloseMap}
              className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>← Close Map / Dashboard</span>
            </button>
          )}

          {isDisposer(currentUser?.role) ? (
            <button
              onClick={onOpenReportModal}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-600/20 flex items-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Report New Waste Spot</span>
            </button>
          ) : null}
        </div>
      </div>

      {/* Filter Row */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-wrap items-center gap-3">
        {/* Search input */}
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search address, landmark, postal code, LGA..."
            className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Status Dropdown Filter */}
        <div className="flex items-center gap-2">
          <label htmlFor="status-dropdown-filter" className="text-xs font-bold text-gray-700 flex items-center gap-1.5 shrink-0">
            <Filter className="w-4 h-4 text-emerald-600" />
            <span>Status:</span>
          </label>
          <select
            id="status-dropdown-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-1.5 rounded-xl border-2 border-emerald-500/40 hover:border-emerald-500 text-xs font-bold bg-emerald-50/50 text-gray-900 shadow-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
          >
            <option value="all">📍 All Statuses ({reports.length})</option>
            <option value="pending">🔴 Unclaimed Waste ({pendingCount})</option>
            <option value="claimed">🟡 Claimed (Not Cleaned) ({claimedCount})</option>
            <option value="collected">🟢 Cleaned Dumpsites ({collectedCount})</option>
          </select>
        </div>

        {/* Waste Type & LGA Selectors */}
        <div className="flex items-center gap-2 text-xs">
          <select
            value={wasteTypeFilter}
            onChange={(e) => setWasteTypeFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-gray-300 text-xs font-semibold bg-white"
          >
            <option value="all">All Waste Types</option>
            <option value="Plastic">Plastic</option>
            <option value="Metal">Metal & Cans</option>
            <option value="Organic">Organic</option>
            <option value="General">General</option>
            <option value="Hazardous">Hazardous</option>
          </select>

          {/* All 31 LGAs */}
          <select
            value={lgaFilter}
            onChange={(e) => setLgaFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-gray-300 text-xs font-semibold bg-white max-w-[160px] truncate"
          >
            <option value="all">All 31 LGAs</option>
            {AKWA_IBOM_LGAS.map((lga) => (
              <option key={lga} value={lga}>
                {lga}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid: Waste Spots List & Spotlight Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Grid of Waste Spot Cards (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between text-xs text-gray-500 px-1">
            <span>Showing <b>{filteredReports.length}</b> waste spots</span>
            <span className="text-[11px] text-emerald-700 font-semibold">
              Tap "Open Location in Google Maps" to open in Chrome with directions
            </span>
          </div>

          {reports.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-gray-200 text-gray-500 shadow-xs">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-emerald-100">
                <MapPin className="w-8 h-8" />
              </div>
              <h4 className="font-extrabold text-gray-900 text-lg">No E-Waste Reports Yet</h4>
              <p className="text-xs text-gray-500 mt-1.5 max-w-sm mx-auto leading-relaxed">
                The database is clean and empty. Be the first to report an electronic waste dump spot in Akwa Ibom State for safe, free collection!
              </p>
              {onOpenReportModal && isDisposer(currentUser?.role) && (
                <button
                  type="button"
                  onClick={onOpenReportModal}
                  className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Report First E-Waste Spot</span>
                </button>
              )}
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-gray-200 text-gray-500">
              <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <h4 className="font-bold text-gray-800 text-base">No waste spots match this filter</h4>
              <p className="text-xs text-gray-500 mt-1">Try selecting "All Statuses" or clearing your search query.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredReports.map((report) => {
                const isSelected = selectedReport?.id === report.id;

                return (
                  <div
                    key={report.id}
                    onClick={() => setSelectedReport(report)}
                    className={`bg-white rounded-3xl border transition-all p-4.5 flex flex-col justify-between shadow-xs hover:shadow-md cursor-pointer ${
                      isSelected
                        ? 'border-emerald-600 ring-2 ring-emerald-500/30 shadow-md'
                        : 'border-gray-200 hover:border-emerald-300'
                    }`}
                  >
                    <div>
                      {/* Photo & Badges */}
                      <div className="relative h-44 rounded-2xl overflow-hidden bg-gray-100 mb-3 border border-gray-100">
                        <img
                          src={report.photoUrl || report.imageUrl || 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600'}
                          alt={report.wasteType}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                          <span
                            className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                              report.status === 'pending'
                                ? 'bg-red-500 text-white'
                                : report.status === 'claimed'
                                ? 'bg-amber-400 text-gray-950'
                                : 'bg-emerald-500 text-white'
                            }`}
                          >
                            {report.status === 'pending'
                              ? '🔴 PENDING'
                              : report.status === 'claimed'
                              ? '🟡 CLAIMED'
                              : '🟢 CLEANED'}
                          </span>
                          <span className="text-[10px] font-bold bg-black/70 backdrop-blur-md text-white px-2 py-0.5 rounded-full">
                            {report.wasteType}
                          </span>
                        </div>

                        <div className="absolute bottom-2 right-2">
                          <span className="text-[10px] font-bold bg-white/90 backdrop-blur-md text-gray-900 px-2 py-0.5 rounded-md shadow-xs">
                            {report.size} Size
                          </span>
                        </div>
                      </div>

                      {/* 72h Timer if Claimed */}
                      {report.status === 'claimed' && (
                        <div className="my-1.5 flex items-center justify-between">
                          <ClaimCountdownBadge
                            expiresAt={report.expiresAt || report.expiryTime}
                            claimedAt={report.claimedAt}
                          />
                        </div>
                      )}

                      {/* Collector info with star rating */}
                      {report.collectorName && (
                        <div className="my-1 p-2 bg-amber-50/80 rounded-xl border border-amber-200/60 flex items-center justify-between text-xs">
                          <span className="font-bold text-gray-900 flex items-center gap-1">
                            <Truck className="w-3.5 h-3.5 text-emerald-600" />
                            {report.collectorName}
                          </span>
                          <CollectorRatingBadge
                            collectorName={report.collectorName}
                            ratingStars={report.collectorRatingStars}
                            totalCleanedWastes={report.collectorRatingStars ? Math.round(report.collectorRatingStars * 10) : 0}
                          />
                        </div>
                      )}


                      {/* Full Address Details */}
                      <div className="bg-gray-50/90 p-2.5 rounded-xl border border-gray-200 text-xs text-gray-800 space-y-1 my-2">
                        <div className="flex items-start gap-1">
                          <span className="text-gray-500 font-semibold min-w-[76px]">Postal Code:</span>
                          <span className="font-bold text-gray-900">{report.postalCode || '524101'}</span>
                        </div>
                        <div className="flex items-start gap-1">
                          <span className="text-gray-500 font-semibold min-w-[76px]">Street:</span>
                          <span className="font-bold text-gray-900">{report.roadStreet || report.address}</span>
                        </div>
                        <div className="flex items-start gap-1">
                          <span className="text-gray-500 font-semibold min-w-[76px]">LGA:</span>
                          <span className="font-bold text-emerald-800">{report.lga}</span>
                        </div>
                      </div>

                      <p className="text-xs text-gray-600 mt-1 bg-gray-50/70 p-2 rounded-xl line-clamp-2 italic">
                        "{report.description}"
                      </p>
                    </div>

                    {/* Bottom Actions */}
                    <div className="mt-4 pt-3 border-t border-gray-100 space-y-2">
                      {/* Under each waste, ONE BUTTON: "Open Location in Google Maps" */}
                      <a
                        href={`https://www.google.com/maps?q=${report.latitude ?? report.lat},${report.longitude ?? report.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => {
                          e.stopPropagation();
                          const latitude = report.latitude ?? report.lat;
                          const longitude = report.longitude ?? report.lng;
                          try {
                            const win = window.open(`https://www.google.com/maps?q=${latitude},${longitude}`, '_blank');
                            if (!win || win.closed || typeof win.closed === 'undefined') {
                              window.open(`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`, '_blank');
                            }
                          } catch {
                            window.open(`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`, '_blank');
                          }
                        }}
                        className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs active:scale-[0.98] cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Open Location in Google Maps</span>
                      </a>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onOpenWasteDetails) onOpenWasteDetails(report);
                          }}
                          className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold"
                        >
                          Details
                        </button>

                        {isAgent(currentUser?.role) && report.status === 'pending' && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onClaimWaste(report);
                            }}
                            className="flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white active:scale-95"
                          >
                            <Truck className="w-3.5 h-3.5" />
                            <span>Claim Waste</span>
                          </button>
                        )}

                        {isAgent(currentUser?.role) &&
                          report.status === 'claimed' &&
                          report.collectorId === currentUser?.id && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onOpenProofModal(report);
                              }}
                              className="flex-1 py-2 px-3 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Upload Clean Proof</span>
                            </button>
                          )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Spotlight Detail Panel (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-3xl border border-gray-200 p-5 shadow-sm sticky top-24">
            <h3 className="font-bold text-sm text-gray-900 mb-3 flex items-center justify-between">
              <span>Spotlight Details</span>
              {selectedReport && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    selectedReport.status === 'pending'
                      ? 'bg-red-100 text-red-700'
                      : selectedReport.status === 'claimed'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {selectedReport.status === 'pending'
                    ? 'Pending Pickup'
                    : selectedReport.status === 'claimed'
                    ? 'Claimed'
                    : 'Cleaned'}
                </span>
              )}
            </h3>

            {selectedReport ? (
              <div className="space-y-4 text-left">
                <div className="grid grid-cols-2 gap-2">
                  <div className="h-40 rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 relative">
                    <img
                      src={selectedReport.photoUrl || selectedReport.imageUrl || 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600'}
                      alt="Spot Photo"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-1.5 left-1.5 text-[9px] font-black bg-black/70 text-white px-2 py-0.5 rounded-md">
                      Spot Photo
                    </span>
                  </div>
                  <div className="h-40 rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 relative">
                    <img
                      src={getGeoapifyStaticMapUrl(
                        selectedReport.latitude ?? selectedReport.lat ?? 4.65,
                        selectedReport.longitude ?? selectedReport.lng ?? 8.05,
                        15,
                        320,
                        220
                      )}
                      alt="Geoapify Map"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-1.5 left-1.5 text-[9px] font-black bg-emerald-900/80 text-emerald-200 px-2 py-0.5 rounded-md">
                      Geoapify Map
                    </span>
                  </div>
                </div>

                <div>
                  {/* Address Details */}
                  <div className="bg-gray-50/90 p-2.5 rounded-xl border border-gray-200 text-xs text-gray-800 space-y-1 mb-2">
                    <div className="flex items-start gap-1">
                      <span className="text-gray-500 font-semibold min-w-[76px]">Postal Code:</span>
                      <span className="font-bold text-gray-900">{selectedReport.postalCode || 'N/A'}</span>
                    </div>
                    <div className="flex items-start gap-1">
                      <span className="text-gray-500 font-semibold min-w-[76px]">Street:</span>
                      <span className="font-bold text-gray-900">{selectedReport.roadStreet || selectedReport.address}</span>
                    </div>
                    <div className="flex items-start gap-1">
                      <span className="text-gray-500 font-semibold min-w-[76px]">LGA:</span>
                      <span className="font-bold text-emerald-800">{selectedReport.lga}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded-lg border border-emerald-100">
                      Type: {selectedReport.wasteType}
                    </span>
                    <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded-lg border border-emerald-100">
                      Size: {selectedReport.size}
                    </span>
                  </div>

                  <p className="text-xs text-gray-600 bg-gray-50 p-3 rounded-xl mt-2.5 leading-relaxed italic">
                    "{selectedReport.description}"
                  </p>
                </div>

                {/* External Google Maps Website Button */}
                <a
                  href={buildGoogleMapsWebUrl(selectedReport)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    openInGoogleMap(selectedReport);
                  }}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Open Location in Google Maps</span>
                </a>

                <div className="pt-2 border-t border-gray-100 text-xs space-y-1.5 text-gray-500">
                  <div>
                    Reported by: <b className="text-gray-800">{selectedReport.reporterName}</b>
                  </div>
                  {selectedReport.collectorName && (
                    <div className="flex items-center justify-between">
                      <span>
                        Claimed by: <b className="text-emerald-700">{selectedReport.collectorName}</b>
                      </span>
                      <span className="inline-flex items-center gap-1 font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[10px] border border-amber-200">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>{(selectedReport.collectorRatingStars ?? 2.0).toFixed(1)}★</span>
                      </span>
                    </div>
                  )}
                  {selectedReport.status === 'collected' && (
                    <div className="text-emerald-700 font-bold">
                      ✓ Recycled {selectedReport.collectedKg || 50} KG of material!
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="space-y-2 pt-1">
                  <button
                    onClick={() => {
                      if (onOpenWasteDetails) onOpenWasteDetails(selectedReport);
                    }}
                    className="w-full py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5"
                  >
                    <MessageSquare className="w-4 h-4 text-emerald-600" />
                    <span>
                      {selectedReport.status === 'claimed'
                        ? 'Open Private Chat & Details'
                        : 'View Full Details & Status'}
                    </span>
                  </button>

                  {isAgent(currentUser?.role) && selectedReport.status === 'pending' && (
                    <button
                      onClick={() => onClaimWaste(selectedReport)}
                      className="w-full py-3 rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white active:scale-95"
                    >
                      <Truck className="w-4 h-4" />
                      <span>Claim this Waste for Free Pickup</span>
                    </button>
                  )}

                  {isAgent(currentUser?.role) &&
                    selectedReport.status === 'claimed' &&
                    selectedReport.collectorId === currentUser?.id && (
                      <button
                        onClick={() => onOpenProofModal(selectedReport)}
                        className="w-full py-3 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Upload Clean Proof Photo</span>
                      </button>
                    )}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-gray-400">
                Tap on any waste spot card to view details and open turn-by-turn directions in Google Maps in Chrome.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
