import React, { useState, useEffect } from 'react';
import { WasteReport, UserProfile } from '../types';
import { calculateCollectorRating, getCollectorLevelInfo } from '../services/rating';
import { buildGoogleMapsWebUrl, openInExternalBrowser, openInGoogleMap } from '../services/mapLinks';
import { ClaimCountdownBadge } from './ClaimCountdownBadge';
import { CollectorRatingBadge } from './CollectorRatingBadge';
import { CleanSpotStore } from '../services/storage';
import { db } from '../services/firebaseService';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import {
  Truck,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Sparkles,
  Phone,
  Filter,
  Star,
  Lock,
  MessageSquare,
  AlertTriangle,
  Award,
  Bookmark,
  Menu,
  Compass,
  ExternalLink,
  Clock,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import { WasteCardContactPrivacy } from './WasteCardContactPrivacy';

interface CollectorDashboardProps {
  currentUser: UserProfile;
  reports: WasteReport[];
  onClaimWaste: (report: WasteReport) => void;
  onOpenProofModal: (report: WasteReport) => void;
  onOpenWasteDetails?: (report: WasteReport) => void;
  onOpenSideDrawer?: () => void;
  onUnclaimWaste?: (wasteId: string) => Promise<void> | void;
}

export const CollectorDashboard: React.FC<CollectorDashboardProps> = ({
  currentUser,
  reports,
  onClaimWaste,
  onOpenProofModal,
  onOpenWasteDetails,
  onOpenSideDrawer,
  onUnclaimWaste,
}) => {
  const [activeTab, setActiveTab] = useState<'available' | 'my-pickups' | 'history'>('available');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'claimed' | 'collected'>('all');
  const [wasteTypeFilter, setWasteTypeFilter] = useState<string>('all');
  const [sizeFilter, setSizeFilter] = useState<string>('all');
  const [selectedReport, setSelectedReport] = useState<WasteReport | null>(null);

  // RECOVERY AGENT RATING: Every 5 cleanups = 1 star rating (max 5 stars)
  const cleanupsCount = currentUser.cleanupsCount ?? currentUser.totalCleanedWastes ?? currentUser.collectionsCount ?? 0;
  const ratingStars = Math.min(5, Math.floor(cleanupsCount / 5));
  const levelInfo = getCollectorLevelInfo(ratingStars, cleanupsCount);

  // Progress to next 1.0 star
  const cleanupsInBatch = cleanupsCount % 5;
  const cleanupsNeededForNextStar = 5 - cleanupsInBatch;
  const progressPercent = (cleanupsInBatch / 5) * 100;

  // REQUIREMENT 2: FRONT PAGE DISPLAY (Show ALL waste reports on the main feed/homepage, newest first)
  const sortedReports = [...reports].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Real-time onSnapshot listener for Pending Wastes Available to Claim
  const [pendingWastesCount, setPendingWastesCount] = useState<number>(() => {
    return reports.filter((r) => r.status === 'pending' && !r.isClaimed && !r.claimedBy).length;
  });

  useEffect(() => {
    let isMounted = true;
    try {
      const q = query(
        collection(db, 'wastes'),
        where('status', '==', 'pending'),
        where('isClaimed', '==', false)
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (isMounted) {
            setPendingWastesCount(snapshot.size);
          }
        },
        (err) => {
          console.warn('Real-time pending wastes onSnapshot error, falling back to reports filter:', err);
          if (isMounted) {
            const count = reports.filter((r) => r.status === 'pending' && !r.isClaimed && !r.claimedBy).length;
            setPendingWastesCount(count);
          }
        }
      );

      return () => {
        isMounted = false;
        unsubscribe();
      };
    } catch (err) {
      console.warn('Pending wastes count error:', err);
      const count = reports.filter((r) => r.status === 'pending' && !r.isClaimed && !r.claimedBy).length;
      setPendingWastesCount(count);
    }
  }, [reports]);

  // Pending reports available to claim
  const pendingReports = reports.filter(
    (r) => r.status === 'pending' && !r.isClaimed && !r.claimedBy
  );

  // Currently claimed by this collector (in progress)
  const myClaimedReports = reports.filter(
    (r) => r.status === 'claimed' && (r.collectorId === currentUser.id || r.claimedBy === currentUser.id)
  );

  // Completed collections by this collector
  const myCompletedReports = reports.filter(
    (r) => r.status === 'collected' && (r.collectorId === currentUser.id || r.claimedBy === currentUser.id)
  );

  // Filter feed reports
  const filteredFeedReports = sortedReports.filter((r) => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (wasteTypeFilter !== 'all' && r.wasteType !== wasteTypeFilter) return false;
    if (sizeFilter !== 'all' && r.size !== sizeFilter) return false;
    return true;
  });

  const totalKg = currentUser.totalKgCollected || 640;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* FEATURE 2: Collector Profile Banner with Rating & Level System */}
      <div className="bg-gradient-to-r from-teal-900 via-emerald-800 to-green-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
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
          <div className="relative">
            <img
              src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
              alt={currentUser.name}
              className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-white/60 shadow-md"
            />
            <span className="absolute -bottom-1 -right-1 bg-amber-400 text-gray-950 p-1.5 rounded-full text-xs font-black shadow flex items-center justify-center">
              {levelInfo.icon}
            </span>
          </div>

          <div className="text-left space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-1 text-xs font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${levelInfo.badgeClass}`}>
                {levelInfo.icon} {levelInfo.title}
              </span>
              <span className="text-xs text-teal-100">{currentUser.lga || 'Eket'}, Akwa Ibom</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white">
              {currentUser.name}
            </h1>

            {/* Star Rating and Confirmed Cleans */}
            <div className="flex flex-wrap items-center gap-2.5 pt-0.5">
              <div className="flex items-center gap-1 bg-black/25 px-2.5 py-1 rounded-xl border border-white/10">
                <div className="flex text-amber-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= Math.floor(ratingStars)
                          ? 'fill-amber-400 text-amber-400'
                          : star - 0.5 <= ratingStars
                          ? 'fill-amber-300 text-amber-300'
                          : 'text-gray-400'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-black text-amber-300 ml-1">
                  {ratingStars.toFixed(1)} Stars
                </span>
              </div>

              <span className="text-xs text-teal-100 bg-white/10 px-2.5 py-1 rounded-xl">
                <b>{cleanupsCount}</b> Confirmed Cleanings
              </span>
            </div>
          </div>
        </div>

        {/* Level Progression & Impact Numbers */}
        <div className="w-full md:w-auto flex flex-col gap-2.5 text-left">
          {/* Milestone Progress Bar */}
          <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20 min-w-[280px]">
            <div className="flex items-center justify-between text-xs font-bold text-teal-100 mb-1">
              <span>Next +1★ Milestone (5 Cleanups per Star)</span>
              <span>{cleanupsInBatch} / 5 Cleanings</span>
            </div>
            <div className="w-full h-2.5 bg-black/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-[10px] text-teal-200 mt-1.5">
              {ratingStars >= 5
                ? '🏆 Maximum 5 Stars Reached! Master Recycler.'
                : `${cleanupsNeededForNextStar} more cleanups to reach ${ratingStars + 1}★`}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center text-xs">
            <div className="bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
              <div className="font-black text-sm text-white">{totalKg.toLocaleString()} KG</div>
              <div className="text-[9px] uppercase text-teal-200 font-bold">Total Recycled</div>
            </div>
            <div className="bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
              <div className="font-black text-sm text-amber-300">All Sizes (Small, Med, Huge)</div>
              <div className="text-[9px] uppercase text-teal-200 font-bold">Accessible Dumps</div>
            </div>
          </div>

          {/* Real-time Pending Waste Stats Card */}
          <div className="bg-emerald-950/80 backdrop-blur-md p-3 rounded-2xl border border-emerald-400/40 flex items-center gap-3 text-left shadow-lg">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-black text-lg shadow-sm shrink-0">
              {pendingWastesCount}
            </div>
            <div>
              <div className="text-xs font-black text-white">
                {pendingWastesCount} Pending Wastes Available to Claim
              </div>
              <div className="text-[10px] text-teal-200">
                Live onSnapshot query • Ready to claim
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Open Access Notice */}
      <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-left flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-emerald-900">
        <div className="flex items-start gap-2.5">
          <Award className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-extrabold text-emerald-950">Open Access: </span>
            <span className="text-emerald-800">
              All collectors (Beginner, Medium, Expert) can access and claim <b>Small, Medium, and Huge</b> waste dumps across Akwa Ibom.
            </span>
          </div>
        </div>
        <span className="text-[11px] font-black bg-emerald-200/80 text-emerald-900 px-3 py-1 rounded-xl shrink-0">
          ✓ All Sizes Unlocked
        </span>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-3">
        <button
          onClick={() => setActiveTab('available')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
            activeTab === 'available'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>All Waste Feed & Pickups</span>
          <span className="bg-white/20 text-white px-2 py-0.5 rounded-full text-xs">
            {reports.length}
          </span>
          {pendingReports.length > 0 && (
            <span className="bg-red-500 text-white px-1.5 py-0.5 rounded-full text-[10px] font-black">
              {pendingReports.length} Available
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('my-pickups')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
            activeTab === 'my-pickups'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Active Claims & 72h Timers</span>
          {myClaimedReports.length > 0 && (
            <span className="bg-amber-800 text-white px-2 py-0.5 rounded-full text-xs font-bold">
              {myClaimedReports.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
            activeTab === 'history'
              ? 'bg-teal-700 text-white shadow-sm'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Completed Pickups</span>
        </button>
      </div>

      {/* Main Feed Content - Shows ALL Waste Reports Ordered by Newest First */}
      {activeTab === 'available' && (
        <div className="space-y-6 text-left">
          {/* Header & Filters */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-gray-200 shadow-sm">
            <div>
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-gray-900 text-lg">
                  Akwa Ibom Waste Management Feed ({filteredFeedReports.length})
                </h3>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                All waste reports ordered newest first. Inspect dumps, open in Google Maps, and claim for recycling!
              </p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="text-xs px-3 py-2 rounded-xl border border-gray-300 bg-white font-bold text-gray-700 shadow-xs focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">All Statuses (Pending, Claimed, Cleaned)</option>
                <option value="pending">🔴 Pending Only</option>
                <option value="claimed">🟡 Claimed Only</option>
                <option value="collected">🟢 Cleaned Only</option>
              </select>

              <select
                value={sizeFilter}
                onChange={(e) => setSizeFilter(e.target.value)}
                className="text-xs px-3 py-2 rounded-xl border border-gray-300 bg-white font-bold text-gray-700 shadow-xs focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">All Sizes (Small, Medium, Huge)</option>
                <option value="Small">Small Dumps</option>
                <option value="Medium">Medium Dumps</option>
                <option value="Huge">Huge Dumps</option>
              </select>

              <select
                value={wasteTypeFilter}
                onChange={(e) => setWasteTypeFilter(e.target.value)}
                className="text-xs px-3 py-2 rounded-xl border border-gray-300 bg-white font-bold text-gray-700 shadow-xs focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">All Waste Types</option>
                <option value="Plastic">Plastics</option>
                <option value="Metal">Metals</option>
                <option value="Organic">Organic</option>
                <option value="General">General</option>
                <option value="Hazardous">Hazardous</option>
              </select>
            </div>
          </div>

          {reports.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-gray-200 text-gray-500">
              <Truck className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
              <h4 className="font-extrabold text-base text-gray-800">No E-Waste Spots Reported Yet</h4>
              <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
                The database is clean and empty. As soon as a Waste Reporter posts an e-waste report, it will appear here in real time for you to claim and collect!
              </p>
            </div>
          ) : filteredFeedReports.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-gray-200 text-gray-500">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
              <h4 className="font-bold text-base text-gray-800">No dumps match filter</h4>
              <p className="text-xs text-gray-500 mt-1">
                Try changing status, size, or waste type filters to see other dumps in Akwa Ibom.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredFeedReports.map((report) => (
                <div
                  key={report.id}
                  className={`bg-white rounded-3xl border p-4 shadow-sm flex flex-col justify-between transition-all hover:shadow-md ${
                    report.status === 'pending'
                      ? 'border-red-300 hover:border-red-400'
                      : report.status === 'claimed'
                      ? 'border-amber-300 hover:border-amber-400'
                      : 'border-emerald-200 hover:border-emerald-300'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Photo & Badges */}
                    <div className="relative aspect-video rounded-2xl overflow-hidden bg-gray-100 border border-gray-100">
                      <img
                        src={report.photoUrl || report.imageUrl || 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600'}
                        alt={report.wasteType}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-xs text-white">
                          {report.wasteType}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-700 text-white">
                          {report.size}
                        </span>
                      </div>

                      {/* Status indicator badge */}
                      <div className="absolute top-2 right-2">
                        <span
                          className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                            report.status === 'pending'
                              ? 'bg-red-500 text-white shadow-md'
                              : report.status === 'claimed'
                              ? 'bg-amber-400 text-gray-950 font-black shadow-md'
                              : 'bg-emerald-600 text-white shadow-md'
                          }`}
                        >
                          {report.status === 'pending'
                            ? '🔴 PENDING'
                            : report.status === 'claimed'
                            ? '🟡 CLAIMED'
                            : '🟢 CLEANED'}
                        </span>
                      </div>
                    </div>

                    {/* 72h Live Timer if Claimed */}
                    {report.status === 'claimed' && (
                      <div className="flex items-center justify-between">
                        <ClaimCountdownBadge
                          expiresAt={report.expiresAt || report.expiryTime}
                          claimedAt={report.claimedAt}
                        />
                      </div>
                    )}

                    {/* Collector info with star rating if claimed or cleaned */}
                    {report.collectorName && (
                      <div className="p-2 bg-amber-50/80 rounded-xl border border-amber-200/60 flex items-center justify-between text-xs">
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

                    {/* Address Details */}
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

                    <p className="text-xs text-gray-600 line-clamp-2 mt-1 italic">
                      "{report.description}"
                    </p>

                    {/* Phone & Chat Privacy Logic (Requirement 5) */}
                    <WasteCardContactPrivacy
                      report={report}
                      currentUserId={currentUser.id}
                      onOpenChat={onOpenWasteDetails}
                    />

                    {/* Google Maps Button */}
                    <a
                      href={buildGoogleMapsWebUrl(report)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        openInGoogleMap(report);
                      }}
                      className="w-full mt-2 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs active:scale-[0.98] cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open Location in Google Maps</span>
                    </a>
                  </div>

                  {/* Actions depending on Status */}
                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (onOpenWasteDetails) onOpenWasteDetails(report);
                      }}
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold"
                    >
                      Details
                    </button>

                    {report.status === 'pending' && (
                      <button
                        type="button"
                        onClick={() => onClaimWaste(report)}
                        className="flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white active:scale-95"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>Claim Waste (72h Timer)</span>
                      </button>
                    )}

                    {report.status === 'claimed' && report.collectorId === currentUser.id && (
                      <button
                        type="button"
                        onClick={() => onOpenProofModal(report)}
                        className="flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white active:scale-95"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Upload Clean Proof</span>
                      </button>
                    )}

                    {report.status === 'claimed' && report.collectorId !== currentUser.id && (
                      <div className="flex-1 py-2 px-2.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs font-bold text-center">
                        Claimed • In Progress
                      </div>
                    )}

                    {report.status === 'collected' && (
                      <div className="flex-1 py-2 px-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold text-center">
                        ✓ Cleaned
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* FEATURE 1: Active Claims Tab with Private Chat Access */}
      {activeTab === 'my-pickups' && (
        <div className="space-y-4 text-left">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-900 text-lg">My Active Claims</h3>
              <p className="text-xs text-gray-500">
                You claimed these waste reports. Open the private chat to coordinate with the reporter, then upload your clean proof photo.
              </p>
            </div>
          </div>

          {myClaimedReports.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-gray-200 text-gray-500">
              <Truck className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <h4 className="font-bold text-base text-gray-800">No active pickups claimed right now</h4>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                Go to the "Available Waste for Pickup" tab to claim recyclable dumps in Akwa Ibom for free.
              </p>
              <button
                onClick={() => setActiveTab('available')}
                className="mt-4 px-5 py-2.5 bg-emerald-600 text-white text-xs font-bold rounded-xl"
              >
                Browse Available Dumps
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myClaimedReports.map((report) => (
                <div
                  key={report.id}
                  className="bg-white rounded-3xl border-2 border-amber-300 p-5 shadow-sm space-y-4"
                >
                  <div className="flex gap-4">
                    <img
                      src={report.photoUrl || report.imageUrl || 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600'}
                      alt=""
                      className="w-28 h-28 rounded-2xl object-cover shrink-0 border border-gray-100"
                    />
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full">
                          Claimed by You • Pickup in Progress
                        </span>
                        <ClaimCountdownBadge
                          expiresAt={report.expiresAt || report.expiryTime}
                          claimedAt={report.claimedAt}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            CleanSpotStore.expireClaimForTesting(report.id);
                          }}
                          className="text-[10px] font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-2 py-0.5 rounded-md flex items-center gap-1 transition-colors cursor-pointer"
                          title="Simulate 72 hours expiration: returns waste to feed as PENDING and allows re-claiming"
                        >
                          <RotateCcw className="w-3 h-3 text-red-600" />
                          <span>Simulate 72h Expiry</span>
                        </button>
                      </div>
                      {/* REQUIREMENT 5: SHOW THE FULL ADDRESS TO COLLECTOR */}
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

                      <p className="text-xs text-gray-700 bg-emerald-50/50 p-2 rounded-xl mt-1 line-clamp-2 italic border border-emerald-100">
                        "{report.description}"
                      </p>

                      {/* REQUIREMENT 4: ONE BUTTON: "Open Location in Google Maps" */}
                      <a
                        href={`https://www.google.com/maps?q=${report.latitude ?? report.lat},${report.longitude ?? report.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => {
                          e.stopPropagation();
                          openInGoogleMap(report);
                        }}
                        className="w-full mt-2.5 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs active:scale-[0.98] cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Open Location in Google Maps</span>
                      </a>
                    </div>
                  </div>

                  {/* Phone & Chat Privacy Logic (Requirement 5) */}
                  <WasteCardContactPrivacy
                    report={report}
                    currentUserId={currentUser.id}
                    onOpenChat={onOpenWasteDetails}
                  />

                  {/* Action buttons: Unclaim + Upload Proof / Waiting for Acknowledgement */}
                  <div className="pt-1 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (onUnclaimWaste) {
                          await onUnclaimWaste(report.id);
                        }
                      }}
                      className="py-3 px-4 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-black rounded-2xl transition-all shadow-md flex items-center justify-center gap-1.5 text-xs cursor-pointer active:scale-95"
                      title="Delete / Unclaim: Return waste to pending waste pool so other agents can claim"
                    >
                      <Trash2 className="w-4 h-4 text-white" />
                      <span>DELETE / UNCLAIM</span>
                    </button>

                    {report.waitingAcknowledgement ? (
                      <div className="flex-1 py-3 px-3 bg-amber-100 text-amber-900 border border-amber-300 font-bold rounded-2xl flex items-center justify-center gap-2 text-xs text-center">
                        <Clock className="w-4 h-4 text-amber-700 animate-spin-slow shrink-0" />
                        <span>Waiting for Disposer Acknowledgement</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => onOpenProofModal(report)}
                        className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 text-xs active:scale-[0.99] cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Upload Clean Spot Photo</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* History Tab with Reporter Quality Confirmation */}
      {activeTab === 'history' && (
        <div className="space-y-4 text-left">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-900 text-lg">My Recycling History & Ratings</h3>
              <p className="text-xs text-gray-500">
                Verified collections with proof photos. Cleanings confirmed well by reporters count toward your star rating.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myCompletedReports.map((report) => (
              <div key={report.id} className="bg-white rounded-3xl border border-gray-200 p-4 shadow-sm space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative">
                    <span className="absolute top-1 left-1 bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                      Before
                    </span>
                    <img
                      src={report.photoUrl || report.imageUrl || 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600'}
                      alt=""
                      className="w-full h-24 rounded-xl object-cover"
                    />
                  </div>
                  <div className="relative">
                    <span className="absolute top-1 left-1 bg-emerald-700 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                      Clean Proof
                    </span>
                    <img
                      src={report.proofPhoto || report.cleanPhoto || report.photoUrl || report.imageUrl || 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600'}
                      alt=""
                      className="w-full h-24 rounded-xl object-cover border-2 border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                      +{report.collectedKg || 80} KG Recycled
                    </span>
                    <span className="text-[11px] text-gray-400">
                      {report.collectedAt ? new Date(report.collectedAt).toLocaleDateString() : 'Recent'}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-gray-900 mt-2 truncate">{report.address}</h4>
                  <p className="text-[11px] text-gray-500 truncate">{report.lga} • {report.wasteType}</p>

                  {/* Reporter confirmation pill */}
                  <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px]">
                    {report.reporterConfirmedClean ? (
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>Confirmed Clean (+0.5★ progress)</span>
                      </span>
                    ) : (
                      <span className="text-gray-400 italic">
                        Cleaned • Chat closed
                      </span>
                    )}

                    <button
                      onClick={() => {
                        if (onOpenWasteDetails) onOpenWasteDetails(report);
                      }}
                      className="text-xs text-emerald-700 hover:underline font-semibold"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
