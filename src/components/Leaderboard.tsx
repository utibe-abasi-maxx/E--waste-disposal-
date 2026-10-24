import React, { useState } from 'react';
import { UserProfile, isDisposer, isAgent } from '../types';
import { Trophy, Medal, Award, ShieldCheck, Sparkles, Truck, Coins, ArrowUpRight } from 'lucide-react';

interface LeaderboardProps {
  users: UserProfile[];
  onOpenReportModal?: () => void;
  onOpenAuth?: () => void;
  currentUser?: UserProfile | null;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({
  users,
  onOpenReportModal,
  onOpenAuth,
  currentUser,
}) => {
  const [tab, setTab] = useState<'reporters' | 'collectors'>('reporters');
  const [period, setPeriod] = useState<'all-time' | 'month'>('all-time');

  // Filter & sort
  const reporters = users
    .filter((u) => isDisposer(u.role))
    .sort((a, b) => (b.points || 0) - (a.points || 0));

  const collectors = users
    .filter((u) => isAgent(u.role))
    .sort((a, b) => (b.totalKgCollected || 0) - (a.totalKgCollected || 0));

  const currentList = tab === 'reporters' ? reporters : collectors;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
          <Trophy className="w-3.5 h-3.5 text-amber-600" />
          <span>Akwa Ibom State Eco Champions</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
          E-WASTE DISPOSAL Leaderboard
        </h1>
        <p className="text-sm text-gray-600 mt-2">
          Celebrating citizens reporting waste dumps and recyclers keeping Eket, Uyo, and Akwa Ibom clean.
        </p>

        {/* Category Switcher */}
        <div className="mt-6 inline-flex p-1.5 bg-gray-100 rounded-2xl border border-gray-200">
          <button
            onClick={() => setTab('reporters')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              tab === 'reporters'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Top Waste Disposers</span>
          </button>

          <button
            onClick={() => setTab('collectors')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              tab === 'collectors'
                ? 'bg-teal-700 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Top Recovery Agents</span>
          </button>
        </div>
      </div>

      {/* Podium for Top 3 */}
      {currentList.length >= 3 && (
        <div className="grid grid-cols-3 gap-3 sm:gap-6 items-end pt-8 pb-4 max-w-3xl mx-auto">
          {/* 2nd Place */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border-2 border-gray-200 text-center shadow-sm order-1 relative">
            <div className="w-7 h-7 rounded-full bg-gray-200 text-gray-700 font-black text-xs flex items-center justify-center mx-auto mb-2">
              2
            </div>
            <img
              src={currentList[1]?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
              alt=""
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover mx-auto mb-2 border-2 border-gray-300"
            />
            <h4 className="font-bold text-xs sm:text-sm text-gray-900 truncate">
              {currentList[1]?.name}
            </h4>
            <div className="text-[11px] text-gray-500">{currentList[1]?.lga}</div>
            <div className="mt-2 text-xs font-black text-emerald-700 bg-emerald-50 py-1 rounded-lg">
              {tab === 'reporters'
                ? `${currentList[1]?.points} pts`
                : `${currentList[1]?.totalKgCollected} KG`}
            </div>
          </div>

          {/* 1st Place (Center & taller) */}
          <div className="bg-gradient-to-b from-amber-50 to-white rounded-3xl p-5 sm:p-6 border-2 border-amber-400 text-center shadow-lg order-2 relative scale-105">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-2xl">👑</span>
            <div className="w-8 h-8 rounded-full bg-amber-400 text-gray-950 font-black text-xs flex items-center justify-center mx-auto mb-2 shadow">
              1
            </div>
            <img
              src={currentList[0]?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
              alt=""
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover mx-auto mb-2 border-4 border-amber-400 shadow-md"
            />
            <h4 className="font-black text-sm sm:text-base text-gray-900 truncate">
              {currentList[0]?.name}
            </h4>
            <div className="text-[11px] text-gray-500">{currentList[0]?.lga}</div>
            <div className="mt-2 text-sm font-black text-amber-900 bg-amber-200/80 py-1.5 rounded-xl">
              {tab === 'reporters'
                ? `${currentList[0]?.points} pts`
                : `${currentList[0]?.totalKgCollected} KG Recycled`}
            </div>
          </div>

          {/* 3rd Place */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border-2 border-amber-200/60 text-center shadow-sm order-3 relative">
            <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-800 font-black text-xs flex items-center justify-center mx-auto mb-2">
              3
            </div>
            <img
              src={currentList[2]?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
              alt=""
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover mx-auto mb-2 border-2 border-amber-200"
            />
            <h4 className="font-bold text-xs sm:text-sm text-gray-900 truncate">
              {currentList[2]?.name}
            </h4>
            <div className="text-[11px] text-gray-500">{currentList[2]?.lga}</div>
            <div className="mt-2 text-xs font-black text-emerald-700 bg-emerald-50 py-1 rounded-lg">
              {tab === 'reporters'
                ? `${currentList[2]?.points} pts`
                : `${currentList[2]?.totalKgCollected} KG`}
            </div>
          </div>
        </div>
      )}

      {/* Full Leaderboard Table */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden text-left">
        <div className="p-4 sm:p-5 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <span className="font-bold text-xs uppercase tracking-wider text-gray-700">
            {tab === 'reporters' ? 'Top Citizen Reporters Ranking' : 'Top Waste Collectors Ranking'}
          </span>
          <span className="text-xs text-gray-500">Live Updated • Akwa Ibom State</span>
        </div>

        <div className="divide-y divide-gray-100">
          {currentList.map((user, idx) => {
            const isMe = currentUser?.id === user.id;

            return (
              <div
                key={user.id}
                className={`p-4 flex items-center justify-between gap-4 transition-colors ${
                  isMe ? 'bg-emerald-50/70 font-semibold' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                      idx === 0
                        ? 'bg-amber-400 text-gray-950'
                        : idx === 1
                        ? 'bg-gray-300 text-gray-800'
                        : idx === 2
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    #{idx + 1}
                  </span>

                  <img
                    src={user.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                    alt=""
                    className="w-10 h-10 rounded-xl object-cover shrink-0 border border-gray-200"
                  />

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs sm:text-sm text-gray-900 truncate">
                        {user.name}
                      </span>
                      {isMe && (
                        <span className="text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                          You
                        </span>
                      )}
                      {user.role === 'collector' && (
                        <span className="text-[10px] text-teal-800 bg-teal-100 font-bold px-1.5 py-0.5 rounded">
                          Verified
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-gray-500 truncate">{user.lga}</div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  {tab === 'reporters' ? (
                    <div>
                      <div className="text-xs sm:text-sm font-black text-emerald-700 flex items-center gap-1 justify-end">
                        <Coins className="w-3.5 h-3.5" />
                        <span>{user.points} pts</span>
                      </div>
                      <div className="text-[10px] text-gray-400">
                        {user.reportsCount || 6} reports submitted
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="text-xs sm:text-sm font-black text-amber-700 flex items-center gap-1 justify-end">
                        <span>⭐ {(user.ratingStars ?? 0).toFixed(1)}★</span>
                        <span className="text-gray-400 font-normal">|</span>
                        <span className="text-teal-800">{user.totalKgCollected || 500} KG</span>
                      </div>
                      <div className="text-[10px] text-gray-500">
                        {user.confirmedCleanedCount ?? user.collectionsCount ?? 15} confirmed cleanings • {(user.level || 'Beginner').toUpperCase()}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
