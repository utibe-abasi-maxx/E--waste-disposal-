import React, { useState } from 'react';
import { UserProfile, UserRole } from '../types';
import { AKWA_IBOM_LGAS } from '../data/seedData';
import {
  Megaphone,
  Truck,
  Check,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Coins,
  MapPin,
  Phone,
  Recycle,
  CheckCircle2,
  Lock,
} from 'lucide-react';

interface RoleSelectionPageProps {
  currentUser: UserProfile;
  onRoleSelected: (role: UserRole, details?: { phone?: string; lga?: string }) => void;
}

export const RoleSelectionPage: React.FC<RoleSelectionPageProps> = ({
  currentUser,
  onRoleSelected,
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>(currentUser.role || 'reporter');
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [lga, setLga] = useState(currentUser.lga || 'Uyo (Capital City)');
  const [saving, setSaving] = useState(false);

  const handleConfirm = () => {
    setSaving(true);
    setTimeout(() => {
      onRoleSelected(selectedRole, {
        phone: phone.trim() || currentUser.phone || '+234 800 000 0000',
        lga: lga || currentUser.lga || 'Uyo (Capital City)',
      });
    }, 300);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-emerald-950 to-teal-950 flex flex-col justify-center items-center p-4 sm:p-6 md:p-8 relative overflow-hidden">
      {/* Background glowing ambient elements */}
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-2xl relative z-10">
        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-2xl border border-emerald-100/30 overflow-hidden">
          {/* Header banner */}
          <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 p-6 sm:p-8 text-white text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" /> Mandatory Step: Choose Your Role
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Welcome, {currentUser.name || currentUser.email}!
            </h1>
            <p className="text-emerald-100 text-sm mt-1.5 max-w-lg mx-auto">
              Please choose how you want to participate in CleanSpot Akwa Ibom. Your dashboard and tools will be customized for your role.
            </p>
          </div>

          {/* Role options container */}
          <div className="p-6 sm:p-8 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Option 1: Waste Reporter */}
              <div
                onClick={() => setSelectedRole('reporter')}
                className={`cursor-pointer rounded-2xl p-5 border-2 transition-all relative flex flex-col justify-between ${
                  selectedRole === 'reporter'
                    ? 'border-emerald-600 bg-emerald-50/70 shadow-lg ring-2 ring-emerald-500/30'
                    : 'border-gray-200 hover:border-emerald-300 hover:bg-gray-50/80'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider px-2 py-0.5 bg-emerald-100 rounded-md">
                      Citizen / Resident
                    </span>
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                        selectedRole === 'reporter'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'border-2 border-gray-300'
                      }`}
                    >
                      {selectedRole === 'reporter' && <Check className="w-4 h-4 stroke-[3]" />}
                    </div>
                  </div>

                  <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mb-3 shadow-md shadow-emerald-600/30">
                    <Megaphone className="w-6 h-6" />
                  </div>

                  <h3 className="text-lg font-black text-gray-900 leading-tight">
                    I am a Waste Reporter
                  </h3>
                  <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">
                    Snap dirty dumpsites or uncollected waste in your neighborhood across Akwa Ibom State.
                  </p>

                  <ul className="mt-4 space-y-2 text-xs text-gray-700">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Report roadside waste with photos & GPS</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Earn <b>Eco Points & badges</b> on leaderboard</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Get notified when collectors pick it up</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-4 pt-3 border-t border-emerald-100 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-800">
                  <Coins className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Opens Reporter Dashboard</span>
                </div>
              </div>

              {/* Option 2: Waste Collector */}
              <div
                onClick={() => setSelectedRole('collector')}
                className={`cursor-pointer rounded-2xl p-5 border-2 transition-all relative flex flex-col justify-between ${
                  selectedRole === 'collector'
                    ? 'border-teal-600 bg-teal-50/70 shadow-lg ring-2 ring-teal-500/30'
                    : 'border-gray-200 hover:border-teal-300 hover:bg-gray-50/80'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold text-teal-700 uppercase tracking-wider px-2 py-0.5 bg-teal-100 rounded-md">
                      Recycler / Aggregator
                    </span>
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                        selectedRole === 'collector'
                          ? 'bg-teal-700 text-white shadow-sm'
                          : 'border-2 border-gray-300'
                      }`}
                    >
                      {selectedRole === 'collector' && <Check className="w-4 h-4 stroke-[3]" />}
                    </div>
                  </div>

                  <div className="w-12 h-12 rounded-2xl bg-teal-700 text-white flex items-center justify-center mb-3 shadow-md shadow-teal-700/30">
                    <Truck className="w-6 h-6" />
                  </div>

                  <h3 className="text-lg font-black text-gray-900 leading-tight">
                    I am a Waste Collector
                  </h3>
                  <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">
                    Pick up plastic, scrap metal, cans, and cartons for <b>100% FREE</b> to recycle and make profit.
                  </p>

                  <ul className="mt-4 space-y-2 text-xs text-gray-700">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0" />
                      <span>Claim free recyclable waste across Akwa Ibom</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0" />
                      <span><b>Star Rating System:</b> Earn 0.5★ per 5 verified cleanings (up to 5.0★)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0" />
                      <span><b>Level Progression:</b> Unlock Medium & Huge jobs as your rating grows</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0" />
                      <span><b>Private Chat:</b> Get warnings & gate directions from reporters</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-4 pt-3 border-t border-teal-100 flex items-center gap-1.5 text-[11px] font-semibold text-teal-800">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
                  <span>Opens Collector Dashboard</span>
                </div>
              </div>
            </div>

            {/* Quick Location & Phone Info */}
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200/80 space-y-3">
              <div className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Akwa Ibom Location & Contact Info
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                    Primary Local Government Area (LGA)
                  </label>
                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <select
                      value={lga}
                      onChange={(e) => setLga(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                    >
                      {AKWA_IBOM_LGAS.map((l) => (
                        <option key={l} value={l}>
                          {l}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                    Phone Number (for pickup SMS alerts)
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+234 803 123 4567"
                      className="w-full pl-8 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Mandatory Action Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleConfirm}
                disabled={saving}
                className={`w-full py-3.5 px-6 font-bold rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 text-base active:scale-[0.99] text-white ${
                  selectedRole === 'reporter'
                    ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30'
                    : 'bg-teal-700 hover:bg-teal-800 shadow-teal-700/30'
                }`}
              >
                {saving ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>
                      {selectedRole === 'reporter'
                        ? 'Confirm Role & Open Reporter Dashboard'
                        : 'Confirm Role & Open Collector Dashboard'}
                    </span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
              <p className="text-center text-[11px] text-gray-400 mt-2">
                You can easily switch roles at any time from your profile in the app header.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
