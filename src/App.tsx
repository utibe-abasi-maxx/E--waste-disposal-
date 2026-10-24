import React, { useState, useEffect } from 'react';
import { UserProfile, UserRole, WasteReport, NotificationItem, isDisposer, isAgent } from './types';
import { CleanSpotStore } from './services/storage';
import {
  auth,
  db,
  fetchUserProfile,
  getOrCreateUserDocument,
  completeUserEducation,
  subscribeToWasteReports,
  claimWasteReportInFirestore,
  unclaimWasteReportInFirestore,
  deleteWasteReportInFirestore,
  acknowledgeCleanupInFirestore,
  markWasteCollectedInFirestore,
  logOut,
} from './services/firebaseService';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { LoginPage } from './components/LoginPage';
import { ProfileSetupPage } from './components/ProfileSetupPage';
import { WasteEducation } from './components/WasteEducation';
import { CommunitySuggestions } from './components/CommunitySuggestions';
import { SideDrawerMenu } from './components/SideDrawerMenu';
import { Navbar } from './components/Navbar';
import { ReporterDashboard } from './components/ReporterDashboard';
import { CollectorDashboard } from './components/CollectorDashboard';
import { ExploreMapView } from './components/ExploreMapView';
import { Leaderboard } from './components/Leaderboard';
import { ImpactDashboard } from './components/ImpactDashboard';
import { Footer } from './components/Footer';
import { ReportWasteModal } from './components/ReportWasteModal';
import { ProofCollectionModal } from './components/ProofCollectionModal';
import { WasteDetailsModal } from './components/WasteDetailsModal';
import confetti from 'canvas-confetti';

