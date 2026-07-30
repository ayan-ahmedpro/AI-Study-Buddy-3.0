import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, User as UserIcon, Flame, Award, Share2, CreditCard, Copy, 
  ExternalLink, Zap, CheckCircle2, ShieldCheck, Database, ArrowLeft, 
  Settings, Globe, Sliders, Lock, BarChart2
} from 'lucide-react';
import { User } from 'firebase/auth';
import { UserStatsData, createProgressShare } from '../lib/userStats';
import { copyToClipboard } from '../lib/utils';
import StudyProgressCharts from './StudyProgressCharts';
import { useNavigation } from '../context/NavigationContext';

interface AccountSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  stats: UserStatsData | null;
  quizzesCompleted?: number;
  masteryScoreAverage?: number;
  topicsStudied?: string[];
  onOpenUpgrade: () => void;
  selectedLanguage?: string;
  onChangeLanguage?: (lang: string) => void;
  selectedAge?: number;
  onChangeAge?: (age: number) => void;
}

export default function AccountSettingsModal({
  isOpen,
  onClose,
  user,
  stats,
  quizzesCompleted = 0,
  masteryScoreAverage = 0,
  topicsStudied = [],
  onOpenUpgrade,
  selectedLanguage = 'English',
  onChangeLanguage,
  selectedAge = 20,
  onChangeAge
}: AccountSettingsModalProps) {
  const { goBack, registerModal } = useNavigation();
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'analytics' | 'progress' | 'subscription'>('profile');
  const [copiedRef, setCopiedRef] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [loadingShare, setLoadingShare] = useState(false);

  useEffect(() => {
    if (isOpen) {
      return registerModal('AccountSettingsModal', onClose);
    }
  }, [isOpen, onClose, registerModal]);

  const baseUrl = window.location.href.split('?')[0].split('#')[0];
  const refLink = `${baseUrl}?ref=${stats?.refCode || user?.uid?.substring(0, 6).toUpperCase() || 'PRO'}`;

  // Close on ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopyRef = async () => {
    await copyToClipboard(refLink);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  const handleGenerateShareLink = async () => {
    setLoadingShare(true);
    try {
      const targetUser = user || ({
        uid: 'guest_' + Math.random().toString(36).substring(2, 8),
        displayName: 'Remix Student Guest',
        email: 'guest@remix.study'
      } as any);

      const shareId = await createProgressShare(targetUser, {
        currentStreak: stats?.currentStreak || 1,
        longestStreak: stats?.longestStreak || 1,
        totalAnalyses: stats?.analysesUsed || 0,
        quizzesCompleted,
        masteryScoreAverage,
        topicsStudied
      });
      const url = `${window.location.origin}?shareId=${shareId}`;
      setShareUrl(url);
      await copyToClipboard(url);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    } catch (err) {
      console.error("Share error:", err);
      alert("Failed to generate progress link. Please try again.");
    } finally {
      setLoadingShare(false);
    }
  };

  const freeLimit = 5 + (stats?.bonusAnalyses || 0);

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-6 sm:p-8 shadow-2xl overflow-hidden my-8 text-slate-900 dark:text-white"
        >
          {/* Top Bar with Back and Close */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={goBack}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-all flex items-center gap-2 group cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Back to AI Study Buddy</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"
              title="Close Settings (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Profile Badge Header */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-xl font-black shadow-lg">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Avatar" className="w-full h-full rounded-2xl object-cover" />
              ) : (
                user?.displayName?.[0] || 'S'
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  {user?.displayName || 'Guest Student'}
                </h3>
                {stats?.isPro ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-[10px] uppercase tracking-wider">
                    PRO
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-[10px] uppercase tracking-wider">
                    FREE PLAN
                  </span>
                )}
              </div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {user?.email || 'Signed in • Cloud Database Auto-Sync Active'}
              </p>
            </div>
          </div>

          {/* Settings Tabs */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 mb-6 gap-2 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'profile'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <UserIcon className="w-4 h-4" />
              <span>Profile & Sync</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('preferences')}
              className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'preferences'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>Study Preferences</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('analytics')}
              className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'analytics'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BarChart2 className="w-4 h-4" />
              <span>Study Analytics</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('progress')}
              className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'progress'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Share2 className="w-4 h-4" />
              <span>Parent/Team Link</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('subscription')}
              className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'subscription'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Subscription & Billing</span>
            </button>
          </div>

          {/* Tab 1: Profile & Sync */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                      Firestore Database Backup Status
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] uppercase">
                    Connected & Live
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  All your notebooks, flashcard progress, study notes, and quiz scores are automatically saved to your cloud profile.
                </p>
              </div>

              {/* Streak Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <Flame className="w-6 h-6 fill-amber-500 text-amber-500" />
                  </div>
                  <div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white">
                      {stats?.currentStreak || 1} Days
                    </div>
                    <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Current Streak
                    </div>
                  </div>
                </div>

                <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white">
                      {stats?.longestStreak || 1} Days
                    </div>
                    <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Longest Streak
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Study Preferences */}
          {activeTab === 'preferences' && (
            <div className="space-y-4">
              <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-5 space-y-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">
                    Default Cognitive Age Level
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {[7, 15, 25, 40, 50].map((age) => (
                      <button
                        key={`acc-age-${age}`}
                        type="button"
                        onClick={() => onChangeAge && onChangeAge(age)}
                        className={`py-2 rounded-xl font-bold text-xs transition-all border ${
                          selectedAge === age
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {age === 50 ? '50+' : `${age} yrs`}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">
                    Output Language
                  </label>
                  <select
                    value={selectedLanguage}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (onChangeLanguage) onChangeLanguage(val);
                    }}
                    className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="English">English</option>
                    <option value="Urdu">Urdu (اردو) — Free ✨</option>
                    <option value="Arabic">Arabic (العربية) — Free ✨</option>
                    <option value="Spanish">Spanish (Español) — Free ✨</option>
                    <option value="French">French (Français) — Free ✨</option>
                    <option value="Hindi">Hindi (हिंदी) — Free ✨</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Study Analytics & Recharts Progress */}
          {activeTab === 'analytics' && (
            <div className="space-y-4">
              <StudyProgressCharts 
                quizzesCompleted={quizzesCompleted}
                masteryScoreAverage={masteryScoreAverage}
                topicsStudied={topicsStudied}
                totalAnalyses={stats?.analysesUsed || 0}
                currentStreak={stats?.currentStreak || 1}
                longestStreak={stats?.longestStreak || 1}
                isDark={true}
              />
            </div>
          )}

          {/* Tab 4: Parent / Team Progress */}
          {activeTab === 'progress' && (
            <div className="space-y-4">
              <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-emerald-500" />
                  <span className="text-sm font-black text-slate-900 dark:text-white">
                    Public Parent & Team Dashboard
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Generate a secure, read-only dashboard link showing your current study streak, quiz scores, and topics mastered. Perfect for parents, tutors, and team leaders.
                </p>

                {shareUrl && (
                  <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-between gap-2 text-xs font-mono">
                    <span className="truncate text-blue-600 dark:text-blue-400">{shareUrl}</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleGenerateShareLink}
                  disabled={loadingShare}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20"
                >
                  {loadingShare ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : copiedShare ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Progress Link Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4" />
                      <span>{shareUrl ? 'Re-copy Progress Link' : 'Generate & Copy Progress Link'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Tab 4: Subscription & Billing */}
          {activeTab === 'subscription' && (
            <div className="space-y-4">
              <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase">Plan Status</span>
                    <h4 className="text-lg font-black text-slate-900 dark:text-white">
                      {stats?.isPro ? 'Pro Unlimited Membership' : 'Free Trial Membership'}
                    </h4>
                  </div>
                  {!stats?.isPro && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenUpgrade();
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md hover:scale-105 transition-all flex items-center gap-1.5"
                    >
                      <Zap className="w-4 h-4 fill-current" />
                      <span>Upgrade Now</span>
                    </button>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-500">Analyses Usage</span>
                    <span className="text-slate-900 dark:text-white">
                      {stats?.isPro ? 'Unlimited (Pro)' : `${stats?.analysesUsed || 0} / ${freeLimit}`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Referral Code Box */}
              <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                    Your Referral Link
                  </span>
                  <span className="text-xs font-mono font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 px-2.5 py-0.5 rounded-lg">
                    {stats?.refCode || 'PRO'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={refLink}
                    className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-700 dark:text-slate-300 truncate"
                  />
                  <button
                    type="button"
                    onClick={handleCopyRef}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedRef ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Footer Back Button */}
          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={goBack}
              className="px-5 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to AI Study Buddy</span>
            </button>

            <span className="text-[11px] text-slate-400 font-medium">
              StudyBuddy Settings • Auto-Saved
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
