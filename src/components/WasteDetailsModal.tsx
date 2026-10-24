import React, { useState, useEffect, useRef } from 'react';
import { WasteReport, UserProfile, ChatMessage, isDisposer, isAgent } from '../types';
import { CleanSpotStore } from '../services/storage';
import { getCollectorLevelInfo } from '../services/rating';
import { buildGoogleMapsWebUrl, openInExternalBrowser, openInGoogleMap } from '../services/mapLinks';
import { ClaimCountdownBadge } from './ClaimCountdownBadge';
import { CollectorRatingBadge } from './CollectorRatingBadge';
import { UserAvatar } from './UserAvatar';
import { getGeoapifyStaticMapUrl } from '../services/geoapify';
import {
  X,
  MapPin,
  Truck,
  Phone,
  Send,
  Lock,
  MessageSquare,
  AlertTriangle,
  Compass,
  Package,
  CheckCircle2,
  Star,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Clock,
  Trash2,
  RotateCcw,
} from 'lucide-react';
import { subscribeToChatMessages, sendChatMessageInFirestore } from '../services/firebaseService';

interface WasteDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: WasteReport | null;
  currentUser: UserProfile | null;
  onClaimWaste?: (report: WasteReport) => void;
  onOpenProofModal?: (report: WasteReport) => void;
  onUnclaimWaste?: (wasteId: string) => Promise<void> | void;
  onDeleteWaste?: (wasteId: string) => Promise<void> | void;
  onAcknowledgeCleanup?: (report: WasteReport) => Promise<void> | void;
}

