import React from 'react';
import {
  Recycle,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Truck,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  PhoneCall,
  Clock,
  HeartHandshake,
  Layers,
  Leaf,
  PlusCircle,
  Award,
} from 'lucide-react';
import { Footer } from './Footer';

interface WasteEducationProps {
  onStartDashboard: () => void;
  onPostWaste?: () => void;
  onBack?: () => void;
  isAfterSignup?: boolean;
}

export const WasteEducation: React.FC<WasteEducationProps> = ({
  onStartDashboard,
  onPostWaste,
  onBack,
  isAfterSignup = false,
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-emerald-950 to-slate-950 text-gray-100 py-8 sm:py-12 px-4 sm:px-6 lg:px-8 font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Welcome Banner after Signup */}
        {isAfterSignup && (
          <div className="bg-emerald-600/20 border-2 border-emerald-500/40 rounded-3xl p-5 sm:p-6 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/30">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div className="text-left">
                <span className="text-[11px] font-black uppercase tracking-widest text-emerald-300 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-700">
                  Enrollment Successful
                </span>
                <h3 className="text-lg font-black text-white mt-0.5">
                  Welcome to E-Waste Disposal - Akwa Ibom State!
                </h3>
                <p className="text-xs text-gray-300">
                  Please take 2 minutes to review our waste education and how the website works before entering your dashboard.
                </p>
              </div>
            </div>
            <button
              onClick={onStartDashboard}
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl transition-all shadow-md active:scale-95 shrink-0 flex items-center gap-1.5 cursor-pointer"
            >
              <span>Skip to Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Main Document Card */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-10 text-gray-900 shadow-2xl border border-emerald-500/20 space-y-8 text-left">
          {/* Header */}
          <div className="border-b border-gray-200 pb-6 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-black uppercase tracking-wider mb-3">
              <Leaf className="w-3.5 h-3.5 text-emerald-700" />
              <span>Environmental Enlightenment & Guide</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tight leading-tight">
              Understanding Waste: A Guide to a Cleaner Akwa Ibom
            </h1>
            <p className="text-sm sm:text-base text-gray-600 font-medium mt-2 leading-relaxed">
              At <strong className="text-emerald-800">E-Waste Disposal</strong>, we believe that a clean environment starts with understanding waste.
            </p>
          </div>

          {/* Section 1 */}
          <section className="space-y-2">
            <h2 className="text-lg sm:text-xl font-black text-emerald-900 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 text-sm flex items-center justify-center font-black shrink-0">
                1
              </span>
              <span>What is Waste / Trash?</span>
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed pl-9">
              Waste, also called trash or rubbish, is any material that we have used and no longer need. When we finish using something and throw it away, it becomes waste. If we throw waste anywhere, it causes pollution, blocks our drainages and makes our communities dirty and unhealthy.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-black text-emerald-900 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 text-sm flex items-center justify-center font-black shrink-0">
                2
              </span>
              <span>Types of Waste We Generate Everyday</span>
            </h2>
            <p className="text-sm text-gray-600 font-semibold pl-9">
              There are 5 main types:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-0 sm:pl-9 mt-2">
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl">
                <span className="font-black text-xs text-emerald-950 uppercase tracking-wide block">
                  a) General Household Waste
                </span>
                <p className="text-xs text-gray-700 mt-1">Food remnants, old clothes, papers.</p>
              </div>

              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl">
                <span className="font-black text-xs text-emerald-950 uppercase tracking-wide block">
                  b) Plastic and Nylon Waste
                </span>
                <p className="text-xs text-gray-700 mt-1">Pure water sachets, plastic bottles, plastic chairs, shopping bags.</p>
              </div>

              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl">
                <span className="font-black text-xs text-emerald-950 uppercase tracking-wide block">
                  c) Metal and Glass Waste
                </span>
                <p className="text-xs text-gray-700 mt-1">Canned drinks, tin tomato cans, old pots, broken bottles.</p>
              </div>

              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl">
                <span className="font-black text-xs text-emerald-950 uppercase tracking-wide block">
                  d) Electronic Waste (E-Waste)
                </span>
                <p className="text-xs text-gray-700 mt-1">Old phones, chargers, batteries, TVs, laptops.</p>
              </div>

              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl sm:col-span-2">
                <span className="font-black text-xs text-red-900 uppercase tracking-wide flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>e) Hazardous Waste</span>
                </span>
                <p className="text-xs text-red-800 mt-1">
                  This is very dangerous waste like old batteries, chemical containers, hospital waste, used engine oil, and insecticide cans.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-black text-emerald-900 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 text-sm flex items-center justify-center font-black shrink-0">
                3
              </span>
              <span>Clear Categories: What Can Be Recycled and What Should Be Disposed?</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-0 sm:pl-9">
              {/* Recyclables */}
              <div className="p-5 bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-300 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-emerald-900 font-black text-sm">
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>WASTE THAT CAN BE RECYCLED</span>
                </div>
                <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-wide">
                  Keep it separately:
                </p>
                <ul className="text-xs text-gray-700 space-y-1.5 pt-1">
                  <li><strong>• Plastics:</strong> PET bottles (Coca-Cola, water bottles), plastic containers, bottle covers.</li>
                  <li><strong>• Metals / Cans:</strong> Tin milk cans, sardine cans, soft drink cans, scrap iron.</li>
                  <li><strong>• Paper and Cardboard:</strong> Old newspapers, cartons, exercise books, office papers.</li>
                  <li><strong>• Glass:</strong> Beer bottles, mayonnaise bottles.</li>
                </ul>
              </div>

              {/* Disposed Properly */}
              <div className="p-5 bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-amber-950 font-black text-sm">
                  <Trash2 className="w-5 h-5 text-amber-600 shrink-0" />
                  <span>WASTE THAT SHOULD BE DISPOSED PROPERLY:</span>
                </div>
                <p className="text-[11px] font-bold text-amber-800 uppercase tracking-wide">
                  Careful handling:
                </p>
                <ul className="text-xs text-gray-700 space-y-1.5 pt-1">
                  <li><strong>• Food waste</strong> and organic waste.</li>
                  <li><strong>• Nylon and dirty pure water sachets</strong> that cannot be recycled easily.</li>
                  <li><strong>• Hazardous waste:</strong> MUST NEVER be handled by you at home.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-black text-emerald-900 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 text-sm flex items-center justify-center font-black shrink-0">
                4
              </span>
              <span>Proper Waste Disposal Method For Each Type & How E-Waste Disposal Works</span>
            </h2>
            <div className="pl-0 sm:pl-9 space-y-2.5 text-xs sm:text-sm text-gray-700 leading-relaxed">
              <p>
                <strong>For Recyclables (Plastics, Cans, Paper):</strong> Package it well and give it to a recovery agent for proper disposal and recycling.
              </p>
              <p>
                <strong>For General Household Waste:</strong> Put it in a covered dustbin and wait for the waste collection truck or dispose at the approved dumpsite in your LGA.
              </p>
              <p>
                <strong>For E-Waste:</strong> Never burn it. Keep old phones, batteries, wires in a box.
              </p>
              <p>
                <strong>For Hazardous Waste:</strong> You cannot burn it or pour it away. Used oil, batteries, chemicals, and medical waste must be taken to a designated hazardous waste site approved by AKSEPWMA.
              </p>
            </div>

            {/* IMPORTANT BUSINESS LOGIC IN A HIGHLIGHT BOX */}
            <div className="pl-0 sm:pl-9 pt-2">
              <div className="p-6 bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 text-white rounded-3xl border-2 border-emerald-400 shadow-xl relative overflow-hidden">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-emerald-300 shrink-0" />
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-300">
                    Important Business Notice
                  </span>
                </div>
                <p className="text-xs sm:text-sm leading-relaxed text-emerald-50">
                  <strong>E-Waste Disposal is not buying your waste.</strong> We are a website that connects you to recovery agents. If you have any waste at home, in your office, or in your shop, just place an order on the E-Waste Disposal website. Post your waste, include your location in Akwa Ibom, and a verified recovery agent close to you will come to your venue and pick up the waste for recycling or proper disposal. In a snap, we are at your service!
                </p>
                <div className="mt-4 pt-3 border-t border-emerald-700/60 flex items-center gap-2 text-xs font-bold text-emerald-200">
                  <span>💡 Our Advice:</span>
                  <span className="text-white">Keep, Don't Throw! Don't throw waste on the road, in the gutter, or in the ravine. A ravine is not a dustbin.</span>
                </div>
              </div>
            </div>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-black text-emerald-900 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 text-sm flex items-center justify-center font-black shrink-0">
                5
              </span>
              <span>Benefits of a Clean Environment After Proper Disposal</span>
            </h2>
            <div className="pl-0 sm:pl-9 grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-gray-700">
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl">
                <strong>• Good Health:</strong> No more mosquitoes, rats, and cholera.
              </div>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl">
                <strong>• No Flood:</strong> When gutters are not blocked, water flows freely, even in Uyo.
              </div>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl">
                <strong>• Jobs and Wealth:</strong> Recycling creates jobs for our youths.
              </div>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl">
                <strong>• Beautiful Akwa Ibom:</strong> A clean Uyo, Eket, Ikot Ekpene is beautiful and attracts visitors.
              </div>
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl sm:col-span-2">
                <strong>• Safe Future:</strong> Protects our soil and water for our children.
              </div>
            </div>
          </section>

          {/* My Contribution as E-Waste Disposal */}
          <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-200">
            <h3 className="text-sm font-black text-emerald-950 uppercase tracking-wide mb-1">
              My Contribution as E-Waste Disposal
            </h3>
            <p className="text-xs sm:text-sm text-emerald-900 leading-relaxed font-medium">
              I am building a movement. Through E-Waste Disposal, I want to make it easy for every household in all 31 LGAs of Akwa Ibom State to dispose waste the right way.
            </p>
          </div>

          {/* HOW THE WEBSITE WORKS SECTION */}
          <section className="border-t-2 border-emerald-100 pt-8 space-y-4">
            <div className="text-center sm:text-left">
              <span className="text-[11px] font-black uppercase tracking-widest text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                Interactive Guide
              </span>
              <h2 className="text-xl sm:text-3xl font-black text-gray-900 tracking-tight mt-2">
                How E-Waste Disposal Works
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                A simple 7-step seamless recovery process connecting citizens to certified local recovery agents.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              {/* Step 1 */}
              <div className="p-4 bg-slate-50 border border-gray-200 rounded-2xl flex items-start gap-3">
                <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                  1
                </span>
                <div>
                  <h4 className="text-xs font-bold text-gray-900">Step 1: Broadcast Waste</h4>
                  <p className="text-xs text-gray-600 mt-0.5">
                    Waste Disposer Reports/Broadcasts Waste on the website with location and photo.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-4 bg-slate-50 border border-gray-200 rounded-2xl flex items-start gap-3">
                <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                  2
                </span>
                <div>
                  <h4 className="text-xs font-bold text-gray-900">Step 2: Public Pending List & Free Claim</h4>
                  <p className="text-xs text-gray-600 mt-0.5">
                    All pending wastes show publicly. Recovery Agent sees and Claims waste for FREE (max 2 at a time).
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-4 bg-slate-50 border border-gray-200 rounded-2xl flex items-start gap-3">
                <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                  3
                </span>
                <div>
                  <h4 className="text-xs font-bold text-gray-900">Step 3: 72 Hours Countdown & Private Contact</h4>
                  <p className="text-xs text-gray-600 mt-0.5">
                    72 Hours Countdown starts. Only the agent who claimed can see disposer's phone number and chat privately.
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="p-4 bg-slate-50 border border-gray-200 rounded-2xl flex items-start gap-3">
                <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                  4
                </span>
                <div>
                  <h4 className="text-xs font-bold text-gray-900">Step 4: Pickup & Recycling</h4>
                  <p className="text-xs text-gray-600 mt-0.5">
                    Recovery Agent goes to location, picks waste, recycles it for money.
                  </p>
                </div>
              </div>

              {/* Step 5 */}
              <div className="p-4 bg-slate-50 border border-gray-200 rounded-2xl flex items-start gap-3">
                <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                  5
                </span>
                <div>
                  <h4 className="text-xs font-bold text-gray-900">Step 5: Clean Spot Photo Upload</h4>
                  <p className="text-xs text-gray-600 mt-0.5">
                    Agent uploads photo of clean spot.
                  </p>
                </div>
              </div>

              {/* Step 6 */}
              <div className="p-4 bg-slate-50 border border-gray-200 rounded-2xl flex items-start gap-3">
                <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                  6
                </span>
                <div>
                  <h4 className="text-xs font-bold text-gray-900">Step 6: Disposer Acknowledges & Rating</h4>
                  <p className="text-xs text-gray-600 mt-0.5">
                    Waste Disposer acknowledges that spot is cleaned. This counts as 1 cleanup. 5 cleanups = 1 star rating for the agent.
                  </p>
                </div>
              </div>

              {/* Step 7 */}
              <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-start gap-3 sm:col-span-2">
                <span className="w-8 h-8 rounded-xl bg-emerald-700 text-white font-black text-xs flex items-center justify-center shrink-0">
                  7
                </span>
                <div>
                  <h4 className="text-xs font-bold text-emerald-950">Step 7: Archived & Done</h4>
                  <p className="text-xs text-emerald-800 mt-0.5">
                    Waste disappears from pending list. Done.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ACTION BUTTONS AT VERY BOTTOM */}
          <div className="border-t border-gray-200 pt-6 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            {/* Button 2: Back */}
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="w-full sm:w-auto px-6 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-2xl transition-all text-sm flex items-center justify-center gap-2 active:scale-95 cursor-pointer order-2 sm:order-1 border border-gray-300"
              >
                <span>Back</span>
              </button>
            )}

            {/* Button 1: START - Go to Dashboard */}
            <button
              type="button"
              onClick={onStartDashboard}
              className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-black rounded-2xl shadow-xl shadow-emerald-600/30 transition-all text-base flex items-center justify-center gap-2 active:scale-95 cursor-pointer order-1 sm:order-2"
            >
              <span>START - Go to Dashboard</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            {/* Post Your Waste Now Button */}
            {onPostWaste && (
              <button
                type="button"
                onClick={onPostWaste}
                className="w-full sm:w-auto px-6 py-3.5 bg-teal-50 hover:bg-teal-100 text-teal-900 border-2 border-teal-300 font-bold rounded-2xl transition-all text-sm flex items-center justify-center gap-2 active:scale-95 cursor-pointer order-3"
              >
                <PlusCircle className="w-4 h-4 text-teal-700" />
                <span>Post Your Waste Now</span>
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-6">
          <Footer />
        </div>
      </div>
    </div>
  );
};
