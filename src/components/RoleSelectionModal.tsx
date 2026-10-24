import React, { useState } from 'react';
import { UserRole } from '../types';
import { Megaphone, Truck, Check, ArrowRight, ShieldCheck, Sparkles, Coins } from 'lucide-react';

interface RoleSelectionModalProps {
  isOpen: boolean;
  onSelectRole: (role: UserRole) => void;
  currentRole?: UserRole;
}

export const RoleSelectionModal: React.FC<RoleSelectionModalProps> = ({
  isOpen,
  onSelectRole,
  currentRole,
}) => {
  const [selected, setSelected] = useState<UserRole>(currentRole || 'reporter');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-emerald-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-700 p-6 text-white text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Step 1 of 2: Select Your Journey
          </div>
          <h2 className="text-2xl font-black tracking-tight">How will you participate in CleanSpot Akwa Ibom?</h2>
          <p className="text-emerald-100 text-sm mt-1 max-w-md mx-auto">
            Choose your primary role in cleaning up Akwa Ibom State. You can always switch or collaborate.
          </p>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 space-y-4">
          {/* Option A: Waste Disposer */}
          <div
            onClick={() => setSelected('disposer')}
            className={`cursor-pointer rounded-2xl p-5 border-2 transition-all relative flex flex-col md:flex-row gap-4 items-start ${
              selected === 'disposer' || selected === 'reporter'
                ? 'border-emerald-600 bg-emerald-50/70 shadow-md ring-2 ring-emerald-500/20'
                : 'border-gray-200 hover:border-emerald-300 hover:bg-gray-50'
            }`}
          >
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                selected === 'disposer' || selected === 'reporter' ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              <Megaphone className="w-7 h-7" />
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                  Option 1
                </span>
                {(selected === 'disposer' || selected === 'reporter') && (
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                )}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mt-0.5">
                Waste Disposer
              </h3>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                For citizens, households, students, and businesses. Safely dispose or report electronic waste for certified recovery and pickup.
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-emerald-100/80 text-emerald-800 px-2.5 py-1 rounded-lg">
                  <Coins className="w-3 h-3" /> Earn Eco Points
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-emerald-100/80 text-emerald-800 px-2.5 py-1 rounded-lg">
                  🔔 Real-Time Pickup Alerts
                </span>
              </div>
            </div>
          </div>

          {/* Option B: Recovery Agent */}
          <div
            onClick={() => setSelected('agent')}
            className={`cursor-pointer rounded-2xl p-5 border-2 transition-all relative flex flex-col md:flex-row gap-4 items-start ${
              selected === 'agent' || selected === 'collector'
                ? 'border-teal-600 bg-teal-50/70 shadow-md ring-2 ring-teal-500/20'
                : 'border-gray-200 hover:border-teal-300 hover:bg-gray-50'
            }`}
          >
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                selected === 'agent' || selected === 'collector' ? 'bg-teal-700 text-white' : 'bg-teal-100 text-teal-800'
              }`}
            >
              <Truck className="w-7 h-7" />
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">
                  Option 2
                </span>
                {(selected === 'agent' || selected === 'collector') && (
                  <span className="w-5 h-5 rounded-full bg-teal-700 text-white flex items-center justify-center">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                )}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mt-0.5">
                Recovery Agent
              </h3>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                For recyclers, aggregators, and recovery operators. Claim verified citizen disposal spots, process e-waste, and log recycling tonnage.
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-teal-100 text-teal-900 px-2.5 py-1 rounded-lg">
                  <ShieldCheck className="w-3 h-3" /> Verified Recovery Agent
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-teal-100 text-teal-900 px-2.5 py-1 rounded-lg">
                  ♻️ Authorized Processing
                </span>
              </div>
            </div>
          </div>

          {/* Action button */}
          <div className="pt-2">
            <button
              onClick={() => onSelectRole(selected)}
              className="w-full py-3.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 text-base active:scale-[0.99]"
            >
              <span>Continue as {selected === 'agent' || selected === 'collector' ? 'Recovery Agent' : 'Waste Disposer'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
