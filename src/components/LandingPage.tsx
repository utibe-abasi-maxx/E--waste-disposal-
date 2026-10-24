import React from 'react';
import { UserProfile, UserRole } from '../types';
import {
  Camera,
  MapPin,
  Truck,
  Recycle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Award,
  Users,
  TreePine,
  DollarSign,
  Flame,
} from 'lucide-react';

interface LandingPageProps {
  currentUser: UserProfile | null;
  onStartAction: (role: UserRole) => void;
  onExploreMap: () => void;
  stats: {
    totalReports: number;
    totalCleaned: number;
    totalKg: number;
    activeCollectors: number;
  };
}

export const LandingPage: React.FC<LandingPageProps> = ({
  currentUser,
  onStartAction,
  onExploreMap,
  stats,
}) => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32 bg-gradient-to-b from-emerald-50/70 via-white to-emerald-50/30">
        {/* Decorative background blobs */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-r from-emerald-200/40 via-green-300/30 to-teal-200/40 blur-3xl -z-10 rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-6 border border-emerald-200 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            <span>Clean Community Initiative • Akwa Ibom State</span>
            <span className="text-emerald-600 font-normal">|</span>
            <span className="text-emerald-900">100% Free Pickups</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-gray-950 tracking-tight leading-[1.1] max-w-4xl mx-auto">
            See Waste? Snap it. <br className="hidden sm:inline" />
            Map it.{' '}
            <span className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-700 bg-clip-text text-transparent">
              Clean Akwa Ibom Together.
            </span>
          </h1>

          {/* Subheadline */}
          <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto font-normal leading-relaxed">
            Report dirty spots in your street. Local collectors pick it for free and recycle it.
          </p>

          {/* Dual CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onStartAction('reporter')}
              className="w-full sm:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-base rounded-2xl shadow-xl shadow-emerald-600/30 hover:shadow-emerald-600/40 transition-all flex items-center justify-center gap-3 active:scale-[0.98] group"
            >
              <Camera className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              <span>Report Waste Now</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            <button
              onClick={() => onStartAction('collector')}
              className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-gray-50 text-gray-900 border-2 border-emerald-600/30 hover:border-emerald-600 font-bold text-base rounded-2xl shadow-md transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
            >
              <Truck className="w-5 h-5 text-emerald-600" />
              <span>Become a Collector</span>
              <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-full">
                Free Materials
              </span>
            </button>
          </div>

          {/* Secondary reassurance */}
          <div className="mt-5 flex items-center justify-center gap-6 text-xs text-gray-500 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> No cost for citizens
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Real Satellite & Street Map
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Centered in Afaha Eket
            </span>
          </div>

          {/* Live Impact Counters Bar */}
          <div className="mt-14 max-w-5xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4 p-4 sm:p-6 bg-white rounded-3xl shadow-xl border border-emerald-100/80">
            <div className="p-4 rounded-2xl bg-emerald-50/50 text-center">
              <div className="text-3xl sm:text-4xl font-black text-emerald-700">
                {stats.totalReports.toLocaleString()}+
              </div>
              <div className="text-xs font-bold text-gray-600 uppercase tracking-wider mt-1">
                Dumps Reported
              </div>
              <div className="text-[11px] text-emerald-600 mt-0.5">Across Akwa Ibom State</div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/50 text-center">
              <div className="text-3xl sm:text-4xl font-black text-emerald-700">
                {stats.totalCleaned.toLocaleString()}+
              </div>
              <div className="text-xs font-bold text-gray-600 uppercase tracking-wider mt-1">
                Spots Cleaned
              </div>
              <div className="text-[11px] text-emerald-600 mt-0.5">Verified before & after</div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/50 text-center">
              <div className="text-3xl sm:text-4xl font-black text-emerald-700">
                {(stats.totalKg / 1000).toFixed(1)} Tons
              </div>
              <div className="text-xs font-bold text-gray-600 uppercase tracking-wider mt-1">
                Waste Recycled
              </div>
              <div className="text-[11px] text-emerald-600 mt-0.5">Plastics, metals, paper</div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/50 text-center">
              <div className="text-3xl sm:text-4xl font-black text-emerald-700">
                {stats.activeCollectors}+
              </div>
              <div className="text-xs font-bold text-gray-600 uppercase tracking-wider mt-1">
                Active Collectors
              </div>
              <div className="text-[11px] text-emerald-600 mt-0.5">Free local pickup fleet</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 md:py-24 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
              Simple 3-Step Solution
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mt-3">
              How CleanSpot Akwa Ibom Works
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mt-2">
              Connecting residents in Eket, Uyo, and across Akwa Ibom with local recyclers who need valuable materials.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="relative bg-emerald-50/40 rounded-3xl p-8 border border-emerald-100 text-left hover:shadow-md transition-shadow">
              <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-xl mb-6 shadow-md shadow-emerald-600/30">
                1
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Snap & Map Waste</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Take a quick photo of an illegal dump or plastic pile on your street. Our system auto-detects GPS coordinates centered in Eket and Akwa Ibom.
              </p>
              <div className="mt-4 pt-4 border-t border-emerald-100/60 flex items-center gap-2 text-xs font-bold text-emerald-800">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                Citizen earns +50 Eco Points
              </div>
            </div>

            <div className="relative bg-teal-50/40 rounded-3xl p-8 border border-teal-100 text-left hover:shadow-md transition-shadow">
              <div className="w-14 h-14 rounded-2xl bg-teal-700 text-white flex items-center justify-center font-black text-xl mb-6 shadow-md shadow-teal-700/30">
                2
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Collector Claims Free</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Local waste collectors view live alerts on the satellite & street map. They claim spots nearby and pick up valuable plastic, metals, and scrap for <b>zero cost</b>.
              </p>
              <div className="mt-4 pt-4 border-t border-teal-100/60 flex items-center gap-2 text-xs font-bold text-teal-800">
                <Truck className="w-4 h-4 text-teal-600" />
                Free raw materials for recyclers
              </div>
            </div>

            <div className="relative bg-green-50/40 rounded-3xl p-8 border border-green-100 text-left hover:shadow-md transition-shadow">
              <div className="w-14 h-14 rounded-2xl bg-green-600 text-white flex items-center justify-center font-black text-xl mb-6 shadow-md shadow-green-600/30">
                3
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Clean Akwa Ibom Together</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Collector uploads verified clean proof photo and weight in KG. The spot changes to "Cleaned" on the public map, and the citizen receives a celebratory notification!
              </p>
              <div className="mt-4 pt-4 border-t border-green-100/60 flex items-center gap-2 text-xs font-bold text-green-800">
                <Award className="w-4 h-4 text-green-600" />
                Leaderboard ranking & badges
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recyclable Waste Types Section */}
      <section className="py-16 bg-emerald-950 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-400 bg-emerald-900/60 px-3 py-1 rounded-full">
              Circular Economy in Akwa Ibom
            </span>
            <h2 className="text-3xl sm:text-4xl font-black mt-3">
              Valuable Waste We Recycle For Free
            </h2>
            <p className="text-sm text-emerald-200/80 mt-2">
              Collectors pick up these materials freely and deliver to recycling depots across Eket, Uyo, and regional hubs.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center hover:bg-white/10 transition-colors">
              <span className="text-3xl block mb-2">🍾</span>
              <h4 className="font-bold text-sm">Plastics & Bottles</h4>
              <p className="text-xs text-emerald-200/70 mt-1">PET bottles, sachet water bags, PVC drums</p>
              <span className="inline-block mt-3 text-[10px] font-bold text-emerald-400 bg-emerald-900/80 px-2 py-0.5 rounded-full">
                High Demand
              </span>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center hover:bg-white/10 transition-colors">
              <span className="text-3xl block mb-2">🔩</span>
              <h4 className="font-bold text-sm">Scrap Metals</h4>
              <p className="text-xs text-emerald-200/70 mt-1">Aluminum drink cans, roofing sheets, iron parts</p>
              <span className="inline-block mt-3 text-[10px] font-bold text-amber-400 bg-amber-900/40 px-2 py-0.5 rounded-full">
                Valuable Scrap
              </span>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center hover:bg-white/10 transition-colors">
              <span className="text-3xl block mb-2">📦</span>
              <h4 className="font-bold text-sm">Cartons & Papers</h4>
              <p className="text-xs text-emerald-200/70 mt-1">Cardboard packing boxes, newsprint, office waste</p>
              <span className="inline-block mt-3 text-[10px] font-bold text-emerald-400 bg-emerald-900/80 px-2 py-0.5 rounded-full">
                Pulp Mills
              </span>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center hover:bg-white/10 transition-colors">
              <span className="text-3xl block mb-2">🥬</span>
              <h4 className="font-bold text-sm">Organic / Market</h4>
              <p className="text-xs text-emerald-200/70 mt-1">Market vegetable residue, compostable organic bags</p>
              <span className="inline-block mt-3 text-[10px] font-bold text-green-400 bg-green-900/40 px-2 py-0.5 rounded-full">
                Akwa Ibom Farms
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Explore Map CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-white to-emerald-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-emerald-600 rounded-3xl p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-black">
                Explore Waste Spots Near Afaha Eket
              </h2>
              <p className="text-emerald-100 text-sm sm:text-base mt-2 max-w-xl mx-auto">
                Check Government Secondary School Afaha Eket, Grace Bill Road, Marina Road Market, and Uyo Plaza. Switch between Street and Satellite view anytime.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={onExploreMap}
                  className="px-6 py-3.5 bg-white text-emerald-900 font-bold rounded-2xl hover:bg-emerald-50 transition-all shadow-md text-sm flex items-center gap-2"
                >
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <span>Open Interactive Map (Satellite / Street)</span>
                </button>
                <button
                  onClick={() => onStartAction('reporter')}
                  className="px-6 py-3.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-2xl transition-all border border-emerald-500 text-sm flex items-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  <span>Report Spot Near You</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
