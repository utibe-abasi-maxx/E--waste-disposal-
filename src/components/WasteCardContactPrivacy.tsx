import React from 'react';
import { WasteReport } from '../types';
import { Lock, Phone, MessageSquare } from 'lucide-react';

interface WasteCardContactPrivacyProps {
  report: WasteReport;
  currentUserId: string;
  onOpenChat?: (report: WasteReport) => void;
}

export const WasteCardContactPrivacy: React.FC<WasteCardContactPrivacyProps> = ({
  report,
  currentUserId,
  onOpenChat,
}) => {
  const claimedBy = report.claimedBy || report.collectorId;
  const disposerId = report.disposerId || report.reporterId;

  // 1. Pending: Show NO phone, NO chat. Show message "Claim this waste to contact disposer"
  if (report.status === 'pending') {
    return (
      <div className="my-2 p-2.5 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 text-xs text-gray-600 dark:text-gray-300 flex items-center gap-2">
        <Lock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
        <span className="italic font-medium">Claim this waste to contact disposer</span>
      </div>
    );
  }

  // 2. Claimed and current user is the collector who claimed it
  if (report.status === 'claimed' && currentUserId === claimedBy) {
    const phone = report.disposerPhone || report.reporterPhone;
    return (
      <div className="my-2 p-2.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center justify-between gap-2">
        <div className="text-xs text-left min-w-0">
          <div className="text-[10px] uppercase font-bold text-gray-500">Disposer Contact:</div>
          <div className="font-extrabold text-emerald-900 dark:text-emerald-200 truncate">
            {phone || 'No phone provided'}
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {phone && (
            <a
              href={`tel:${phone}`}
              onClick={(e) => e.stopPropagation()}
              className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm"
            >
              <Phone className="w-3 h-3" />
              <span>Call</span>
            </a>
          )}
          {onOpenChat && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenChat(report);
              }}
              className="px-2.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm cursor-pointer"
            >
              <MessageSquare className="w-3 h-3" />
              <span>Chat</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  // 3. Claimed and current user is the disposer who reported it
  if (report.status === 'claimed' && currentUserId === disposerId) {
    const phone = report.collectorPhone;
    return (
      <div className="my-2 p-2.5 bg-teal-50 dark:bg-teal-950/40 rounded-xl border border-teal-200 dark:border-teal-800 flex items-center justify-between gap-2">
        <div className="text-xs text-left min-w-0">
          <div className="text-[10px] uppercase font-bold text-gray-500">Recovery Agent Contact:</div>
          <div className="font-extrabold text-teal-900 dark:text-teal-200 truncate">
            {report.collectorName || 'Assigned Collector'} {phone ? `(${phone})` : ''}
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {phone && (
            <a
              href={`tel:${phone}`}
              onClick={(e) => e.stopPropagation()}
              className="px-2.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm"
            >
              <Phone className="w-3 h-3" />
              <span>Call</span>
            </a>
          )}
          {onOpenChat && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenChat(report);
              }}
              className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm cursor-pointer"
            >
              <MessageSquare className="w-3 h-3" />
              <span>Chat</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  // 4. Else: show NO phone, NO chat
  return null;
};
