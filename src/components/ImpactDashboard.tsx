import React from 'react';
import { WasteReport } from '../types';
import {
  BarChart3,
  TreePine,
  CloudFog,
  Coins,
  CheckCircle2,
  Recycle,
  Sparkles,
  MapPin,
  Truck,
  HeartHandshake,
} from 'lucide-react';

interface ImpactDashboardProps {
  reports: WasteReport[];
  stats: {
    totalReports: number;
    totalCleaned: number;
    totalKg: number;
    activeCollectors: number;
  };
  onExploreMap: () => void;
}

export const ImpactDashboard: React.FC<ImpactDashboardProps> = ({
  reports,
  stats,
  onExploreMap,
}) => {
  // Ecological calculations
  const totalKg = stats.totalKg;
  const co2PreventedKg = Math.round(totalKg * 1.8); // standard circular economy factor
  const treesEquivalent = Math.round(co2PreventedKg / 22); // average tree absorbs ~22kg co2/yr
  const cleanRate = Math.round((stats.totalCleaned / stats.totalReports) * 100);

  const cleanedSpots = reports.filter((r) => r.status === 'collected');

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 text-left">
      {/* Top Banner */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
          <BarChart3 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Akwa Ibom State Environmental Health Tally</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
          Clean Akwa Ibom Real-Time Impact
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mt-2">
          When citizens map trash and collectors pick it for free, our gutters remain clear, flooding decreases, and local recyclers thrive.
        </p>
      </div>

      {/* Hero Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-emerald-50 to-green-100/60 p-6 rounded-3xl border border-emerald-200 shadow-sm text-left">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-3">
            <Recycle className="w-5 h-5" />
          </div>
          <div className="text-3xl sm:text-4xl font-black text-emerald-950">
            {(totalKg / 1000).toFixed(1)} <span className="text-lg font-bold">Tons</span>
          </div>
          <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider mt-1">
            Total Recycled Material
          </div>
          <p className="text-[11px] text-emerald-700/80 mt-1">Plastics, aluminum cans, & scrap</p>
        </div>

        <div className="bg-gradient-to-br from-teal-50 to-teal-100/60 p-6 rounded-3xl border border-teal-200 shadow-sm text-left">
          <div className="w-10 h-10 rounded-xl bg-teal-700 text-white flex items-center justify-center mb-3">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="text-3xl sm:text-4xl font-black text-teal-950">
            {stats.totalCleaned.toLocaleString()}
          </div>
          <div className="text-xs font-bold text-teal-800 uppercase tracking-wider mt-1">
            Illegal Dumps Cleaned
          </div>
          <p className="text-[11px] text-teal-700/80 mt-1">{cleanRate}% cleanup resolution rate</p>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100/60 p-6 rounded-3xl border border-amber-200 shadow-sm text-left">
          <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center mb-3">
            <CloudFog className="w-5 h-5" />
          </div>
          <div className="text-3xl sm:text-4xl font-black text-amber-950">
            {(co2PreventedKg / 1000).toFixed(1)} <span className="text-lg font-bold">Tons</span>
          </div>
          <div className="text-xs font-bold text-amber-800 uppercase tracking-wider mt-1">
            CO₂ Emissions Mitigated
          </div>
          <p className="text-[11px] text-amber-700/80 mt-1">Prevented open-air burning in streets</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-100/60 p-6 rounded-3xl border border-green-200 shadow-sm text-left">
          <div className="w-10 h-10 rounded-xl bg-green-700 text-white flex items-center justify-center mb-3">
            <TreePine className="w-5 h-5" />
          </div>
          <div className="text-3xl sm:text-4xl font-black text-green-950">
            {treesEquivalent.toLocaleString()}
          </div>
          <div className="text-xs font-bold text-green-800 uppercase tracking-wider mt-1">
            Equivalent Trees Saved
          </div>
          <p className="text-[11px] text-green-700/80 mt-1">Based on global carbon offsets</p>
        </div>
      </div>

      {/* Before & After Community Cleanups */}
      <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Verified Before & After Transformations
            </h2>
            <p className="text-xs text-gray-500">
              Every cleanup in E-Waste Disposal - Akwa Ibom State requires photographic proof and weight verification.
            </p>
          </div>
          <button
            onClick={onExploreMap}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            <MapPin className="w-3.5 h-3.5" /> View on Map ↗
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1 */}
          <div className="border border-gray-200 rounded-3xl p-4 bg-gray-50/50 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="relative rounded-2xl overflow-hidden h-36">
                <span className="absolute top-2 left-2 bg-red-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10">
                  Before: Dump
                </span>
                <img
                  src="https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600"
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="relative rounded-2xl overflow-hidden h-36 border-2 border-emerald-500">
                <span className="absolute top-2 left-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10">
                  After: Cleaned!
                </span>
                <img
                  src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600"
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                  180 KG Recycled
                </span>
                <span className="text-[11px] text-gray-400">Afaha Eket Axis</span>
              </div>
              <h4 className="font-bold text-xs text-gray-900 mt-2">
                Near Government Secondary School, Afaha Eket
              </h4>
              <p className="text-[11px] text-gray-600 mt-0.5">
                Reported by citizen Emem Bassey. Collected & sorted by Aniekan Udoh for free.
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="border border-gray-200 rounded-3xl p-4 bg-gray-50/50 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="relative rounded-2xl overflow-hidden h-36">
                <span className="absolute top-2 left-2 bg-red-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10">
                  Before: Plastic Gutter
                </span>
                <img
                  src="https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=600"
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="relative rounded-2xl overflow-hidden h-36 border-2 border-emerald-500">
                <span className="absolute top-2 left-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10">
                  After: Cleared & Bagged
                </span>
                <img
                  src="https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=600"
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                  240 KG Recycled
                </span>
                <span className="text-[11px] text-gray-400">Ibom Plaza, Uyo</span>
              </div>
              <h4 className="font-bold text-xs text-gray-900 mt-2">
                Commercial drainage perimeter, Uyo
              </h4>
              <p className="text-[11px] text-gray-600 mt-0.5">
                Plastic bottles & cans reclaimed for PET baling plant. Water flows cleanly.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Zero Cost Philosophy Section */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-wider">
            <HeartHandshake className="w-3.5 h-3.5" /> 100% Free Service Model
          </div>
          <h3 className="text-2xl font-black">Why Are All Pickups 100% Free?</h3>
          <p className="text-emerald-100 text-xs sm:text-sm leading-relaxed">
            Waste is not trash — it is currency. Local collectors pick it up freely from residents because they monetize the gathered plastic and scrap metals directly at Akwa Ibom recycling depots and manufacturing plants.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/20 text-center shrink-0 w-full md:w-auto">
          <div className="text-3xl font-black text-amber-300">₦0.00</div>
          <div className="text-xs font-bold text-white uppercase mt-0.5">Cost to Akwa Ibom Citizens</div>
          <div className="text-[11px] text-emerald-200 mt-1">Guaranteed always free</div>
        </div>
      </div>
    </div>
  );
};
