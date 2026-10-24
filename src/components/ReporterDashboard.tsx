import React, { useState } from 'react';
import { WasteReport, UserProfile } from '../types';
import { AKWA_IBOM_LGAS } from '../data/seedData';
import { getCollectorLevelInfo, formatCollectorStarsText } from '../services/rating';
import { openInGoogleMap, buildGoogleMapsWebUrl } from '../services/mapLinks';
import { ClaimCountdownBadge } from './ClaimCountdownBadge';
import { CollectorRatingBadge } from './CollectorRatingBadge';
import { UserAvatar } from './UserAvatar';
import {
  PlusCircle,
  CheckCircle2,
  Truck,
  MapPin,
  Sparkles,
  Phone,
  Coins,
  MessageSquare,
  Star,
  Eye,
  Menu,
  Clock,
  ExternalLink,
  Filter,
  Trash2,
} from 'lucide-react';
import { WasteCardContactPrivacy } from './WasteCardContactPrivacy';

interface ReporterDashboardProps {
  currentUser: UserProfile;
  reports: WasteReport[];
  onOpenReportModal: () => void;
  onSelectReportOnMap?: (report: WasteReport) => void;
  onOpenWasteDetails?: (report: WasteReport) => void;
  onOpenSideDrawer?: () => void;
  onDeleteWaste?: (wasteId: string) => Promise<void> | void;
  onAcknowledgeCleanup?: (report: WasteReport) => Promise<void> | void;
}