export default function App() {
  // App Stage: 'login' | 'profile_setup' | 'education' | 'app'
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [appStage, setAppStage] = useState<'login' | 'profile_setup' | 'education' | 'app'>('login');
  const [onboardingUid, setOnboardingUid] = useState<string>('');
  const [onboardingEmail, setOnboardingEmail] = useState<string>('');
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  // Real-time synced reports from Firestore
  const [reports, setReports] = useState<WasteReport[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [stats, setStats] = useState(CleanSpotStore.getStats());

  // Active view tab once inside the app: 'dashboard' | 'map' | 'leaderboard' | 'impact'
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Modals & Drawers state
  const [isSideDrawerOpen, setIsSideDrawerOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isProofModalOpen, setIsProofModalOpen] = useState(false);
  const [isWasteDetailsOpen, setIsWasteDetailsOpen] = useState(false);

  // Selected report targets
  const [proofReportTarget, setProofReportTarget] = useState<WasteReport | null>(null);
  const [selectedWasteDetailsReport, setSelectedWasteDetailsReport] = useState<WasteReport | null>(null);

  // 1. Firebase Auth listener: Automatically manages authentication session
  // Checks if user exists and if profileCompleted == true. If false, redirects to /complete-profile
  useEffect(() => {
    CleanSpotStore.init();

    const unsubscribeAuth = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
      setAuthLoading(true);
      if (!fbUser) {
        setCurrentUser(null);
        CleanSpotStore.setCurrentUser(null);
        setAppStage('login');
        setAuthLoading(false);
      } else {
        try {
          // Direct check of user document in Firestore to firmly root the role
          const userDocRef = doc(db, 'users', fbUser.uid);
          const userSnap = await getDoc(userDocRef);
          const dbRole = userSnap.exists() ? userSnap.data()?.role : undefined;

          const profile = await getOrCreateUserDocument(fbUser);
          if (dbRole === 'recovery' || isAgent(dbRole)) {
            profile.role = 'recovery';
          }

          if (profile.onboardingStep === 'completed') {
            setCurrentUser(profile);
            CleanSpotStore.setCurrentUser(profile);
            setAppStage('app');
            setActiveTab('dashboard');
            const targetRoute = (profile.role === 'recovery' || isAgent(profile.role))
              ? '/recovery-dashboard'
              : '/dashboard';
            if (window.location.pathname !== targetRoute) {
              window.history.replaceState({}, '', targetRoute);
            }
          } else if (profile.onboardingStep === 'education' || profile.profileCompleted === true) {
            setCurrentUser(profile);
            CleanSpotStore.setCurrentUser(profile);
            setAppStage('education');
            if (window.location.pathname !== '/education') {
              window.history.replaceState({}, '', '/education');
            }
          } else {
            // Profile incomplete: redirect to Step 2 (Complete Profile)
            setOnboardingUid(fbUser.uid);
            setOnboardingEmail(fbUser.email || '');
            setAppStage('profile_setup');
          }
        } catch (err) {
          console.log('Error checking user profile in onAuthStateChanged:', err);
          setOnboardingUid(fbUser.uid);
          setOnboardingEmail(fbUser.email || '');
          setAppStage('profile_setup');
        } finally {
          setAuthLoading(false);
        }
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // 2. Real-time Firestore sync: All authenticated users listen to wasteReports in real time!
  useEffect(() => {
    if (appStage !== 'app') return;

    // Subscribe to Firestore collection 'wasteReports'
    const unsubscribeReports = subscribeToWasteReports(
      (realtimeReports) => {
        setReports(realtimeReports);
        CleanSpotStore.syncReports(realtimeReports);
        setStats(CleanSpotStore.getStats());

        // Keep details modal synchronized with live data
        if (selectedWasteDetailsReport) {
          const fresh = realtimeReports.find((r) => r.id === selectedWasteDetailsReport.id);
          if (fresh) setSelectedWasteDetailsReport(fresh);
        }
      },
      (err) => {
        console.warn('Real-time reports sync notice:', err);
      }
    );

    const reloadData = () => {
      const u = CleanSpotStore.getCurrentUser();
      if (u) {
        setNotifications(CleanSpotStore.getNotifications(u.id));
      }
      setUsers(CleanSpotStore.getUsers());
      setStats(CleanSpotStore.getStats());
    };

    window.addEventListener('cleanspot_store_update', reloadData);

    // 72-Hour Claim Auto-Return Check (runs every 15 seconds)
    const autoReturnInterval = setInterval(() => {
      CleanSpotStore.checkExpiredClaims();
    }, 15000);

    return () => {
      unsubscribeReports();
      clearInterval(autoReturnInterval);
      window.removeEventListener('cleanspot_store_update', reloadData);
    };
  }, [appStage, selectedWasteDetailsReport?.id]);

  // Route Protection: If user is logged in and onboardingStep != "completed", always redirect to /education first
  useEffect(() => {
    if (!authLoading && currentUser) {
      if (currentUser.onboardingStep !== 'completed' && appStage === 'app') {
        setAppStage('education');
        if (window.location.pathname !== '/education') {
          window.history.replaceState({}, '', '/education');
        }
      }
    }
  }, [currentUser, appStage, authLoading]);

  // Synchronize browser history and popstate for /education, /dashboard, and /recovery-dashboard
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === '/education') {
        if (currentUser) setAppStage('education');
      } else if (path === '/recovery-dashboard' || path === '/dashboard') {
        if (currentUser?.onboardingStep === 'completed') {
          // If role is recovery, force /recovery-dashboard and block reporter routes
          if (currentUser.role === 'recovery' || isAgent(currentUser.role)) {
            if (path !== '/recovery-dashboard') {
              window.history.replaceState({}, '', '/recovery-dashboard');
            }
          }
          setAppStage('app');
          setActiveTab('dashboard');
        } else if (currentUser) {
          setAppStage('education');
        }
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentUser]);

  // Role Routing Lock: Wherever user.role = "recovery", force /recovery-dashboard and block reporter routes
  useEffect(() => {
    if (appStage === 'app' && currentUser) {
      if (currentUser.role === 'recovery' || isAgent(currentUser.role)) {
        if (window.location.pathname === '/dashboard') {
          window.history.replaceState({}, '', '/recovery-dashboard');
        }
      }
    }
  }, [appStage, currentUser, activeTab]);

  // Handle Login Success (existing profile)
  const handleLoginSuccess = (user: UserProfile) => {
    // Firmly root role if recovery or agent
    if (user.role === 'recovery' || isAgent(user.role)) {
      user.role = 'recovery';
    }
    setCurrentUser(user);
    CleanSpotStore.setCurrentUser(user);
    if (user.onboardingStep === 'completed') {
      setAppStage('app');
      setActiveTab('dashboard');
      const targetRoute = (user.role === 'recovery' || isAgent(user.role))
        ? '/recovery-dashboard'
        : '/dashboard';
      if (window.location.pathname !== targetRoute) {
        window.history.pushState({}, '', targetRoute);
      }
    } else if (user.onboardingStep === 'education' || user.profileCompleted) {
      setAppStage('education');
      if (window.location.pathname !== '/education') {
        window.history.pushState({}, '', '/education');
      }
    } else {
      setOnboardingUid(user.id);
      setOnboardingEmail(user.email);
      setAppStage('profile_setup');
    }
  };

  // Handle Profile Onboarding Completed: Go to EDUCATION PAGE (Signup Step 3)
  const handleProfileComplete = (user: UserProfile) => {
    try {
      if (user.role === 'recovery' || isAgent(user.role)) {
        user.role = 'recovery';
      }
      setCurrentUser(user);
      CleanSpotStore.setCurrentUser(user);
      setAppStage('education');
      if (typeof window !== 'undefined' && window.location.pathname !== '/education') {
        try {
          window.history.pushState({}, '', '/education');
        } catch {
          // safe in iframe
        }
      }

      try {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#059669', '#10b981', '#14b8a6', '#047857'],
        });
      } catch {
        // safe in iframe
      }
    } catch (navErr) {
      console.warn('Navigation note in handleProfileComplete:', navErr);
      setAppStage('education');
    }
  };

  // Button 1: "START - Go to Dashboard" -> updates users/{userId} onboardingStep="completed"
  const handleStartDashboard = async () => {
    const activeUser = currentUser || CleanSpotStore.getCurrentUser();
    if (activeUser?.id) {
      try {
        await completeUserEducation(activeUser.id);
      } catch (err) {
        console.warn('Notice saving completed education:', err);
      }
      const updatedUser: UserProfile = {
        ...activeUser,
        role: (activeUser.role === 'recovery' || isAgent(activeUser.role)) ? 'recovery' : activeUser.role,
        onboardingStep: 'completed',
        profileCompleted: true,
      };
      setCurrentUser(updatedUser);
      CleanSpotStore.updateUserProfile(updatedUser);
      CleanSpotStore.setCurrentUser(updatedUser);
    }
    setAppStage('app');
    setActiveTab('dashboard');
    const targetRoute = (activeUser?.role === 'recovery' || isAgent(activeUser?.role))
      ? '/recovery-dashboard'
      : '/dashboard';
    if (typeof window !== 'undefined' && window.location.pathname !== targetRoute) {
      try {
        window.history.pushState({}, '', targetRoute);
      } catch {
        // safe in iframe
      }
    }
  };

  // Button 2: "Back" -> returns to Step 2
  const handleEducationBack = () => {
    const activeUser = currentUser || CleanSpotStore.getCurrentUser();
    if (activeUser) {
      setOnboardingUid(activeUser.id);
      setOnboardingEmail(activeUser.email);
    }
    setAppStage('profile_setup');
  };

  // Open Waste Details & Private Chat Modal
  const handleOpenWasteDetails = (report: WasteReport) => {
    setSelectedWasteDetailsReport(report);
    setIsWasteDetailsOpen(true);
  };

  // Claim Waste Dump (Recovery Agent action: Max 2 claimed wastes allowed at a time)
  const handleClaimWaste = async (report: WasteReport) => {
    if (!currentUser) {
      setAppStage('login');
      return;
    }

    if (!isAgent(currentUser.role)) {
      console.warn('Only registered Recovery Agents can claim e-waste for pickup.');
      return;
    }

    // Check active claimed wastes count
    const activeClaims = reports.filter(
      (r) =>
        r.status === 'claimed' &&
        (r.collectorId === currentUser.id || r.claimedBy === currentUser.id) &&
        !r.acknowledgement &&
        r.id !== report.id
    );

    if (activeClaims.length >= 2) {
      console.warn('You can only claim maximum 2 wastes at a time. Finish your claimed wastes first.');
      return;
    }

    // Update in Firestore
    try {
      await claimWasteReportInFirestore(report.id, currentUser);
    } catch (fsErr: any) {
      console.warn('Firestore claim error:', fsErr);
    }

    CleanSpotStore.claimReport(report.id, currentUser);

    if (selectedWasteDetailsReport?.id === report.id) {
      const fresh = CleanSpotStore.getReportById(report.id);
      if (fresh) setSelectedWasteDetailsReport(fresh);
    }

    setActiveTab('dashboard');
  };

  // Unclaim Waste Dump (Recovery Agent releases claim back to pending)
  const handleUnclaimWaste = async (wasteId: string) => {
    try {
      await unclaimWasteReportInFirestore(wasteId);
    } catch (err) {
      console.warn('Unclaim error:', err);
    }
    CleanSpotStore.unclaimReport(wasteId);
    if (selectedWasteDetailsReport?.id === wasteId) {
      const fresh = CleanSpotStore.getReportById(wasteId);
      if (fresh) setSelectedWasteDetailsReport(fresh);
    }
  };

  // Delete Waste Report (Waste Disposer deletes own waste report)
  const handleDeleteWaste = async (wasteId: string) => {
    try {
      await deleteWasteReportInFirestore(wasteId);
    } catch (err) {
      console.warn('Delete waste error:', err);
    }
    CleanSpotStore.deleteReport(wasteId);
    setReports((prev) => prev.filter((r) => r.id !== wasteId));
    if (selectedWasteDetailsReport?.id === wasteId) {
      setIsWasteDetailsOpen(false);
      setSelectedWasteDetailsReport(null);
    }
  };

  // Acknowledge Cleanup (Waste Disposer confirms cleanup completed well)
  const handleAcknowledgeCleanup = async (report: WasteReport) => {
    const recoveryAgentId = report.collectorId || report.claimedBy || '';
    try {
      await acknowledgeCleanupInFirestore(report.id, recoveryAgentId);
    } catch (err) {
      console.warn('Acknowledge cleanup error:', err);
    }

    CleanSpotStore.confirmCleanedWell(
      report.id,
      currentUser!,
      5,
      'Confirmed cleaned well, verified thoroughly!'
    );

    confetti({
      particleCount: 140,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#059669', '#10b981', '#14b8a6', '#047857', '#eab308'],
    });

    if (selectedWasteDetailsReport?.id === report.id) {
      const fresh = CleanSpotStore.getReportById(report.id);
      if (fresh) setSelectedWasteDetailsReport(fresh);
    }
  };

  // Open Proof Modal
  const handleOpenProofModal = (report: WasteReport) => {
    setProofReportTarget(report);
    setIsProofModalOpen(true);
  };

  // Logout
  const handleLogout = async () => {
    try {
      await logOut();
    } catch (err) {
      console.warn('Sign-out error:', err);
    }
    CleanSpotStore.setCurrentUser(null);
    setCurrentUser(null);
    setAppStage('login');
    setActiveTab('dashboard');
  };

  // Reset demo data
  const handleResetData = () => {
    CleanSpotStore.resetToDefaults();
    setReports([]);
  };

  // Loading indicator while checking initial Firebase Auth session
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold text-emerald-400">Loading E-Waste Disposal Platform...</p>
      </div>
    );
  }

  // STEP 2: COMPLETE PROFILE (Mandatory Step 2 after signup or for incomplete profile, BEFORE main app)
  // User CANNOT enter main app until they finish this!
  if (appStage === 'profile_setup') {
    const activeUser = currentUser || CleanSpotStore.getCurrentUser();
    return (
      <ProfileSetupPage
        userId={onboardingUid || activeUser?.id || auth.currentUser?.uid || ''}
        initialEmail={onboardingEmail || activeUser?.email || auth.currentUser?.email || ''}
        onProfileComplete={handleProfileComplete}
      />
    );
  }

  // STEP 3: WASTE EDUCATION PAGE (Signup Step 3 / Education Page)
  if (appStage === 'education') {
    return (
      <WasteEducation
        onStartDashboard={handleStartDashboard}
        onBack={handleEducationBack}
        onPostWaste={async () => {
          await handleStartDashboard();
          setIsReportModalOpen(true);
        }}
        isAfterSignup={true}
      />
    );
  }

  // STEP 1: AUTHENTICATION SCREEN (Sign In or Create Account with Email/Password)
  if (appStage === 'login' || !currentUser) {
    return (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
        onRequireProfileSetup={(uid, email) => {
          setOnboardingUid(uid);
          setOnboardingEmail(email);
          setAppStage('profile_setup');
        }}
      />
    );
  }

  const isRecoveryAgent = currentUser?.role === 'recovery' || isAgent(currentUser?.role);

  // 3. Main App Dashboard (Waste Disposer Hub or Recovery Agent Hub)
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 font-['Plus_Jakarta_Sans',sans-serif] text-gray-900 dark:text-gray-100 selection:bg-emerald-500 selection:text-white transition-colors">
      {/* Top Navigation Bar */}
      <Navbar
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={() => setAppStage('login')}
        onOpenReportModal={() => {
          if (!isRecoveryAgent) setIsReportModalOpen(true);
        }}
        onLogout={handleLogout}
        notifications={notifications}
        onOpenWasteDetails={handleOpenWasteDetails}
        onOpenSideDrawer={() => setIsSideDrawerOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* RECOVERY AGENT DASHBOARD: Firmly rooted. Whenever user.role is recovery or agent, stay as Recovery Agent dashboard ONLY */}
        {activeTab === 'dashboard' && isRecoveryAgent && (
          <CollectorDashboard
            currentUser={currentUser}
            reports={reports}
            onClaimWaste={handleClaimWaste}
            onOpenProofModal={handleOpenProofModal}
            onOpenWasteDetails={handleOpenWasteDetails}
            onOpenSideDrawer={() => setIsSideDrawerOpen(true)}
            onUnclaimWaste={handleUnclaimWaste}
          />
        )}

        {/* WASTE DISPOSER DASHBOARD: Blocked for recovery agents */}
        {activeTab === 'dashboard' && !isRecoveryAgent && isDisposer(currentUser.role) && (
          <ReporterDashboard
            currentUser={currentUser}
            reports={reports}
            onOpenReportModal={() => setIsReportModalOpen(true)}
            onOpenWasteDetails={handleOpenWasteDetails}
            onOpenSideDrawer={() => setIsSideDrawerOpen(true)}
            onDeleteWaste={handleDeleteWaste}
            onAcknowledgeCleanup={handleAcknowledgeCleanup}
          />
        )}

        {/* WASTE EDUCATION TAB */}
        {activeTab === 'education' && (
          <WasteEducation
            onStartDashboard={() => setActiveTab('dashboard')}
            onPostWaste={() => {
              setActiveTab('dashboard');
              if (!isRecoveryAgent) setIsReportModalOpen(true);
            }}
            isAfterSignup={false}
          />
        )}

        {/* COMMUNITY HELP & SUGGESTIONS TAB */}
        {activeTab === 'suggestions' && (
          <CommunitySuggestions
            currentUser={currentUser}
            isFullPage={true}
          />
        )}

        {/* EXPLORE / MAP VIEW: Shows real-time Firestore data */}
        {activeTab === 'map' && (
          <ExploreMapView
            reports={reports}
            currentUser={currentUser}
            onOpenReportModal={() => {
              if (!isRecoveryAgent) setIsReportModalOpen(true);
            }}
            onClaimWaste={handleClaimWaste}
            onOpenProofModal={handleOpenProofModal}
            onOpenWasteDetails={handleOpenWasteDetails}
            onCloseMap={() => {
              setActiveTab('dashboard');
              if (isRecoveryAgent && window.location.pathname !== '/recovery-dashboard') {
                window.history.pushState({}, '', '/recovery-dashboard');
              }
            }}
          />
        )}

        {/* LEADERBOARD */}
        {activeTab === 'leaderboard' && (
          <Leaderboard
            users={users}
            currentUser={currentUser}
            onOpenReportModal={() => {
              if (!isRecoveryAgent) setIsReportModalOpen(true);
            }}
            onOpenAuth={() => setAppStage('login')}
          />
        )}

        {/* IMPACT ANALYTICS */}
        {activeTab === 'impact' && (
          <ImpactDashboard
            reports={reports}
            stats={stats}
            onExploreMap={() => setActiveTab('map')}
          />
        )}
      </main>

      {/* Footer */}
      <Footer
        setActiveTab={setActiveTab}
        onResetData={handleResetData}
      />

      {/* Hamburger Menu Side Drawer */}
      <SideDrawerMenu
        isOpen={isSideDrawerOpen}
        onClose={() => setIsSideDrawerOpen(false)}
        currentUser={currentUser}
        reports={reports}
        onLogout={handleLogout}
        onOpenWasteDetails={handleOpenWasteDetails}
      />

      {/* Report Waste Modal: Blocked for Recovery Agent */}
      <ReportWasteModal
        isOpen={isReportModalOpen && !isRecoveryAgent}
        onClose={() => setIsReportModalOpen(false)}
        currentUser={currentUser}
        onReportCreated={() => {
          setActiveTab('dashboard');
        }}
      />

      {/* Proof of Collection Modal */}
      <ProofCollectionModal
        isOpen={isProofModalOpen}
        onClose={() => {
          setIsProofModalOpen(false);
          setProofReportTarget(null);
        }}
        report={proofReportTarget}
        collector={currentUser}
        onSuccess={() => {
          setActiveTab('dashboard');
        }}
      />

      {/* Waste Details & Private Chat Modal */}
      <WasteDetailsModal
        isOpen={isWasteDetailsOpen}
        onClose={() => {
          setIsWasteDetailsOpen(false);
          setSelectedWasteDetailsReport(null);
        }}
        report={selectedWasteDetailsReport}
        currentUser={currentUser}
        onClaimWaste={handleClaimWaste}
        onOpenProofModal={handleOpenProofModal}
        onUnclaimWaste={handleUnclaimWaste}
        onDeleteWaste={handleDeleteWaste}
        onAcknowledgeCleanup={handleAcknowledgeCleanup}
      />
    </div>
  );
}