export const WasteDetailsModal: React.FC<WasteDetailsModalProps> = ({
  isOpen,
  onClose,
  report,
  currentUser,
  onClaimWaste,
  onOpenProofModal,
  onUnclaimWaste,
  onDeleteWaste,
  onAcknowledgeCleanup,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  // Reporter Rating State
  const [ratingStars, setRatingStars] = useState(5);
  const [feedbackNote, setFeedbackNote] = useState('');
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [ratingSuccess, setRatingSuccess] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load chat messages and subscribe to updates
  useEffect(() => {
    if (!isOpen || !report) return;

    // Load initial local
    const initialMsgs = CleanSpotStore.getMessages(report.id);
    setMessages(initialMsgs);

    // Live subscription from Firestore chats/{wasteId}/messages
    const unsub = subscribeToChatMessages(report.id, (liveMsgs) => {
      if (liveMsgs && liveMsgs.length > 0) {
        setMessages(liveMsgs);
      }
    });

    const handleUpdate = () => {
      const msgs = CleanSpotStore.getMessages(report.id);
      if (msgs.length > 0) setMessages(msgs);
    };

    window.addEventListener('cleanspot_store_update', handleUpdate);
    return () => {
      unsub();
      window.removeEventListener('cleanspot_store_update', handleUpdate);
    };
  }, [isOpen, report?.id]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  if (!isOpen || !report) return null;

  // Determine current user participation
  const isReporter = currentUser?.id === report.reporterId;
  const isCollector = currentUser?.id === report.collectorId;
  const isParticipant = isReporter || isCollector;

  const isClaimed = report.status === 'claimed';
  const isCleaned = report.status === 'collected' || report.chatClosed;

  // Collector info and rating display
  const collectorStars = report.collectorRatingStars ?? 0;
  const collectorLevelInfo = getCollectorLevelInfo(collectorStars);


  // Handle Send Message
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !currentUser) return;

    setChatError(null);
    setIsSending(true);

    const messageText = inputText.trim();
    setInputText('');

    // Persist to Firestore sub-collection chats/{wasteId}/messages
    sendChatMessageInFirestore(report.id, {
      wasteId: report.id,
      reportId: report.id,
      senderId: currentUser.id,
      senderName: currentUser.name || 'User',
      senderRole: currentUser.role,
      senderAvatar: currentUser.avatarUrl,
      text: messageText,
    }).catch((err) => {
      console.warn('Firestore chat write notice:', err);
    });

    const result = CleanSpotStore.sendMessage(report.id, currentUser, messageText);
    setIsSending(false);

    if (!result.success) {
      setChatError(result.error || 'Failed to send message.');
    } else {
      setMessages(CleanSpotStore.getMessages(report.id));
    }
  };

  // Quick preset suggestions
  const handleSendQuickPrompt = (promptText: string) => {
    if (!currentUser) return;
    setInputText(promptText);
  };

  // Handle Reporter Confirming Cleaned Well
  const handleConfirmCleanedWell = () => {
    if (!currentUser || !isReporter) return;

    setIsSubmittingRating(true);
    const result = CleanSpotStore.confirmCleanedWell(
      report.id,
      currentUser,
      ratingStars,
      feedbackNote.trim() || 'Cleaned very well, verified thoroughly!'
    );
    setIsSubmittingRating(false);

    if (result.success) {
      setRatingSuccess(true);
      setTimeout(() => setRatingSuccess(false), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
              <MapPin className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs uppercase font-extrabold tracking-wider bg-white/20 px-2 py-0.5 rounded-full text-white">
                  Waste Spot Details
                </span>
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    report.status === 'pending'
                      ? 'bg-red-500 text-white shadow-xs'
                      : report.status === 'claimed'
                      ? 'bg-amber-400 text-gray-950 font-black shadow-xs'
                      : 'bg-emerald-400 text-gray-950 font-black shadow-xs'
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
              <h2 className="text-base sm:text-lg font-black truncate max-w-md sm:max-w-xl text-white">
                {report.address}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Split into Details & Private Chat */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-gray-200">
          {/* LEFT COLUMN: Report Details, Photos, Collector Rating Info (7 cols) */}
          <div className="lg:col-span-6 p-6 space-y-5 overflow-y-auto max-h-[580px] lg:max-h-none">
            {/* Main Waste Photo */}
            <div className="relative rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-gray-100 aspect-video max-h-56">
              <img
                src={report.photoUrl || report.imageUrl || 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600'}
                alt={report.wasteType}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 flex gap-1.5">
                <span className="text-[10px] font-bold bg-black/70 backdrop-blur-md text-white px-2 py-1 rounded-md">
                  Type: {report.wasteType}
                </span>
                <span className="text-[10px] font-bold bg-black/70 backdrop-blur-md text-white px-2 py-1 rounded-md">
                  Size: {report.size}
                </span>
                <span className="text-[10px] font-bold bg-black/70 backdrop-blur-md text-white px-2 py-1 rounded-md">
                  {report.lga} LGA
                </span>
              </div>
            </div>

            {/* Clean Proof Photo (if cleaned) */}
            {report.status === 'collected' && (report.proofPhoto || report.cleanPhoto) && (
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-emerald-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Clean Proof Verification ({report.collectedKg || 50} KG Recycled)
                  </span>
                  <span className="text-[10px] text-emerald-700 font-semibold">
                    Spot Cleaned
                  </span>
                </div>
                <div className="rounded-xl overflow-hidden border-2 border-emerald-400 aspect-video max-h-48">
                  <img
                    src={report.proofPhoto || report.cleanPhoto || 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600'}
                    alt="Proof of Clean"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

            {/* Description & Address */}
            <div className="space-y-2 text-left bg-gray-50/70 p-3.5 rounded-2xl border border-gray-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Location & Specific Description
              </h3>

              {/* REQUIREMENT 5: Structured Address Box */}
              <div className="bg-white p-3 rounded-xl border border-gray-200 text-xs text-gray-800 space-y-1">
                <div className="flex items-start gap-1">
                  <span className="text-gray-500 font-semibold min-w-[80px]">Postal Code:</span>
                  <span className="font-bold text-gray-900">{report.postalCode || 'N/A'}</span>
                </div>
                <div className="flex items-start gap-1">
                  <span className="text-gray-500 font-semibold min-w-[80px]">Street:</span>
                  <span className="font-bold text-gray-900">{report.roadStreet || report.address}</span>
                </div>
                <div className="flex items-start gap-1">
                  <span className="text-gray-500 font-semibold min-w-[80px]">LGA:</span>
                  <span className="font-bold text-emerald-800">{report.lga}</span>
                </div>
                {report.state && (
                  <div className="flex items-start gap-1">
                    <span className="text-gray-500 font-semibold min-w-[80px]">State:</span>
                    <span className="font-medium text-gray-700">{report.state}</span>
                  </div>
                )}
              </div>

              {/* Geoapify Map Preview */}
              <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-50 relative aspect-[2/1] max-h-40">
                <img
                  src={getGeoapifyStaticMapUrl(
                    report.latitude ?? report.lat ?? 4.65,
                    report.longitude ?? report.lng ?? 8.05,
                    15,
                    500,
                    250
                  )}
                  alt="Geoapify Map View"
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-2 left-2 text-[10px] font-bold bg-emerald-950/80 text-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
                  <MapPin className="w-3 h-3 text-emerald-400" />
                  Geoapify Satellite & Streets Map
                </span>
              </div>

              <p className="text-xs text-gray-600 bg-white p-2.5 rounded-xl border border-gray-200/80 leading-relaxed italic">
                "{report.description}"
              </p>

              {/* Open Location in Google Maps Button */}
              <div className="pt-1">
                <a
                  href={buildGoogleMapsWebUrl(report)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    e.preventDefault();
                    openInGoogleMap(report);
                  }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Open Location in Google Maps</span>
                </a>
              </div>
            </div>

            {/* Disposer / Reporter Profile Box */}
            <div className="p-3.5 bg-gray-50 dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 flex items-center justify-between text-left">
              <div className="flex items-center gap-3">
                <UserAvatar
                  photoUrl={report.disposerPhotoURL || report.photoURL || report.reporterAvatar}
                  name={report.disposerName || report.reporterName || 'Citizen Disposer'}
                  size="md"
                />
                <div>
                  <div className="text-[10px] font-bold text-gray-500 uppercase">Disposer</div>
                  <div className="text-xs font-bold text-gray-900 dark:text-white">{report.disposerName || report.reporterName}</div>
                </div>
              </div>

              {/* Disposer Phone: Only visible if claimed AND current user is the claimed collector */}
              {report.status === 'pending' ? (
                <div className="flex items-center gap-1 text-[11px] text-gray-500 bg-gray-100 dark:bg-slate-700 px-2.5 py-1 rounded-xl">
                  <Lock className="w-3 h-3 text-gray-400" />
                  <span>Claim to contact disposer</span>
                </div>
              ) : report.status === 'claimed' && currentUser?.id === (report.claimedBy || report.collectorId) && (report.disposerPhone || report.reporterPhone) ? (
                <a
                  href={`tel:${report.disposerPhone || report.reporterPhone}`}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm"
                >
                  <Phone className="w-3 h-3" />
                  <span>Call ({report.disposerPhone || report.reporterPhone})</span>
                </a>
              ) : (
                <div className="flex items-center gap-1 text-[11px] text-gray-500 bg-gray-100 dark:bg-slate-700 px-2.5 py-1 rounded-xl">
                  <Lock className="w-3 h-3 text-gray-400" />
                  <span>Contact Protected</span>
                </div>
              )}
            </div>

            {/* FEATURE 2: COLLECTOR PROFILE & STAR RATING BOX */}
            {report.collectorName ? (
              <div className="p-4 bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-slate-800 dark:to-emerald-950/40 rounded-2xl border border-teal-200 dark:border-emerald-800 text-left space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-800 dark:text-teal-300 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                    Assigned Waste Collector
                  </span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${collectorLevelInfo.badgeClass}`}>
                    {collectorLevelInfo.icon} {collectorLevelInfo.title}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <UserAvatar
                      photoUrl={report.collectorAvatar}
                      name={report.collectorName}
                      size="md"
                    />
                    <div>
                      <div className="text-xs font-black text-gray-900 dark:text-white">{report.collectorName}</div>
                      <CollectorRatingBadge
                        collectorName={report.collectorName}
                        ratingStars={collectorStars}
                        totalCleanedWastes={Math.round(collectorStars * 10)}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5">
                    {/* Collector Phone: Visible only if claimed and current user is the disposer */}
                    {report.status === 'claimed' && currentUser?.id === (report.disposerId || report.reporterId) && report.collectorPhone ? (
                      <a
                        href={`tel:${report.collectorPhone}`}
                        className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm"
                      >
                        <Phone className="w-3 h-3" />
                        <span>Call ({report.collectorPhone})</span>
                      </a>
                    ) : null}
                    {report.status === 'claimed' && (
                      <button
                        type="button"
                        onClick={() => {
                          CleanSpotStore.expireClaimForTesting(report.id);
                          onClose();
                        }}
                        className="text-[10px] font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-2 py-0.5 rounded-lg transition-colors cursor-pointer"
                        title="Simulate 72-hour expiration for testing auto-return"
                      >
                        Simulate 72h Expiry
                      </button>
                    )}
                  </div>
                </div>

                <div className="text-[11px] text-teal-900 dark:text-teal-200 bg-white/70 dark:bg-slate-800/80 p-2.5 rounded-xl border border-teal-100 dark:border-slate-700 flex items-center justify-between">
                  <span>Trust Badge: Verified free recycling collector</span>
                  <span className="font-bold text-teal-800 dark:text-teal-300">{collectorLevelInfo.summary}</span>
                </div>
              </div>
            ) : (
              <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-800 text-left text-xs text-amber-900 dark:text-amber-200 flex items-center gap-2">
                <Truck className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  No collector has claimed this waste spot yet. It is available for free pickup.
                </span>
              </div>
            )}

            {/* FEATURE 2: REPORTER CONFIRM CLEANED WELL & RATE COLLECTOR */}
            {report.status === 'collected' && (
              <div className="p-4 bg-emerald-50 rounded-2xl border-2 border-emerald-300 text-left space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    Reporter Quality Rating
                  </h4>
                  {report.reporterConfirmedClean ? (
                    <span className="text-[10px] font-black bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                      ✓ Confirmed Cleaned Well
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full">
                      Action Required
                    </span>
                  )}
                </div>

                {report.reporterConfirmedClean ? (
                  <div className="space-y-1.5 bg-white p-3 rounded-xl border border-emerald-200 text-xs">
                    <div className="flex items-center gap-1 text-amber-500 font-bold">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3.5 h-3.5 ${
                            star <= (report.reporterRatingStars || 5)
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className="text-gray-800 ml-1">
                        {report.reporterRatingStars || 5}.0★ Rated
                      </span>
                    </div>
                    <p className="text-gray-600 italic">
                      "{report.reporterRatingFeedback || 'Cleaned thoroughly!'}"
                    </p>
                    <p className="text-[10px] text-gray-400">
                      This verified cleanup counts toward {report.collectorName}'s star rating.
                    </p>
                  </div>
                ) : isReporter ? (
                  <div className="space-y-3 bg-white p-3.5 rounded-xl border border-emerald-200">
                    <p className="text-xs text-gray-700">
                      As the reporter, please confirm if <b>{report.collectorName}</b> cleaned this spot well.
                      Your confirmation directly awards him <b>collector stars</b>!
                    </p>

                    <div>
                      <div className="text-[11px] font-bold text-gray-600 mb-1">Select Star Rating:</div>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRatingStars(star)}
                            className="p-1 hover:scale-110 transition-transform"
                          >
                            <Star
                              className={`w-5 h-5 ${
                                star <= ratingStars
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          </button>
                        ))}
                        <span className="text-xs font-black text-amber-800 ml-2">
                          {ratingStars} of 5 Stars
                        </span>
                      </div>
                    </div>

                    <input
                      type="text"
                      value={feedbackNote}
                      onChange={(e) => setFeedbackNote(e.target.value)}
                      placeholder="Optional feedback: e.g. Spotless cleanup, thanks!"
                      className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />

                    <button
                      onClick={handleConfirmCleanedWell}
                      disabled={isSubmittingRating}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-95"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>{isSubmittingRating ? 'Confirming...' : 'Confirm Cleaned Well (+0.5★ Progress)'}</span>
                    </button>
                  </div>
                ) : (
                  <div className="text-xs text-gray-500 bg-white p-3 rounded-xl border border-gray-200">
                    Awaiting confirmation from Reporter ({report.reporterName}) to count toward the collector's star rating.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: FEATURE 1: PRIVATE CHAT BOX (6 cols) */}
          <div className="lg:col-span-6 flex flex-col bg-slate-50 min-h-[460px] max-h-[580px] lg:max-h-none">
            {/* Chat Box Header */}
            <div className="px-5 py-3.5 bg-white border-b border-gray-200 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-black text-xs sm:text-sm text-gray-900">
                      Private Coordination Chat
                    </h3>
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded">
                      Reporter ↔ Collector
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-500">
                    Warnings, directions & packing instructions
                  </p>
                </div>
              </div>

              {isCleaned && (
                <span className="text-[10px] font-black bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Closed
                </span>
              )}
            </div>

            {/* CHAT CONTENT */}
            {/* CASE 1: Waste is PENDING (Not claimed yet) */}
            {report.status === 'pending' ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-500 space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shadow-sm">
                  <Lock className="w-7 h-7" />
                </div>
                <h4 className="font-bold text-sm text-gray-800">
                  Chat Opens When Claimed
                </h4>
                <p className="text-xs text-gray-500 max-w-xs leading-relaxed">
                  The private chat box activates automatically once a waste collector claims this spot for pickup.
                </p>
                {isAgent(currentUser?.role) && (
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        if (onClaimWaste) onClaimWaste(report);
                      }}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5 active:scale-95"
                    >
                      <Truck className="w-4 h-4" />
                      <span>Claim this Waste to Open Chat</span>
                    </button>
                  </div>
                )}
              </div>
            ) : !isParticipant ? (
              /* CASE 2: User is neither the Reporter nor the Collector */
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-500 space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-gray-100 border border-gray-200 text-gray-400 flex items-center justify-center shadow-sm">
                  <Lock className="w-7 h-7" />
                </div>
                <h4 className="font-bold text-sm text-gray-800">
                  Confidential Private Chat
                </h4>
                <p className="text-xs text-gray-500 max-w-xs leading-relaxed">
                  This chat is strictly private and accessible only to Reporter <b>{report.reporterName}</b> and Collector <b>{report.collectorName}</b>.
                </p>
              </div>
            ) : (
              /* CASE 3: Authorized Participants (Reporter & Collector) */
              <div className="flex-1 flex flex-col min-h-0">
                {/* Status Notice */}
                {isCleaned ? (
                  <div className="px-4 py-2 bg-gray-200/80 border-b border-gray-300 text-[11px] text-gray-700 font-bold flex items-center justify-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-gray-500" />
                    <span>Chat closed automatically because this spot has been marked as Cleaned.</span>
                  </div>
                ) : (
                  <div className="px-4 py-1.5 bg-emerald-50 border-b border-emerald-100 text-[10px] text-emerald-800 flex items-center justify-between">
                    <span>Active private chat between Reporter & Collector</span>
                    <span className="font-bold">Instant Notifications</span>
                  </div>
                )}

                {/* Message List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 text-left">
                  {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-400 space-y-2">
                      <MessageSquare className="w-8 h-8 text-gray-300" />
                      <p className="text-xs">No messages sent yet.</p>
                      <p className="text-[11px] text-gray-400 max-w-xs">
                        Use this box to share gate directions, hazards, or packaging details.
                      </p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMe = msg.senderId === currentUser?.id;
                      return (
                        <div
                          key={msg.id}
                          className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}
                        >
                          {!isMe && (
                            <UserAvatar
                              photoUrl={msg.senderAvatar}
                              name={msg.senderName}
                              size="xs"
                              className="mb-1"
                            />
                          )}

                          <div className={`max-w-[82%] space-y-1`}>
                            <div className={`flex items-center gap-1.5 text-[10px] text-gray-400 ${isMe ? 'justify-end' : 'justify-start'}`}>
                              <span className="font-bold text-gray-600">
                                {isMe ? 'You' : msg.senderName}
                              </span>
                              <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded bg-gray-200 text-gray-700">
                                {msg.senderRole}
                              </span>
                              <span>
                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>

                            <div
                              className={`p-3 rounded-2xl text-xs leading-relaxed shadow-sm break-words ${
                                isMe
                                  ? 'bg-emerald-600 text-white rounded-br-xs'
                                  : 'bg-white text-gray-900 border border-gray-200 rounded-bl-xs'
                              }`}
                            >
                              {msg.text}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Prompts (Only if chat is still open) */}
                {!isCleaned && (
                  <div className="p-2.5 bg-white border-t border-gray-200 space-y-1.5 shrink-0">
                    <div className="text-[10px] font-bold text-gray-500 text-left flex items-center gap-1">
                      <span>Quick Info Chips:</span>
                    </div>
                    <div className="flex flex-wrap gap-1 text-[11px]">
                      <button
                        type="button"
                        onClick={() => handleSendQuickPrompt('⚠️ Warning: Waste is near gutter, be careful when packing')}
                        className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg font-medium transition-colors text-[10px]"
                      >
                        ⚠️ Near gutter warning
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSendQuickPrompt('📍 Direction: Come through back gate for easier parking')}
                        className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 rounded-lg font-medium transition-colors text-[10px]"
                      >
                        📍 Back gate direction
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSendQuickPrompt('📦 Packing: Waste is packed in 3 heavy-duty bags ready for pickup')}
                        className="px-2 py-1 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 rounded-lg font-medium transition-colors text-[10px]"
                      >
                        📦 Pre-bagged info
                      </button>
                    </div>

                    {/* Chat Input Bar */}
                    <form onSubmit={handleSendMessage} className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Type warning, directions, or question..."
                        className="flex-1 px-3.5 py-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white text-gray-900"
                      />
                      <button
                        type="submit"
                        disabled={isSending || !inputText.trim()}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1 active:scale-95"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Send</span>
                      </button>
                    </form>

                    {chatError && (
                      <p className="text-[11px] text-red-600 font-semibold">{chatError}</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-3.5 bg-gray-50 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={() => {
              const url = buildGoogleMapsWebUrl({
                lat: report.lat,
                lng: report.lng,
                postalCode: report.postalCode,
                address: report.address,
                lga: report.lga,
              });
              openInExternalBrowser(url);
            }}
            className="text-xs text-emerald-800 hover:text-emerald-950 font-bold flex items-center gap-1.5 bg-emerald-100 hover:bg-emerald-200 px-3 py-1.5 rounded-xl border border-emerald-300 transition-colors"
          >
            <Compass className="w-4 h-4 text-emerald-700" />
            <span>View Location / Directions in Chrome ↗</span>
          </button>

          <div className="flex flex-wrap items-center gap-2">
            {/* Recovery Agent Claim Action */}
            {isAgent(currentUser?.role) && report.status === 'pending' && (
              <button
                type="button"
                onClick={() => {
                  if (onClaimWaste) {
                    onClaimWaste(report);
                    onClose();
                  }
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
              >
                <Truck className="w-4 h-4" />
                <span>Claim this Waste (72h Timer)</span>
              </button>
            )}

            {/* Recovery Agent Unclaim Action */}
            {isAgent(currentUser?.role) &&
              report.status === 'claimed' &&
              (report.collectorId === currentUser?.id || report.claimedBy === currentUser?.id) && (
                <button
                  type="button"
                  onClick={async () => {
                    const confirmUnclaim = window.confirm(
                      'Release this waste spot back to pending? Other recovery agents will be able to claim it.'
                    );
                    if (confirmUnclaim) {
                      if (onUnclaimWaste) await onUnclaimWaste(report.id);
                      onClose();
                    }
                  }}
                  className="px-3 py-2 bg-gray-100 hover:bg-red-50 text-red-700 font-bold rounded-xl text-xs transition-colors flex items-center gap-1 cursor-pointer border border-gray-200"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Unclaim</span>
                </button>
              )}

            {/* Recovery Agent Proof Upload Action */}
            {isAgent(currentUser?.role) &&
              report.status === 'claimed' &&
              (report.collectorId === currentUser?.id || report.claimedBy === currentUser?.id) && (
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenProofModal) {
                      onOpenProofModal(report);
                      onClose();
                    }
                  }}
                  className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Upload Clean Proof Photo</span>
                </button>
              )}

            {/* Waste Disposer Confirm Cleanup Action */}
            {(isReporter || report.disposerId === currentUser?.id) &&
              (report.waitingAcknowledgement || (!report.acknowledgement && (report.cleanPhoto || report.proofPhoto))) &&
              report.status !== 'completed' && (
                <button
                  type="button"
                  onClick={async () => {
                    if (onAcknowledgeCleanup) await onAcknowledgeCleanup(report);
                    onClose();
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                  <span>Confirm Cleanup (Acknowledge)</span>
                </button>
              )}

            {/* Waste Disposer Delete Action */}
            {(isReporter || report.disposerId === currentUser?.id) && report.status !== 'completed' && (
              <button
                type="button"
                onClick={async () => {
                  const confirmDel = report.status === 'claimed'
                    ? window.confirm('This waste spot has already been claimed by a recovery agent. Are you sure you want to cancel and delete it?')
                    : window.confirm('Are you sure you want to delete this broadcasted waste report?');
                  if (confirmDel) {
                    if (onDeleteWaste) await onDeleteWaste(report.id);
                    onClose();
                  }
                }}
                className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-xl text-xs transition-colors flex items-center gap-1 cursor-pointer border border-red-200"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Waste</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
