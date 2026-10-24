import React, { useState } from 'react';
import { UserProfile, WasteReport, isDisposer, isAgent } from '../types';
import { CleanSpotStore } from '../services/storage';
import { getCollectorLevelInfo } from '../services/rating';
import {
  X,
  User,
  Bookmark,
  History,
  Settings,
  LogOut,
  Edit3,
  ShieldCheck,
  Star,
  MapPin,
  Truck,
  CheckCircle2,
  Trash2,
  Sparkles,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Bell,
  Coins,
  ArrowRight,
  ExternalLink,
  BookOpen,
  HelpCircle,
  Sun,
  Moon,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { UserAvatar } from './UserAvatar';

interface SideDrawerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  reports: WasteReport[];
  onLogout: () => void;
  onOpenWasteDetails?: (report: WasteReport) => void;
  onSelectTab?: (tab: string) => void;
}

export const SideDrawerMenu: React.FC<SideDrawerMenuProps> = ({
  isOpen,
  onClose,
  currentUser,
  reports,
  onLogout,
  onOpenWasteDetails,
  onSelectTab,
}) => {
  const { theme, toggleTheme } = useTheme();
  const [activeModal, setActiveModal] = useState<
    'none' | 'account' | 'bookmarks' | 'history' | 'settings'
  >('none');

  // Edit Account State
  const [editName, setEditName] = useState(currentUser.name);
  const [editAge, setEditAge] = useState<string>(currentUser.age ? String(currentUser.age) : '25');
  const [editEmail, setEditEmail] = useState(currentUser.email);
  const [editPhone, setEditPhone] = useState(currentUser.phone || '');
  const [editPassword, setEditPassword] = useState((currentUser as any)?.password || '');
  const [editAvatar, setEditAvatar] = useState(currentUser.avatarUrl);
  const [showPassword, setShowPassword] = useState(false);
  const [editSuccess, setEditSuccess] = useState(false);
  const [editError, setEditError] = useState('');

  // Settings State
  const [notifSound, setNotifSound] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [defaultLga, setDefaultLga] = useState(currentUser.lga || 'Eket');
  const [settingsSaved, setSettingsSaved] = useState(false);

  // History Filter State
  const [historyTab, setHistoryTab] = useState<'reported' | 'cleaned'>('reported');

  if (!isOpen) return null;

  const collectorLevel = getCollectorLevelInfo(currentUser.ratingStars ?? 0);

  // Saved / Bookmarked Reports
  const savedReports = CleanSpotStore.getSavedReports(currentUser.id);

  // History reports
  const myReported = reports.filter((r) => r.reporterId === currentUser.id);
  const myCleaned = reports.filter(
    (r) => r.collectorId === currentUser.id && r.status === 'collected'
  );

  // Handle Save Account Changes
  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    setEditError('');

    if (!editName.trim()) {
      setEditError('Full Name cannot be empty.');
      return;
    }

    const ageNum = parseInt(editAge, 10);
    if (!editAge || isNaN(ageNum) || ageNum < 15 || ageNum > 100) {
      setEditError('Please enter a valid age between 15 and 100.');
      return;
    }

    const updated = CleanSpotStore.updateAccount(currentUser.id, {
      name: editName.trim(),
      age: ageNum,
      email: editEmail.trim(),
      phone: editPhone.trim(),
      password: editPassword,
      avatarUrl: editAvatar,
    });

    setEditSuccess(true);
    setTimeout(() => {
      setEditSuccess(false);
      setActiveModal('none');
    }, 1200);
  };

  const handleSaveSettings = () => {
    CleanSpotStore.updateUserProfile({
      id: currentUser.id,
      lga: defaultLga,
    });
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden text-left animate-fade-in">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
      />

      {/* Slide-out Drawer from Left */}
      <div className="fixed inset-y-0 left-0 max-w-full flex">
        <div className="w-screen max-w-sm sm:max-w-md bg-white dark:bg-slate-900 shadow-2xl flex flex-col justify-between overflow-hidden border-r border-gray-200 dark:border-slate-800">
          {/* Drawer Top Header with User Profile Summary */}
          <div className="p-6 bg-gradient-to-br from-emerald-800 via-teal-800 to-slate-900 text-white relative shrink-0">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4">
              <div className="relative">
                <UserAvatar user={currentUser} size="xl" borderClassName="border-2 border-white/80" />
                <button
                  onClick={() => setActiveModal('account')}
                  className="absolute -bottom-1 -right-1 p-1.5 bg-emerald-500 hover:bg-emerald-600 rounded-full text-white shadow cursor-pointer"
                  title="Edit Profile"
                >
                  <Edit3 className="w-3 h-3" />
                </button>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-white/20 text-white">
                    {isAgent(currentUser.role) ? 'Recovery Agent' : 'Waste Disposer'}
                  </span>
                  {isAgent(currentUser.role) && (
                    <span className="text-[10px] font-black bg-amber-400 text-gray-950 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                      <Star className="w-2.5 h-2.5 fill-current" />
                      {(currentUser.ratingStars ?? 0).toFixed(1)}★
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-black text-white truncate mt-1">
                  {currentUser.name}
                </h3>
                <p className="text-xs text-emerald-200/80 truncate">
                  {currentUser.email}
                  {currentUser.age ? ` • Age ${currentUser.age}` : ''}
                </p>
              </div>
            </div>

            {/* Quick Stats Strip */}
            <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between text-xs text-emerald-100">
              <div className="flex items-center gap-1.5 font-bold">
                <Coins className="w-4 h-4 text-amber-300" />
                <span>{currentUser.points} Eco Points</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-300" />
                <span>{currentUser.lga || 'Eket, Akwa Ibom'}</span>
              </div>
            </div>
          </div>

          {/* Drawer Navigation List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-1 divide-y divide-gray-100 dark:divide-slate-800">
            <div className="space-y-1 pb-2">
              {/* 1. My Account (Edit name, age, email, password) */}
              <button
                onClick={() => setActiveModal('account')}
                className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-emerald-50 dark:hover:bg-slate-800 text-gray-800 dark:text-gray-200 transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-sm text-gray-900 dark:text-white">My Account</div>
                    <div className="text-[11px] text-gray-500 dark:text-gray-400">Edit name, age, email, password</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-600 transition-colors" />
              </button>

              {/* 2. Bookmarks / Saved Wastes */}
              <button
                onClick={() => setActiveModal('bookmarks')}
                className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-emerald-50 dark:hover:bg-slate-800 text-gray-800 dark:text-gray-200 transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Bookmark className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-sm text-gray-900 dark:text-white">Bookmarks / Saved Wastes</div>
                    <div className="text-[11px] text-gray-500 dark:text-gray-400">
                      {savedReports.length} saved waste locations
                    </div>
                  </div>
                </div>
                <span className="text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                  {savedReports.length}
                </span>
              </button>

              {/* 3. History (Wastes Reported / Wastes Cleaned) */}
              <button
                onClick={() => setActiveModal('history')}
                className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-emerald-50 dark:hover:bg-slate-800 text-gray-800 dark:text-gray-200 transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <History className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-sm text-gray-900 dark:text-white">Activity History</div>
                    <div className="text-[11px] text-gray-500 dark:text-gray-400">
                      Wastes I reported & wastes I cleaned
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
              </button>

              {/* 4. Settings */}
              <button
                onClick={() => setActiveModal('settings')}
                className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-emerald-50 dark:hover:bg-slate-800 text-gray-800 dark:text-gray-200 transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Settings className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-sm text-gray-900 dark:text-white">Settings</div>
                    <div className="text-[11px] text-gray-500 dark:text-gray-400">
                      Notifications, Akwa Ibom LGA & preferences
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-purple-600 transition-colors" />
              </button>

              {/* 5. Waste Education */}
              <button
                onClick={() => {
                  if (onSelectTab) onSelectTab('education');
                  onClose();
                }}
                className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-emerald-50 dark:hover:bg-slate-800 text-gray-800 dark:text-gray-200 transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-sm text-gray-900 dark:text-white">Waste Education</div>
                    <div className="text-[11px] text-gray-500 dark:text-gray-400">
                      Guide to a cleaner Akwa Ibom & how it works
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-600 transition-colors" />
              </button>

              {/* 6. Community Help & Suggestions */}
              <button
                onClick={() => {
                  if (onSelectTab) onSelectTab('suggestions');
                  onClose();
                }}
                className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-emerald-50 dark:hover:bg-slate-800 text-gray-800 dark:text-gray-200 transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-sm text-gray-900 dark:text-white">Help & Suggestions</div>
                    <div className="text-[11px] text-gray-500 dark:text-gray-400">
                      Customer care, complaints & feedback feed
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-teal-600 transition-colors" />
              </button>
            </div>

            {/* Theme & Role Policy (Requirement 2 & 6) */}
            <div className="pt-3 pb-1 space-y-2">
              <button
                type="button"
                onClick={toggleTheme}
                className="w-full p-3 rounded-2xl bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors text-left flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  {theme === 'dark' ? (
                    <Sun className="w-4 h-4 text-amber-500" />
                  ) : (
                    <Moon className="w-4 h-4 text-slate-700" />
                  )}
                  <div>
                    <div className="text-xs font-bold text-gray-900 dark:text-white">
                      {theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                    </div>
                    <div className="text-[10px] text-gray-500 dark:text-gray-400">Currently in {theme} mode</div>
                  </div>
                </div>
                <span className="text-[10px] uppercase font-black text-gray-600 dark:text-gray-300 bg-white dark:bg-slate-900 px-2 py-0.5 rounded-md border border-gray-200 dark:border-slate-700">
                  {theme}
                </span>
              </button>

              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-900 dark:text-emerald-200">
                <span className="font-bold">Role Policy:</span> One email = One role forever ({isAgent(currentUser.role) ? 'Recovery Agent' : 'Waste Disposer'}). To use another role, sign out and register a new email.
              </div>
            </div>
          </div>

          {/* Drawer Footer with Sign Out */}
          <div className="p-4 bg-gray-50 dark:bg-slate-800/80 border-t border-gray-100 dark:border-slate-800 shrink-0">
            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="w-full py-3 px-4 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 font-bold rounded-2xl border border-red-200 dark:border-red-900 transition-colors flex items-center justify-center gap-2 text-xs cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* SUB-MODAL 1: EDIT ACCOUNT (Name, Age, Email, Password, Photo) */}
      {/* ============================================================== */}
      {activeModal === 'account' && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 w-full max-w-md overflow-hidden">
            <div className="p-5 bg-gradient-to-r from-emerald-700 to-teal-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5" />
                <h3 className="font-black text-base">Edit Account Details</h3>
              </div>
              <button
                onClick={() => setActiveModal('none')}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAccount} className="p-6 space-y-3.5">
              {editError && (
                <div className="p-2.5 bg-red-50 text-red-700 text-xs font-semibold rounded-xl border border-red-200">
                  {editError}
                </div>
              )}
              {editSuccess && (
                <div className="p-2.5 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Account updated successfully!</span>
                </div>
              )}

              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Full Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* Age */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Age</label>
                <input
                  type="number"
                  min="15"
                  max="100"
                  required
                  value={editAge}
                  onChange={(e) => setEditAge(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Email Address</label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Phone Number</label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="+234 800 000 0000"
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">App Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Avatar URL */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Profile Photo URL</label>
                <input
                  type="url"
                  value={editAvatar}
                  onChange={(e) => setEditAvatar(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveModal('none')}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md"
                >
                  Save Account Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SUB-MODAL 2: BOOKMARKS / SAVED WASTES */}
      {/* ============================================================== */}
      {activeModal === 'bookmarks' && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-5 bg-gradient-to-r from-amber-600 to-amber-700 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Bookmark className="w-5 h-5" />
                <h3 className="font-black text-base">Saved Wastes ({savedReports.length})</h3>
              </div>
              <button
                onClick={() => setActiveModal('none')}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {savedReports.length === 0 ? (
                <div className="text-center p-8 text-gray-400 space-y-2">
                  <Bookmark className="w-10 h-10 text-gray-300 mx-auto" />
                  <h4 className="font-bold text-sm text-gray-700">No saved wastes yet</h4>
                  <p className="text-xs text-gray-400 max-w-xs mx-auto">
                    You can bookmark waste dumps on the map or dashboard to check back on them later!
                  </p>
                </div>
              ) : (
                savedReports.map((report) => (
                  <div
                    key={report.id}
                    onClick={() => {
                      if (onOpenWasteDetails) onOpenWasteDetails(report);
                      setActiveModal('none');
                      onClose();
                    }}
                    className="p-3.5 bg-gray-50 hover:bg-amber-50/50 rounded-2xl border border-gray-200 transition-all cursor-pointer flex gap-3"
                  >
                    <img
                      src={report.photoUrl || report.imageUrl || 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600'}
                      alt=""
                      className="w-16 h-16 rounded-xl object-cover shrink-0 border border-gray-200"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                          {report.wasteType} • {report.size}
                        </span>
                        <span className="text-[10px] font-semibold text-gray-400">{report.lga}</span>
                      </div>
                      <h4 className="font-bold text-xs text-gray-900 truncate mt-1">
                        {report.address}
                      </h4>
                      <p className="text-[11px] text-gray-500 truncate mt-0.5">
                        "{report.description}"
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-3.5 bg-gray-50 border-t border-gray-100 flex justify-end shrink-0">
              <button
                onClick={() => setActiveModal('none')}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-bold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SUB-MODAL 3: HISTORY (Reported & Cleaned) */}
      {/* ============================================================== */}
      {activeModal === 'history' && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 w-full max-w-xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-5 bg-gradient-to-r from-blue-700 to-teal-700 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5" />
                <h3 className="font-black text-base">Activity History</h3>
              </div>
              <button
                onClick={() => setActiveModal('none')}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* History Category Selector */}
            <div className="flex border-b border-gray-200 p-2 bg-gray-50 gap-2 shrink-0">
              <button
                onClick={() => setHistoryTab('reported')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                  historyTab === 'reported'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                Wastes I Reported ({myReported.length})
              </button>
              <button
                onClick={() => setHistoryTab('cleaned')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                  historyTab === 'cleaned'
                    ? 'bg-teal-700 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                Wastes I Cleaned ({myCleaned.length})
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {historyTab === 'reported' ? (
                myReported.length === 0 ? (
                  <div className="p-8 text-center text-gray-400 text-xs">
                    You have not reported any waste spots yet.
                  </div>
                ) : (
                  myReported.map((report) => (
                    <div
                      key={report.id}
                      onClick={() => {
                        if (onOpenWasteDetails) onOpenWasteDetails(report);
                        setActiveModal('none');
                        onClose();
                      }}
                      className="p-3.5 bg-gray-50 hover:bg-emerald-50/50 rounded-2xl border border-gray-200 transition-all cursor-pointer flex gap-3"
                    >
                      <img
                        src={report.photoUrl || report.imageUrl || 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600'}
                        alt=""
                        className="w-16 h-16 rounded-xl object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                              report.status === 'collected'
                                ? 'bg-emerald-100 text-emerald-800'
                                : report.status === 'claimed'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {report.status}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {new Date(report.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h4 className="font-bold text-xs text-gray-900 mt-1 truncate">
                          {report.address}
                        </h4>
                        <p className="text-[11px] text-gray-500 truncate">{report.lga}</p>
                      </div>
                    </div>
                  ))
                )
              ) : myCleaned.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-xs">
                  No cleaned waste pickups recorded yet.
                </div>
              ) : (
                myCleaned.map((report) => (
                  <div
                    key={report.id}
                    onClick={() => {
                      if (onOpenWasteDetails) onOpenWasteDetails(report);
                      setActiveModal('none');
                      onClose();
                    }}
                    className="p-3.5 bg-gray-50 hover:bg-teal-50/50 rounded-2xl border border-gray-200 transition-all cursor-pointer space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-teal-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Cleaned +{report.collectedKg || 50} KG
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {report.collectedAt ? new Date(report.collectedAt).toLocaleDateString() : 'Cleaned'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <img
                        src={report.photoUrl || report.imageUrl || 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600'}
                        alt="Before"
                        className="w-full h-18 rounded-lg object-cover"
                      />
                      <img
                        src={report.proofPhoto || report.cleanPhoto || report.photoUrl || report.imageUrl || 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600'}
                        alt="Proof"
                        className="w-full h-18 rounded-lg object-cover border-2 border-emerald-500"
                      />
                    </div>
                    <div className="text-xs font-semibold text-gray-900 truncate">{report.address}</div>
                  </div>
                ))
              )}
            </div>

            <div className="p-3.5 bg-gray-50 border-t border-gray-100 flex justify-end shrink-0">
              <button
                onClick={() => setActiveModal('none')}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-bold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SUB-MODAL 4: SETTINGS */}
      {/* ============================================================== */}
      {activeModal === 'settings' && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 w-full max-w-md overflow-hidden">
            <div className="p-5 bg-gradient-to-r from-purple-700 to-indigo-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                <h3 className="font-black text-base">App Settings & Preferences</h3>
              </div>
              <button
                onClick={() => setActiveModal('none')}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              {settingsSaved && (
                <div className="p-2.5 bg-emerald-50 text-emerald-800 font-bold rounded-xl border border-emerald-200">
                  Settings saved successfully!
                </div>
              )}

              {/* Notification Toggles */}
              <div className="space-y-3">
                <h4 className="font-bold text-gray-900 text-sm">Notifications & Alerts</h4>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <div className="font-bold text-gray-800">In-App Chat & Claim Alerts</div>
                    <div className="text-[10px] text-gray-500">Notify when messages or claims arrive</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifSound}
                    onChange={(e) => setNotifSound(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <div className="font-bold text-gray-800">Pickup Reminders & Updates</div>
                    <div className="text-[10px] text-gray-500">Alert on new activity for claimed spots</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={smsAlerts}
                    onChange={(e) => setSmsAlerts(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                </div>
              </div>

              {/* Akwa Ibom Default City */}
              <div className="space-y-1 pt-2">
                <label className="font-bold text-gray-800 block">Default Akwa Ibom Location</label>
                <input
                  type="text"
                  value={defaultLga}
                  onChange={(e) => setDefaultLga(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveModal('none')}
                  className="px-4 py-2 border border-gray-200 rounded-xl font-bold text-gray-600"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleSaveSettings}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-md"
                >
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