export const ReporterDashboard: React.FC<ReporterDashboardProps> = ({
  currentUser,
  reports,
  onOpenReportModal,
  onSelectReportOnMap,
  onOpenWasteDetails,
  onOpenSideDrawer,
  onDeleteWaste,
  onAcknowledgeCleanup,
}) => {
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'claimed' | 'collected'>('all');
  const [selectedReport, setSelectedReport] = useState<WasteReport | null>(null);

  // Near Me Waste Spots List Filters
  const [nearMeSearchQuery, setNearMeSearchQuery] = useState('');
  const [nearMeStatusFilter, setNearMeStatusFilter] = useState<'all' | 'pending' | 'claimed' | 'collected'>('all');
  const [nearMeLgaFilter, setNearMeLgaFilter] = useState('all');

  const filteredNearMeReports = reports.filter((r) => {
    if (nearMeStatusFilter !== 'all' && r.status !== nearMeStatusFilter) return false;
    if (nearMeLgaFilter !== 'all' && !r.lga.includes(nearMeLgaFilter)) return false;
    if (nearMeSearchQuery.trim()) {
      const q = nearMeSearchQuery.toLowerCase();
      const matchAddr = r.address.toLowerCase().includes(q);
      const matchLga = r.lga.toLowerCase().includes(q);
      const matchDesc = r.description.toLowerCase().includes(q);
      const matchType = r.wasteType.toLowerCase().includes(q);
      const matchZip = r.postalCode?.toLowerCase().includes(q);
      if (!matchAddr && !matchLga && !matchDesc && !matchType && !matchZip) return false;
    }
    return true;
  });

  const sortedNearMeReports = [...filteredNearMeReports].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // My reports vs community reports (Disposal Agent broadcasts)
  const myReports = reports.filter(
    (r) => r.reporterId === currentUser.id || r.disposerId === currentUser.id
  );

  const filteredMyReports = myReports.filter((r) => {
    if (statusFilter === 'all') return true;
    return r.status === statusFilter;
  });

  const sortedMyReports = [...filteredMyReports].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const pendingCount = myReports.filter((r) => r.status === 'pending').length;
  const claimedCount = myReports.filter((r) => r.status === 'claimed').length;
  const collectedCount = myReports.filter((r) => r.status === 'collected').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome & Stats Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          {onOpenSideDrawer && (
            <button
              onClick={onOpenSideDrawer}
              className="p-2 sm:p-2.5 bg-white/15 hover:bg-white/25 rounded-2xl text-white transition-all flex items-center justify-center shrink-0 border border-white/20 active:scale-95 shadow-sm"
              title="Open Hamburger Side Menu"
              aria-label="Open side drawer navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
          <UserAvatar user={currentUser} size="xl" borderClassName="border-2 border-white/60 shadow-md shrink-0" />
          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full">
                Waste Disposer
              </span>
              <span className="text-xs text-emerald-100">{currentUser.lga || 'Eket LGA'}, Akwa Ibom</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black mt-1">
              Welcome back, {currentUser.name}!
            </h1>
            <p className="text-emerald-100 text-xs sm:text-sm mt-0.5">
              Every dump you map in Eket alerts local recyclers to pick it up for free. Chat directly with collectors to give directions & warnings!
            </p>
          </div>
        </div>

        {/* Reporter Action & Points */}
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/20 text-center flex-1 sm:flex-none">
            <div className="flex items-center justify-center gap-1.5 text-amber-300 font-black text-xl">
              <Coins className="w-5 h-5" />
              <span>{currentUser.points}</span>
            </div>
            <div className="text-[10px] text-emerald-100 uppercase tracking-wider font-semibold">
              Eco Points Earned
            </div>
          </div>

          <button
            onClick={onOpenReportModal}
            className="px-6 py-3.5 bg-white hover:bg-emerald-50 text-emerald-900 font-black rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm active:scale-[0.98] flex-1 sm:flex-none cursor-pointer"
          >
            <PlusCircle className="w-5 h-5 text-emerald-600" />
            <span>+ Broadcast Waste (+50 pts)</span>
          </button>
        </div>
      </div>

      {/* Quick Status Tally */}
      <div className="grid grid-cols-3 gap-3 sm:gap-6">
        <div
          onClick={() => setStatusFilter('pending')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'pending'
              ? 'border-red-500 bg-red-50/60 shadow-md ring-1 ring-red-500'
              : 'border-gray-200 bg-white hover:border-red-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase">Pending</span>
            <span className="w-3 h-3 rounded-full bg-red-500"></span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-red-600 mt-2">{pendingCount}</div>
          <p className="text-[11px] text-gray-500 mt-1">Awaiting collector pickup</p>
        </div>

        <div
          onClick={() => setStatusFilter('claimed')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'claimed'
              ? 'border-amber-500 bg-amber-50/60 shadow-md ring-1 ring-amber-500'
              : 'border-gray-200 bg-white hover:border-amber-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase">Claimed & Chat Open</span>
            <span className="w-3 h-3 rounded-full bg-amber-500"></span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-600 mt-2">{claimedCount}</div>
          <p className="text-[11px] text-gray-500 mt-1">Chat active with collector</p>
        </div>

        <div
          onClick={() => setStatusFilter('collected')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'collected'
              ? 'border-emerald-500 bg-emerald-50/60 shadow-md ring-1 ring-emerald-500'
              : 'border-gray-200 bg-white hover:border-emerald-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase">Cleaned & Recycled</span>
            <span className="w-3 h-3 rounded-full bg-emerald-600"></span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 mt-2">{collectedCount}</div>
          <p className="text-[11px] text-gray-500 mt-1">Verified clean spots</p>
        </div>
      </div>

      {/* Main Grid: Reported Waste Spots Near Me List + My Reports Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Reported Waste Spots Near Me (SIMPLE LIST - NO MAP) */}
        <div className="lg:col-span-7 space-y-4 text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-600" />
                <span>Reported Waste Spots Near Me</span>
              </h2>
              <p className="text-xs text-gray-500">
                Browse community reported waste dumps. Tap "Open Location in Google Maps" to view in external Chrome satellite view.
              </p>
            </div>
            <span className="text-xs font-bold bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-xl self-start sm:self-auto border border-emerald-200">
              {filteredNearMeReports.length} Spots
            </span>
          </div>

          {/* Search bar & Filters (Status, LGA) */}
          <div className="bg-white p-3 rounded-2xl border border-gray-200 shadow-xs flex flex-wrap gap-2 items-center">
            <div className="flex-1 min-w-[150px]">
              <input
                type="text"
                value={nearMeSearchQuery}
                onChange={(e) => setNearMeSearchQuery(e.target.value)}
                placeholder="Search spots by address, postal code, LGA..."
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Status Filter */}
            <select
              value={nearMeStatusFilter}
              onChange={(e) => setNearMeStatusFilter(e.target.value as any)}
              className="px-2.5 py-1.5 text-xs font-bold rounded-xl border border-gray-300 bg-white"
            >
              <option value="all">All Statuses</option>
              <option value="pending">🔴 Pending</option>
              <option value="claimed">🟡 Claimed</option>
              <option value="collected">🟢 Cleaned</option>
            </select>

            {/* LGA Filter */}
            <select
              value={nearMeLgaFilter}
              onChange={(e) => setNearMeLgaFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs font-bold rounded-xl border border-gray-300 bg-white max-w-[140px] truncate"
            >
              <option value="all">All 31 LGAs</option>
              {AKWA_IBOM_LGAS.map((lga) => (
                <option key={lga} value={lga}>
                  {lga}
                </option>
              ))}
            </select>
          </div>

          {/* Simple List - Ordered Newest First */}
          {reports.length === 0 ? (
            <div className="p-10 text-center bg-white rounded-3xl border border-gray-200 text-gray-500 shadow-xs">
              <MapPin className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <h4 className="font-extrabold text-gray-900 text-base">No E-Waste Reports Yet</h4>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                No electronic waste has been reported yet. Be the first to report an e-waste spot for collection!
              </p>
              <button
                type="button"
                onClick={onOpenReportModal}
                className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                + Report First E-Waste Spot
              </button>
            </div>
          ) : sortedNearMeReports.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-gray-200 text-gray-500 text-xs">
              No waste spots found matching your search and filter criteria.
            </div>
          ) : (
            <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
              {sortedNearMeReports.map((report) => (
                <div
                  key={report.id}
                  className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs hover:border-emerald-300 transition-all text-left flex flex-col sm:flex-row gap-4"
                >
                  {/* Photo */}
                  <img
                    src={report.photoUrl || report.imageUrl || 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600'}
                    alt={report.address}
                    className="w-full sm:w-28 h-28 rounded-xl object-cover shrink-0 border border-gray-100"
                  />

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-1.5 mb-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span
                            className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                              report.status === 'pending'
                                ? 'bg-red-500 text-white shadow-xs'
                                : report.status === 'claimed'
                                ? 'bg-amber-400 text-gray-950 font-black shadow-xs'
                                : 'bg-emerald-600 text-white shadow-xs'
                            }`}
                          >
                            {report.status === 'pending'
                              ? '🔴 PENDING'
                              : report.status === 'claimed'
                              ? '🟡 CLAIMED'
                              : '🟢 CLEANED'}
                          </span>

                          {report.status === 'claimed' && (
                            <ClaimCountdownBadge
                              expiresAt={report.expiresAt || report.expiryTime}
                              claimedAt={report.claimedAt}
                            />
                          )}
                        </div>

                        <span className="text-[11px] text-gray-400 font-medium">
                          {new Date(report.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Collector info with star rating if claimed or cleaned */}
                      {report.collectorName && (
                        <div className="my-1.5 p-2 bg-amber-50/80 rounded-xl border border-amber-200/60 flex items-center justify-between text-xs">
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

                      {/* Full Location Details */}
                      <div className="bg-gray-50/90 p-2.5 rounded-xl border border-gray-200 text-xs text-gray-800 space-y-1 my-2">
                        <div className="flex items-start gap-1">
                          <span className="text-gray-500 font-semibold min-w-[76px]">Postal Code:</span>
                          <span className="font-bold text-gray-900">{report.postalCode || 'N/A'}</span>
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

                      <div className="text-xs text-gray-500">
                        {report.wasteType} • {report.size} size
                      </div>

                      <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded-lg mt-1 line-clamp-2 italic">
                        "{report.description}"
                      </p>

                      {/* Phone & Chat Privacy Logic (Requirement 5) */}
                      <WasteCardContactPrivacy
                        report={report}
                        currentUserId={currentUser.id}
                        onOpenChat={onOpenWasteDetails}
                      />
                    </div>

                    {/* Under each waste, ONE BUTTON: "Open Location in Google Maps" */}
                    <div className="mt-3 pt-2 border-t border-gray-100 flex flex-wrap items-center gap-2">
                      <a
                        href={buildGoogleMapsWebUrl(report)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          openInGoogleMap(report);
                        }}
                        className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 active:scale-[0.98] cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Open Location in Google Maps</span>
                      </a>

                      {onOpenWasteDetails && (
                        <button
                          type="button"
                          onClick={() => onOpenWasteDetails(report)}
                          className="py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-colors"
                        >
                          Details & Chat
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* My Reports List */}
        <div className="lg:col-span-5 space-y-4 text-left">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <span>My Reports</span>
              <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                {myReports.length}
              </span>
            </h2>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 text-xs">
              {(['all', 'pending', 'claimed', 'collected'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setStatusFilter(filter)}
                  className={`px-2.5 py-1 rounded-lg capitalize font-semibold transition-all ${
                    statusFilter === filter
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {filteredMyReports.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-gray-200 text-gray-500">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm text-gray-800">No reports found for this filter</h4>
              <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
                Spot dirty waste on your street? Snap it now to earn points and clean up!
              </p>
              <button
                onClick={onOpenReportModal}
                className="mt-4 px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl text-xs hover:bg-emerald-700"
              >
                + Report Waste
              </button>
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {filteredMyReports.map((report) => {
                const collectorLevel = getCollectorLevelInfo(report.collectorRatingStars ?? 0);

                return (
                  <div
                    key={report.id}
                    onClick={() => {
                      setSelectedReport(report);
                      if (onOpenWasteDetails) onOpenWasteDetails(report);
                    }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer bg-white text-left ${
                      selectedReport?.id === report.id
                        ? 'border-emerald-600 shadow-md ring-1 ring-emerald-500'
                        : 'border-gray-200 hover:border-emerald-300'
                    }`}
                  >
                    <div className="flex gap-3">
                      <img
                        src={report.photoUrl || report.imageUrl || 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600'}
                        alt={report.wasteType}
                        className="w-22 h-22 rounded-xl object-cover shrink-0 border border-gray-100"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                report.status === 'pending'
                                  ? 'bg-red-100 text-red-700'
                                  : report.status === 'claimed'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {report.status === 'pending'
                                ? 'Pending Pickup'
                                : report.status === 'claimed'
                                ? 'Claimed • Chat Open'
                                : 'Cleaned & Recycled'}
                            </span>

                            {report.status === 'claimed' && (
                              <ClaimCountdownBadge
                                expiresAt={report.expiresAt || report.expiryTime}
                                claimedAt={report.claimedAt}
                              />
                            )}
                          </div>
                          
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] text-gray-400 font-medium">
                              {new Date(report.createdAt).toLocaleDateString()}
                            </span>
                            {/* Functional DELETE button for Disposal Agent */}
                            <button
                              type="button"
                              onClick={async (e) => {
                                e.stopPropagation();
                                if (onDeleteWaste) {
                                  await onDeleteWaste(report.id);
                                }
                              }}
                              className="px-2.5 py-1 rounded-xl text-xs font-black text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition-all flex items-center gap-1 cursor-pointer shadow-xs active:scale-95"
                              title="Delete waste report from all platform lists"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-600" />
                              <span>DELETE</span>
                            </button>
                          </div>
                        </div>

                        <h4 className="font-bold text-xs text-gray-900 mt-1 truncate">
                          {report.address}
                        </h4>
                        <p className="text-[11px] text-gray-500 truncate mt-0.5">
                          {report.wasteType} • {report.size} size • {report.lga}
                        </p>

                        {/* Phone & Chat Privacy Logic (Requirement 5) */}
                        <WasteCardContactPrivacy
                          report={report}
                          currentUserId={currentUser.id}
                          onOpenChat={onOpenWasteDetails}
                        />

                        {/* CLEANUP ACKNOWLEDGEMENT ACTION FOR DISPOSER */}
                        {(report.waitingAcknowledgement || (!report.acknowledgement && (report.cleanPhoto || report.proofPhoto))) && report.status !== 'completed' && (
                          <div className="mt-2 pt-2 border-t border-amber-200 bg-amber-50/60 p-2.5 rounded-xl text-left space-y-1.5">
                            <div className="text-[11px] font-bold text-amber-900 flex items-center gap-1">
                              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                              <span>Agent uploaded clean spot photo!</span>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (onAcknowledgeCleanup) onAcknowledgeCleanup(report);
                              }}
                              className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-md flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                            >
                              <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                              <span>Confirm Cleanup (Acknowledge)</span>
                            </button>
                          </div>
                        )}

                        {/* Completed / Acknowledged status */}
                        {report.status === 'completed' && (
                          <div className="mt-2 pt-2 border-t border-emerald-100 text-[11px] text-emerald-800 bg-emerald-50/70 p-2 rounded-xl flex items-center justify-between">
                            <span className="font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              Cleanup Confirmed & Recycled!
                            </span>
                            <span className="text-[10px] text-emerald-700 font-bold">✓ Verified</span>
                          </div>
                        )}

                        {/* Proof photo thumbnail if cleaned */}
                        {report.status === 'collected' && !report.waitingAcknowledgement && (
                          <div className="mt-2 pt-2 border-t border-emerald-100 space-y-1.5">
                            <div className="flex items-center justify-between text-[11px] text-emerald-800 bg-emerald-50/70 p-2 rounded-xl">
                              <span className="font-bold flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                Clean Proof: {report.collectedKg || 50} KG recycled!
                              </span>
                              <span className="text-[10px] text-gray-500">Chat closed</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
