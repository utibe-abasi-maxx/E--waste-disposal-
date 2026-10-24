import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, NotificationItem, isDisposer, isAgent } from '../types';
import { CleanSpotStore } from '../services/storage';
import { useTheme } from '../context/ThemeContext';
import { UserAvatar } from './UserAvatar';
import {
  Recycle,
  Bell,
  MapPin,
  Trophy,
  BarChart3,
  LogOut,
  User,
  PlusCircle,
  Truck,
  Sparkles,
  Check,
  ChevronDown,
  Menu,
  Compass,
  BookOpen,
  HelpCircle,
  LifeBuoy,
  Sun,
  Moon,
  Settings,
} from 'lucide-react';

import { WasteReport } from '../types';

interface NavbarProps {
  currentUser: UserProfile | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAuth: () => void;
  onOpenReportModal: () => void;
  onLogout: () => void;
  notifications: NotificationItem[];
  onOpenWasteDetails?: (report: WasteReport) => void;
  onOpenSideDrawer?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeTab,
  setActiveTab,
  onOpenAuth,
  onOpenReportModal,
  onLogout,
  notifications,
  onOpenWasteDetails,
  onOpenSideDrawer,
}) => {
  const { theme, toggleTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = () => {
    if (currentUser) {
      CleanSpotStore.markAllNotificationsAsRead(currentUser.id);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-gray-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Top Left: Hamburger Menu & Brand */}
          <div className="flex items-center gap-3 sm:gap-4">
            {currentUser && (
              <button
                type="button"
                onClick={onOpenSideDrawer}
                className="p-2 sm:p-2.5 rounded-2xl border border-gray-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-slate-800 text-gray-800 dark:text-gray-200 transition-all flex items-center justify-center active:scale-95 shadow-sm cursor-pointer"
                title="Open Side Menu"
                aria-label="Open side drawer navigation menu"
              >
                <Menu className="w-5 h-5 text-gray-900 dark:text-gray-100" />
              </button>
            )}

            <button
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-2.5 text-left group cursor-pointer"
            >
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-emerald-800 to-green-600 flex items-center justify-center text-white shadow-md shadow-emerald-700/20 group-hover:scale-105 transition-transform">
                <Recycle className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <div className="text-base sm:text-lg font-black tracking-tight text-gray-900 dark:text-white flex items-center gap-1">
                  <span>E-WASTE</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-extrabold">DISPOSAL</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                    Akwa Ibom State
                  </span>
                </div>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1.5 lg:gap-2">
            <nav className="flex items-center gap-1 bg-gray-100/80 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-gray-200 dark:border-slate-700 text-xs">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  activeTab === 'dashboard'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-white/60 dark:hover:bg-slate-700'
                }`}
              >
                Dashboard
              </button>

              <button
                onClick={() => setActiveTab('education')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'education'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-white/60 dark:hover:bg-slate-700'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                Waste Education
              </button>

              <button
                onClick={() => setActiveTab('map')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'map'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-white/60 dark:hover:bg-slate-700'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                Waste Map
              </button>

              <button
                onClick={() => setActiveTab('leaderboard')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'leaderboard'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-white/60 dark:hover:bg-slate-700'
                }`}
              >
                <Trophy className="w-3.5 h-3.5" />
                Leaderboard
              </button>

              <button
                onClick={() => setActiveTab('impact')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'impact'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-white/60 dark:hover:bg-slate-700'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                Impact
              </button>

              <button
                onClick={() => setActiveTab('suggestions')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'suggestions'
                    ? 'text-emerald-800 dark:text-emerald-200 bg-emerald-100 dark:bg-emerald-900/50 font-bold shadow-xs'
                    : 'text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-white/60 dark:hover:bg-slate-700'
                }`}
                title="Customer Care, Help & Community Suggestions"
              >
                <HelpCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Help & Suggestions
              </button>
            </nav>
          </div>

          {/* Right Controls: Quick CTA, Theme Toggle, Customer Care, Notifications, Profile */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {currentUser ? (
              <>
                {/* Waste Disposer quick CTA */}
                {isDisposer(currentUser.role) ? (
                  <button
                    onClick={onOpenReportModal}
                    className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all active:scale-[0.98] cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Report Waste (+50 pts)</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-700/20 transition-all cursor-pointer"
                  >
                    <Truck className="w-4 h-4" />
                    <span>Available Pickups</span>
                  </button>
                )}

                {/* THEME TOGGLE (Requirement 6): beside notifications & help icons */}
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="p-2 sm:p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-200 transition-all flex items-center justify-center cursor-pointer shadow-xs active:scale-95"
                  title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                  aria-label="Toggle theme mode"
                >
                  {theme === 'dark' ? (
                    <Sun className="w-4 h-4 text-amber-400" />
                  ) : (
                    <Moon className="w-4 h-4 text-slate-700" />
                  )}
                </button>

                {/* Community Help & Suggestions / Customer Care Button */}
                <button
                  type="button"
                  onClick={() => setActiveTab('suggestions')}
                  className={`p-2 sm:p-2.5 rounded-xl border transition-all flex items-center justify-center cursor-pointer ${
                    activeTab === 'suggestions'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'border-gray-200 dark:border-slate-700 hover:bg-emerald-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-200 hover:text-emerald-700 dark:hover:text-emerald-400'
                  }`}
                  title="Customer Care & Community Help / Suggestions"
                  aria-label="Customer Care & Suggestions"
                >
                  <LifeBuoy className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </button>

                {/* Notifications Bell */}
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-2 sm:p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-200 relative transition-colors cursor-pointer"
                    title="Notifications"
                  >
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Popover */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-800 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
                      <div className="p-3.5 bg-emerald-50/70 dark:bg-emerald-950/40 border-b border-emerald-100 dark:border-emerald-900 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-gray-900 dark:text-white">Notifications</span>
                          {unreadCount > 0 && (
                            <span className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded-full font-bold">
                              {unreadCount} new
                            </span>
                          )}
                        </div>
                        {unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllRead}
                            className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>

                      <div className="max-h-72 overflow-y-auto divide-y divide-gray-100 dark:divide-slate-800">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center text-xs text-gray-500 dark:text-gray-400">
                            No notifications yet. You will get alerts when reports are claimed or cleaned!
                          </div>
                        ) : (
                          notifications.map((notif) => (
                            <div
                              key={notif.id}
                              onClick={() => {
                                CleanSpotStore.markNotificationAsRead(notif.id);
                                if (notif.reportId && onOpenWasteDetails) {
                                  const r = CleanSpotStore.getReportById(notif.reportId);
                                  if (r) onOpenWasteDetails(r);
                                } else {
                                  setActiveTab('dashboard');
                                }
                                setShowNotifications(false);
                              }}
                              className={`p-3 text-left hover:bg-emerald-50/40 dark:hover:bg-slate-800/60 cursor-pointer transition-colors ${
                                !notif.read ? 'bg-emerald-50/20 dark:bg-emerald-950/20 font-medium' : ''
                              }`}
                            >
                              <div className="flex items-start gap-2.5">
                                <span className="text-base shrink-0 mt-0.5">
                                  {notif.type === 'chat'
                                    ? '💬'
                                    : notif.type === 'rating'
                                    ? '⭐'
                                    : notif.type === 'claimed'
                                    ? '🚚'
                                    : notif.type === 'collected'
                                    ? '✨'
                                    : '🎁'}
                                </span>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-gray-900 dark:text-white">
                                      {notif.title}
                                    </span>
                                    {!notif.read && (
                                      <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-gray-600 dark:text-gray-400 mt-0.5 leading-relaxed">
                                    {notif.message}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Menu & Role Indicator (Requirement 1 & 2) */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-xl border border-gray-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-slate-800 transition-all cursor-pointer"
                  >
                    {/* UserAvatar: Checks auth.currentUser.photoURL first, then Firestore, then initials */}
                    <UserAvatar user={currentUser} size="sm" />
                    <div className="hidden sm:block text-left">
                      <div className="text-xs font-bold text-gray-900 dark:text-white truncate max-w-[100px]">
                        {currentUser.name}
                      </div>
                      <div className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 capitalize flex items-center gap-1">
                        {isAgent(currentUser.role)
                          ? `⭐ ${(currentUser.ratingStars ?? 0).toFixed(1)}★`
                          : 'Disposer'}{' '}
                        • {currentUser.points} pts
                      </div>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                  </button>

                  {/* Dropdown Menu (Requirement 2: Only Profile, Settings, Dark Mode Toggle, Sign Out) */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-800 overflow-hidden z-50 text-left animate-in fade-in zoom-in-95 duration-100">
                      <div className="p-3 bg-gray-50 dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700">
                        <div className="font-bold text-xs text-gray-900 dark:text-white">{currentUser.name}</div>
                        <div className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{currentUser.email}</div>
                        <div className="mt-2 flex flex-col gap-1 text-[11px]">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                              {isAgent(currentUser.role) ? 'Recovery Agent' : 'Waste Disposer'}
                            </span>
                            <span className="font-bold text-gray-700 dark:text-gray-300">{currentUser.points} Points</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-1.5 space-y-0.5">
                        {/* 1. Profile */}
                        <button
                          onClick={() => {
                            setActiveTab('dashboard');
                            setShowUserMenu(false);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-slate-800 rounded-lg font-medium text-left cursor-pointer"
                        >
                          <User className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>Profile & Dashboard</span>
                        </button>

                        {/* 2. Settings */}
                        <button
                          onClick={() => {
                            if (onOpenSideDrawer) onOpenSideDrawer();
                            setShowUserMenu(false);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-slate-800 rounded-lg font-medium text-left cursor-pointer"
                        >
                          <Settings className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                          <span>Settings</span>
                        </button>

                        {/* 3. Dark Mode Toggle */}
                        <button
                          onClick={() => {
                            toggleTheme();
                          }}
                          className="w-full flex items-center justify-between px-3 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-slate-800 rounded-lg font-medium text-left cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            {theme === 'dark' ? (
                              <Sun className="w-3.5 h-3.5 text-amber-400" />
                            ) : (
                              <Moon className="w-3.5 h-3.5 text-slate-700" />
                            )}
                            <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                          </div>
                          <span className="text-[10px] uppercase font-bold text-gray-400">
                            {theme}
                          </span>
                        </button>

                        <div className="border-t border-gray-100 dark:border-slate-800 my-1"></div>

                        {/* 4. Sign Out */}
                        <button
                          onClick={() => {
                            onLogout();
                            setShowUserMenu(false);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg font-semibold text-left cursor-pointer"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="p-2 rounded-xl border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-200"
                >
                  {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
                </button>
                <button
                  onClick={onOpenAuth}
                  className="px-4 py-2 text-xs font-bold text-gray-700 dark:text-gray-300 hover:text-emerald-700 rounded-xl transition-all cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={onOpenAuth}
                  className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Join E-Waste
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex items-center justify-around py-2.5 border-t border-gray-100 dark:border-slate-800 text-[11px] overflow-x-auto">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1 font-bold rounded-lg ${
              activeTab === 'dashboard' ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50' : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('education')}
            className={`px-3 py-1 font-bold rounded-lg ${
              activeTab === 'education' ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50' : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Education
          </button>
          <button
            onClick={() => setActiveTab('map')}
            className={`px-3 py-1 font-bold rounded-lg ${
              activeTab === 'map' ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50' : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Map
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`px-3 py-1 font-bold rounded-lg ${
              activeTab === 'leaderboard' ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50' : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Leaderboard
          </button>
          <button
            onClick={() => setActiveTab('suggestions')}
            className={`px-3 py-1 font-bold rounded-lg ${
              activeTab === 'suggestions' ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50' : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Help
          </button>
        </div>
      </div>
    </header>
  );
};
