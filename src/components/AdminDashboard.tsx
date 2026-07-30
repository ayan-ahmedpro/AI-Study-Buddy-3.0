import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { 
  collection, 
  collectionGroup, 
  getDocs, 
  doc, 
  setDoc,
  getDoc, 
  query, 
  orderBy, 
  limit, 
  where 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { checkIsAdmin, setUserDisabled, grantAdminRights, setUserProStatusByUid } from '../lib/userStats';
import { 
  Users, 
  BookOpen, 
  Clock, 
  ShieldCheck, 
  Search, 
  Lock, 
  UserX, 
  UserCheck, 
  RefreshCw, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  AlertTriangle,
  BarChart2,
  TrendingUp,
  Activity,
  ArrowLeft,
  Smartphone,
  CheckCircle2,
  XCircle,
  Eye,
  Check,
  Zap,
  Image as ImageIcon
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { cn } from '../lib/utils';

interface AdminDashboardProps {
  currentUser: User | null;
  onNavigateHome: () => void;
}

interface AdminUserDoc {
  id: string;
  email: string;
  displayName?: string;
  totalStudyTime?: number;
  lastActive?: string;
  disabled?: boolean;
  analysesUsed?: number;
  createdAt?: string;
}

interface AdminSessionDoc {
  id: string;
  userId: string;
  topic?: string;
  subject?: string;
  timestamp?: any;
  quizScore?: number;
  masteryScore?: number;
  durationMinutes?: number;
}

interface AdminNotebookDoc {
  id: string;
  userId: string;
  title?: string;
  subject?: string;
  createdAt?: string;
}

interface PaymentRequestDoc {
  id: string;
  userId: string;
  userEmail: string;
  displayName?: string;
  paymentMethod: string;
  accountNumber?: string;
  senderName: string;
  senderPhone?: string;
  transactionId: string;
  receiptImage?: string;
  plan?: string;
  amount?: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ currentUser, onNavigateHome }) => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loadingAdmin, setLoadingAdmin] = useState<boolean>(true);

  // Tab State
  const [activeTab, setActiveTab] = useState<'overview' | 'payments'>('payments');

  // Dashboard Data State
  const [users, setUsers] = useState<AdminUserDoc[]>([]);
  const [sessions, setSessions] = useState<AdminSessionDoc[]>([]);
  const [notebooks, setNotebooks] = useState<AdminNotebookDoc[]>([]);
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequestDoc[]>([]);
  const [loadingData, setLoadingData] = useState<boolean>(false);
  const [indexNotice, setIndexNotice] = useState<string | null>(null);
  const [approvalNotice, setApprovalNotice] = useState<string | null>(null);

  // Receipt Preview Lightbox
  const [viewingReceipt, setViewingReceipt] = useState<PaymentRequestDoc | null>(null);

  // Filters & Pagination
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'lastActive' | 'studyTime'>('lastActive');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  // Selected User Drawer & Moderation
  const [selectedUser, setSelectedUser] = useState<AdminUserDoc | null>(null);
  const [selectedUserSessions, setSelectedUserSessions] = useState<AdminSessionDoc[]>([]);
  const [selectedUserNotebooks, setSelectedUserNotebooks] = useState<AdminNotebookDoc[]>([]);
  const [isConfirmingSuspend, setIsConfirmingSuspend] = useState<boolean>(false);
  const [actionProcessing, setActionProcessing] = useState<boolean>(false);

  const [claimingAdmin, setClaimingAdmin] = useState<boolean>(false);

  const handleClaimAdminAccess = async () => {
    if (!currentUser) return;
    setClaimingAdmin(true);
    const success = await grantAdminRights(currentUser.uid);
    if (success) {
      setIsAdmin(true);
    }
    setClaimingAdmin(false);
  };

  // 1. Verify Admin Status
  useEffect(() => {
    let isMounted = true;
    const verifyAdmin = async () => {
      if (!currentUser) {
        if (isMounted) {
          setIsAdmin(false);
          setLoadingAdmin(false);
        }
        return;
      }

      setLoadingAdmin(true);
      const adminVerified = await checkIsAdmin(currentUser.uid);
      if (isMounted) {
        setIsAdmin(adminVerified);
        setLoadingAdmin(false);
      }
    };

    verifyAdmin();
    return () => {
      isMounted = false;
    };
  }, [currentUser]);

  // 2. Fetch Live Admin Data
  const fetchAdminData = async () => {
    if (!isAdmin) return;
    setLoadingData(true);
    setIndexNotice(null);

    try {
      // Fetch Users
      const usersSnap = await getDocs(collection(db, 'users'));
      const fetchedUsers: AdminUserDoc[] = usersSnap.docs.map(docSnap => ({
        id: docSnap.id,
        email: docSnap.data().email || 'No email',
        displayName: docSnap.data().displayName || 'Anonymous User',
        totalStudyTime: docSnap.data().totalStudyTime || 0,
        lastActive: docSnap.data().lastActive || docSnap.data().updatedAt || new Date().toISOString(),
        disabled: Boolean(docSnap.data().disabled),
        analysesUsed: docSnap.data().analysesUsed || 0,
        createdAt: docSnap.data().createdAt || ''
      }));
      setUsers(fetchedUsers);

      // Fetch Payment Requests (JazzCash / EasyPaisa / Card)
      try {
        const paySnap = await getDocs(collection(db, 'payment_requests'));
        const fetchedReqs: PaymentRequestDoc[] = paySnap.docs.map(docSnap => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<PaymentRequestDoc, 'id'>)
        }));
        fetchedReqs.sort((a, b) => new Date(b.submittedAt || 0).getTime() - new Date(a.submittedAt || 0).getTime());
        setPaymentRequests(fetchedReqs);
      } catch (err) {
        console.warn("Payment requests fetch warning:", err);
      }

      // Fetch All Sessions (collectionGroup)
      try {
        const sessionsSnap = await getDocs(collectionGroup(db, 'sessions'));
        const fetchedSessions: AdminSessionDoc[] = sessionsSnap.docs.map(docSnap => ({
          id: docSnap.id,
          userId: docSnap.data().userId || docSnap.ref.parent.parent?.id || 'unknown',
          topic: docSnap.data().topic || 'General Topic',
          subject: docSnap.data().subject || 'General',
          timestamp: docSnap.data().timestamp || new Date().toISOString(),
          quizScore: docSnap.data().quizScore || 0,
          masteryScore: docSnap.data().masteryScore || 0,
          durationMinutes: docSnap.data().durationMinutes || 0
        }));
        setSessions(fetchedSessions);
      } catch (err: any) {
        console.warn("Sessions collectionGroup fetch warning:", err);
        if (err?.message && err.message.includes("index")) {
          setIndexNotice("Firestore index required for optimized session queries. Click the URL in browser console logs to generate it.");
        }
      }

      // Fetch All Notebooks (collectionGroup)
      try {
        const notebooksSnap = await getDocs(collectionGroup(db, 'notebooks'));
        const fetchedNotebooks: AdminNotebookDoc[] = notebooksSnap.docs.map(docSnap => ({
          id: docSnap.id,
          userId: docSnap.data().userId || docSnap.ref.parent.parent?.id || 'unknown',
          title: docSnap.data().title || 'Untitled Notebook',
          subject: docSnap.data().subject || 'General',
          createdAt: docSnap.data().createdAt || new Date().toISOString()
        }));
        setNotebooks(fetchedNotebooks);
      } catch (err: any) {
        console.warn("Notebooks collectionGroup fetch warning:", err);
      }
    } catch (err) {
      console.error("Error loading admin data:", err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchAdminData();
    }
  }, [isAdmin]);

  // Handle One-Click Pro Activation by Admin
  const handleApprovePayment = async (req: PaymentRequestDoc) => {
    setActionProcessing(true);
    try {
      // 1. Activate Pro in user document in Firestore
      await setUserProStatusByUid(req.userId, true);

      // 2. Mark request as approved
      await setDoc(doc(db, 'payment_requests', req.id), {
        status: 'approved',
        approvedAt: new Date().toISOString()
      }, { merge: true });

      // 3. Update local state
      setPaymentRequests(prev => prev.map(p => p.id === req.id ? { ...p, status: 'approved' } : p));
      setApprovalNotice(`⚡ Pro status successfully activated for ${req.userEmail} (${req.displayName})!`);
      setTimeout(() => setApprovalNotice(null), 6000);
    } catch (err) {
      console.error("Error approving payment request:", err);
    } finally {
      setActionProcessing(false);
    }
  };

  const handleRejectPayment = async (req: PaymentRequestDoc) => {
    setActionProcessing(true);
    try {
      await setDoc(doc(db, 'payment_requests', req.id), {
        status: 'rejected',
        rejectedAt: new Date().toISOString()
      }, { merge: true });

      setPaymentRequests(prev => prev.map(p => p.id === req.id ? { ...p, status: 'rejected' } : p));
    } catch (err) {
      console.error("Error rejecting payment request:", err);
    } finally {
      setActionProcessing(false);
    }
  };

  // Drawer details handler
  const handleSelectUser = (userDoc: AdminUserDoc) => {
    setSelectedUser(userDoc);
    const userSess = sessions.filter(s => s.userId === userDoc.id);
    const userNotes = notebooks.filter(n => n.userId === userDoc.id);
    setSelectedUserSessions(userSess);
    setSelectedUserNotebooks(userNotes);
  };

  // Suspend / Reinstate Handler
  const handleToggleSuspend = async () => {
    if (!selectedUser) return;
    setActionProcessing(true);
    const newStatus = !selectedUser.disabled;

    try {
      await setUserDisabled(selectedUser.id, newStatus);
      setUsers(prev => prev.map(u => u.id === selectedUser.id ? { ...u, disabled: newStatus } : u));
      setSelectedUser(prev => prev ? { ...prev, disabled: newStatus } : null);
      setIsConfirmingSuspend(false);
    } catch (err) {
      console.error("Failed to update user status:", err);
    } finally {
      setActionProcessing(false);
    }
  };

  // Calculations for Metrics
  const totalUsersCount = users.length;
  const pendingPaymentsCount = paymentRequests.filter(p => p.status === 'pending').length;
  
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const activeUsersCount = users.filter(u => {
    if (!u.lastActive) return false;
    const activeDate = new Date(u.lastActive);
    return activeDate >= sevenDaysAgo;
  }).length;

  const totalSessionsCount = sessions.length;
  const totalNotebooksCount = notebooks.length;

  // 30 Days Session Trend Computation
  const getSessionsTrendData = () => {
    const daysMap: Record<string, number> = {};
    const now = new Date();
    
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      daysMap[key] = 0;
    }

    sessions.forEach(s => {
      if (!s.timestamp) return;
      let dateObj: Date;
      if (typeof s.timestamp === 'string') {
        dateObj = new Date(s.timestamp);
      } else if (s.timestamp?.toDate) {
        dateObj = s.timestamp.toDate();
      } else {
        dateObj = new Date(s.timestamp);
      }

      if (!isNaN(dateObj.getTime())) {
        const key = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (daysMap[key] !== undefined) {
          daysMap[key] += 1;
        }
      }
    });

    return Object.keys(daysMap).map(key => ({
      date: key,
      sessions: daysMap[key]
    }));
  };

  // Top Subjects Bar Chart Data
  const getTopSubjectsData = () => {
    const subjectCounts: Record<string, number> = {};
    sessions.forEach(s => {
      const subj = s.subject || 'General';
      subjectCounts[subj] = (subjectCounts[subj] || 0) + 1;
    });

    const sorted = Object.entries(subjectCounts)
      .map(([subject, count]) => ({ subject, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    return sorted.length > 0 ? sorted : [{ subject: 'General', count: sessions.length }];
  };

  // Filter & Sort Users
  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (u.displayName && u.displayName.toLowerCase().includes(searchQuery.toLowerCase()))
  ).sort((a, b) => {
    if (sortBy === 'studyTime') {
      return (b.totalStudyTime || 0) - (a.totalStudyTime || 0);
    }
    const dateA = new Date(a.lastActive || 0).getTime();
    const dateB = new Date(b.lastActive || 0).getTime();
    return dateB - dateA;
  });

  const totalPages = Math.ceil(filteredUsers.length / pageSize) || 1;
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // --- RENDERING ACCESS DENIED STATE ---
  if (loadingAdmin) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100 p-6">
        <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
        <p className="text-sm font-bold tracking-widest uppercase text-slate-400">Verifying Administrator Privileges...</p>
      </div>
    );
  }

  if (isAdmin === false) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12 flex flex-col items-center justify-center">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black tracking-tight text-white">
              {currentUser?.email?.toLowerCase() === 'ayaicrypcoin@gmail.com' ? 'Admin Access Setup' : 'Access Denied'}
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              {currentUser?.email?.toLowerCase() === 'ayaicrypcoin@gmail.com' ? (
                <>Account (<span className="text-indigo-400 font-mono">{currentUser?.email}</span>) is ready to claim administrator privileges in Firestore.</>
              ) : (
                <>Your account (<span className="text-indigo-400 font-mono">{currentUser?.email || 'Guest'}</span>) does not have administrator privileges.</>
              )}
            </p>
          </div>

          {currentUser?.email?.toLowerCase() === 'ayaicrypcoin@gmail.com' ? (
            <div className="space-y-3">
              <button
                onClick={handleClaimAdminAccess}
                disabled={claimingAdmin}
                className="w-full py-4 bg-gradient-to-r from-rose-600 via-indigo-600 to-purple-600 hover:opacity-90 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/30"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{claimingAdmin ? 'Granting Privileges...' : '⚡ Grant Admin Rights to My Account'}</span>
              </button>
              <p className="text-[11px] text-slate-500">
                Clicking this will automatically create your admin credential in Firestore.
              </p>
            </div>
          ) : (
            <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4 text-left text-[11px] text-slate-400 space-y-1.5">
              <p className="font-bold text-slate-300">Restricted Access</p>
              <p>Only authorized administrators are allowed to access the control center.</p>
            </div>
          )}

          <button
            onClick={onNavigateHome}
            className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to App</span>
          </button>
        </div>
      </div>
    );
  }

  // --- RENDERING ADMIN DASHBOARD ---
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-full font-black text-[10px] uppercase tracking-widest flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
              Verified Admin & Payment Moderation Center
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
            Admin Control Center
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Verify JazzCash / EasyPaisa receipts on <span className="text-emerald-400 font-mono font-bold">0325-3253030</span>, activate Pro subscriptions with one click, and inspect live usage analytics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchAdminData}
            disabled={loadingData}
            className="px-4 py-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl text-xs font-bold text-slate-300 flex items-center gap-2 transition-all cursor-pointer"
          >
            <RefreshCw className={cn("w-4 h-4 text-indigo-400", loadingData && "animate-spin")} />
            <span>Refresh Data</span>
          </button>

          <button
            onClick={onNavigateHome}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/20"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Exit Dashboard</span>
          </button>
        </div>
      </div>

      {/* Navigation Tab Bar */}
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-800/80 pb-4">
        <button
          onClick={() => setActiveTab('payments')}
          className={cn(
            "px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2.5 relative",
            activeTab === 'payments'
              ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/25"
              : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
          )}
        >
          <Smartphone className="w-4 h-4 text-amber-300" />
          <span>Payment Proofs & Pro Activation (0325-3253030)</span>
          {pendingPaymentsCount > 0 && (
            <span className="bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-full text-[10px] font-black animate-pulse">
              {pendingPaymentsCount} Pending
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('overview')}
          className={cn(
            "px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2",
            activeTab === 'overview'
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/25"
              : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
          )}
        >
          <BarChart2 className="w-4 h-4" />
          <span>Overview Analytics & User Management</span>
        </button>
      </div>

      {/* Success Notification Banner */}
      {approvalNotice && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 text-emerald-300 text-xs font-bold flex items-center gap-3 animate-fade-in shadow-xl shadow-emerald-500/10">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <p className="flex-1">{approvalNotice}</p>
          <button onClick={() => setApprovalNotice(null)} className="p-1 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Index Notice Banner */}
      {indexNotice && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 text-amber-300 text-xs flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          <p>{indexNotice}</p>
        </div>
      )}

      {/* TAB 1: PAYMENT PROOFS & PRO ACTIVATION */}
      {activeTab === 'payments' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 rounded-[2.5rem] p-6 md:p-8 space-y-6 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-indigo-500/20">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 bg-red-600 text-white rounded-md text-[10px] font-black uppercase">JazzCash</span>
                  <span className="px-2.5 py-0.5 bg-emerald-600 text-white rounded-md text-[10px] font-black uppercase">EasyPaisa</span>
                  <span className="text-amber-400 font-mono font-bold text-xs">0325-3253030</span>
                </div>
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                  Pending JazzCash & EasyPaisa Payment Submissions
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Review submitted Transaction IDs (TIDs) and receipt screenshots. Click <span className="text-emerald-400 font-bold">Approve & Activate Pro</span> to instantly grant Pro features to the user!
                </p>
              </div>

              <div className="px-4 py-2 bg-slate-950/80 border border-indigo-500/30 rounded-2xl text-center shrink-0">
                <span className="text-[10px] font-black uppercase text-indigo-300 block">Account Number</span>
                <span className="text-lg font-mono font-black text-amber-400">0325-3253030</span>
              </div>
            </div>

            {/* Submissions Table / List */}
            {paymentRequests.length === 0 ? (
              <div className="py-16 text-center space-y-3 bg-slate-950/60 border border-indigo-500/20 rounded-3xl p-6">
                <Smartphone className="w-12 h-12 text-slate-600 mx-auto" />
                <h4 className="text-base font-bold text-slate-300">No Payment Submissions Found</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  When users submit payment proof via JazzCash / EasyPaisa (0325-3253030) or card in the Upgrade Modal, their requests will appear here for one-click verification.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {paymentRequests.map((req, rIdx) => {
                  const isPending = req.status === 'pending';
                  const isApproved = req.status === 'approved';
                  const isRejected = req.status === 'rejected';

                  return (
                    <div
                      key={req.id ? `pay-req-${req.id}-${rIdx}` : `pay-req-idx-${rIdx}`}
                      className={cn(
                        "p-5 rounded-3xl border transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-5 shadow-xl",
                        isPending ? "bg-slate-950/90 border-amber-500/40 shadow-amber-500/5" :
                        isApproved ? "bg-slate-950/60 border-emerald-500/30" : "bg-slate-950/40 border-rose-500/20 opacity-70"
                      )}
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1">
                        {/* Receipt Thumbnail */}
                        {req.receiptImage ? (
                          <div 
                            onClick={() => setViewingReceipt(req)}
                            className="w-16 h-16 rounded-2xl border border-indigo-500/30 overflow-hidden bg-slate-900 shrink-0 cursor-pointer group relative shadow-md"
                            title="Click to view full receipt"
                          >
                            <img src={req.receiptImage} alt="Receipt" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                            <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <Eye className="w-5 h-5 text-white" />
                            </div>
                          </div>
                        ) : (
                          <div className="w-16 h-16 rounded-2xl border border-slate-800 bg-slate-900/60 flex items-center justify-center shrink-0 text-slate-600">
                            <ImageIcon className="w-6 h-6" />
                          </div>
                        )}

                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={cn(
                              "px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider",
                              req.paymentMethod === 'JazzCash' ? "bg-red-600 text-white" :
                              req.paymentMethod === 'EasyPaisa' ? "bg-emerald-600 text-white" : "bg-indigo-600 text-white"
                            )}>
                              {req.paymentMethod}
                            </span>

                            <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                              TID: {req.transactionId}
                            </span>

                            <span className={cn(
                              "px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border",
                              isPending ? "bg-amber-500/10 text-amber-400 border-amber-500/30 animate-pulse" :
                              isApproved ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" :
                              "bg-rose-500/10 text-rose-400 border-rose-500/30"
                            )}>
                              {req.status}
                            </span>
                          </div>

                          <h4 className="text-sm font-black text-white flex items-center gap-2 pt-1">
                            <span>{req.displayName || req.senderName}</span>
                            <span className="text-xs font-normal text-slate-400">({req.userEmail})</span>
                          </h4>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400 font-medium">
                            <span>Sender: <strong className="text-slate-200">{req.senderName}</strong></span>
                            {req.senderPhone && req.senderPhone !== 'N/A' && <span>Phone: <strong className="text-slate-200">{req.senderPhone}</strong></span>}
                            <span>Amount: <strong className="text-emerald-400">{req.amount || 'Rs. 1,000 / $3.99'}</strong></span>
                            <span>Submitted: <span className="text-slate-300">{new Date(req.submittedAt).toLocaleString()}</span></span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-800">
                        {req.receiptImage && (
                          <button
                            onClick={() => setViewingReceipt(req)}
                            className="px-3 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-indigo-400" />
                            <span>View Receipt</span>
                          </button>
                        )}

                        {isApproved ? (
                          <button
                            onClick={() => handleRejectPayment(req)}
                            disabled={actionProcessing}
                            className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                          >
                            Revoke Pro
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => handleRejectPayment(req)}
                              disabled={actionProcessing}
                              className="px-3.5 py-2 bg-slate-900 border border-slate-800 hover:bg-rose-600/20 hover:text-rose-400 text-slate-400 rounded-xl font-bold text-xs transition-all cursor-pointer"
                            >
                              Reject
                            </button>

                            <button
                              onClick={() => handleApprovePayment(req)}
                              disabled={actionProcessing}
                              className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:opacity-90 text-white rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-lg shadow-emerald-600/25 cursor-pointer"
                            >
                              <Zap className="w-4 h-4 fill-amber-300 text-amber-300" />
                              <span>Activate Pro Access</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: OVERVIEW ANALYTICS & USER MANAGEMENT */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Overview Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Registered Users</span>
                <div className="w-10 h-10 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-black text-white tracking-tight">{totalUsersCount}</div>
              <p className="text-[11px] text-slate-500 mt-2 font-medium">Grounded in `users` collection</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Active (7 Days)</span>
                <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center">
                  <Activity className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-black text-white tracking-tight">{activeUsersCount}</div>
              <p className="text-[11px] text-slate-500 mt-2 font-medium">
                {totalUsersCount > 0 ? `${Math.round((activeUsersCount / totalUsersCount) * 100)}% active rate` : '0% active'}
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Study Sessions</span>
                <div className="w-10 h-10 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-black text-white tracking-tight">{totalSessionsCount}</div>
              <p className="text-[11px] text-slate-500 mt-2 font-medium">Across all student subcollections</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Notebooks Created</span>
                <div className="w-10 h-10 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-2xl flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-black text-white tracking-tight">{totalNotebooksCount}</div>
              <p className="text-[11px] text-slate-500 mt-2 font-medium">Multi-source grounded workspaces</p>
            </div>
          </div>

          {/* Analytics Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sessions Activity Trend */}
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">Study Sessions Trend (Last 14 Days)</h3>
                    <p className="text-xs text-slate-400">Aggregated real session timestamps from collectionGroup</p>
                  </div>
                </div>
              </div>

              <div className="h-64 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={getSessionsTrendData()}>
                    <defs>
                      <linearGradient id="sessionColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} allowDecimals={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '1rem', color: '#f8fafc', fontSize: '12px' }}
                    />
                    <Area type="monotone" dataKey="sessions" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#sessionColor)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Topics / Subjects Bar Chart */}
            <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 space-y-4 shadow-xl flex flex-col justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl flex items-center justify-center">
                  <BarChart2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Top Subjects</h3>
                  <p className="text-xs text-slate-400">Most frequent subjects in sessions</p>
                </div>
              </div>

              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getTopSubjectsData()} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                    <XAxis type="number" stroke="#64748b" fontSize={11} allowDecimals={false} />
                    <YAxis dataKey="subject" type="category" stroke="#94a3b8" fontSize={10} width={80} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '1rem', color: '#f8fafc', fontSize: '12px' }}
                    />
                    <Bar dataKey="count" fill="#a855f7" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* User Management Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 md:p-8 space-y-6 shadow-2xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-400" />
                  Registered User Management
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Inspect user activity, session history, and enforce security moderation flags.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {/* Search Input */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder="Search user by email or name..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-full sm:w-64"
                  />
                </div>

                {/* Sort Toggle */}
                <div className="flex items-center bg-slate-950 border border-slate-800 rounded-2xl p-1 text-xs">
                  <button
                    onClick={() => setSortBy('lastActive')}
                    className={cn(
                      "px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer text-[11px]",
                      sortBy === 'lastActive' ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
                    )}
                  >
                    Recent Active
                  </button>
                  <button
                    onClick={() => setSortBy('studyTime')}
                    className={cn(
                      "px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer text-[11px]",
                      sortBy === 'studyTime' ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
                    )}
                  >
                    Study Time
                  </button>
                </div>
              </div>
            </div>

            {/* Table Container */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-[11px] font-black uppercase tracking-widest text-slate-500">
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Total Study Time</th>
                    <th className="py-3 px-4">Last Active</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs">
                  {paginatedUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-500">
                        No users match your filter query.
                      </td>
                    </tr>
                  ) : (
                    paginatedUsers.map((u, uIdx) => {
                      const minutes = u.totalStudyTime || 0;
                      const formattedTime = minutes >= 60 ? `${(minutes / 60).toFixed(1)} hrs` : `${minutes} mins`;
                      const activeDate = u.lastActive ? new Date(u.lastActive).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A';

                      return (
                        <tr key={u.id ? `usr-${u.id}-${uIdx}` : `usr-idx-${uIdx}`} className="hover:bg-slate-800/40 transition-colors group">
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-black flex items-center justify-center text-xs shrink-0">
                                {(u.displayName || u.email || 'U')[0].toUpperCase()}
                              </div>
                              <div>
                                <p className="font-bold text-white group-hover:text-indigo-300 transition-colors">
                                  {u.displayName}
                                </p>
                                <p className="text-[11px] text-slate-400 font-mono">{u.email}</p>
                              </div>
                            </div>
                          </td>

                          <td className="py-4 px-4 font-bold text-slate-200">
                            {formattedTime}
                          </td>

                          <td className="py-4 px-4 text-slate-400 text-[11px]">
                            {activeDate}
                          </td>

                          <td className="py-4 px-4">
                            {u.disabled ? (
                              <span className="px-2.5 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1 w-max">
                                <UserX className="w-3 h-3" /> Suspended
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1 w-max">
                                <UserCheck className="w-3 h-3" /> Active
                              </span>
                            )}
                          </td>

                          <td className="py-4 px-4 text-right flex items-center justify-end gap-2">
                            <button
                              onClick={() => setUserProStatusByUid(u.id, true).then(() => fetchAdminData())}
                              className="px-2.5 py-1.5 bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white rounded-xl font-bold text-[11px] transition-all cursor-pointer"
                              title="Directly Grant Pro Access"
                            >
                              ⚡ Make Pro
                            </button>

                            <button
                              onClick={() => handleSelectUser(u)}
                              className="px-3 py-1.5 bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white rounded-xl font-bold text-xs transition-all cursor-pointer"
                            >
                              Inspect
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs text-slate-400">
              <div>
                Showing Page <span className="font-bold text-white">{currentPage}</span> of <span className="font-bold text-white">{totalPages}</span> ({filteredUsers.length} total)
              </div>

              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  className="p-2 bg-slate-950 border border-slate-800 rounded-xl disabled:opacity-40 hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  className="p-2 bg-slate-950 border border-slate-800 rounded-xl disabled:opacity-40 hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RECEIPT LIGHTBOX MODAL */}
      {viewingReceipt && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[70] flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 max-w-xl w-full space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="font-black text-white text-base">Payment Receipt Proof</h3>
                <p className="text-xs text-slate-400">TID: <span className="font-mono text-amber-400 font-bold">{viewingReceipt.transactionId}</span> | {viewingReceipt.paymentMethod}</p>
              </div>
              <button
                onClick={() => setViewingReceipt(null)}
                className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto rounded-2xl border border-slate-800 bg-slate-950 p-2 flex items-center justify-center">
              <img src={viewingReceipt.receiptImage} alt="Payment Receipt Screenshot" className="max-w-full max-h-[55vh] object-contain rounded-xl" />
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <span className="text-xs text-slate-400 font-medium">User: <strong className="text-white">{viewingReceipt.userEmail}</strong></span>

              {viewingReceipt.status !== 'approved' && (
                <button
                  onClick={() => {
                    handleApprovePayment(viewingReceipt);
                    setViewingReceipt(null);
                  }}
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-indigo-600 hover:opacity-90 text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                  <span>Approve & Activate Pro Now</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* USER DETAIL & MODERATION DRAWER */}
      {selectedUser && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex justify-end">
          <div className="bg-slate-900 border-l border-slate-800 w-full max-w-xl h-full p-6 md:p-8 overflow-y-auto space-y-6 shadow-2xl flex flex-col justify-between">
            <div className="space-y-6">
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-6 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 font-black flex items-center justify-center text-lg">
                    {(selectedUser.displayName || selectedUser.email)[0].toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">{selectedUser.displayName}</h3>
                    <p className="text-xs text-slate-400 font-mono">{selectedUser.email}</p>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">UID: {selectedUser.id}</p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedUser(null)}
                  className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-xl transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status Banner & Action */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">Account Moderation</span>
                  <p className="text-xs font-bold text-slate-200 mt-0.5">
                    {selectedUser.disabled ? 'Account is currently SUSPENDED' : 'Account is ACTIVE'}
                  </p>
                </div>

                {selectedUser.disabled ? (
                  <button
                    onClick={handleToggleSuspend}
                    disabled={actionProcessing}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Reinstate User</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setIsConfirmingSuspend(true)}
                    disabled={actionProcessing}
                    className="px-4 py-2 bg-rose-600/20 border border-rose-500/30 text-rose-400 hover:bg-rose-600 hover:text-white rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all"
                  >
                    <UserX className="w-4 h-4" />
                    <span>Suspend User</span>
                  </button>
                )}
              </div>

              {/* Session History Section */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-400" />
                  Study Session History ({selectedUserSessions.length})
                </h4>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {selectedUserSessions.length === 0 ? (
                    <div className="p-4 bg-slate-950/60 border border-slate-800/60 rounded-2xl text-center text-xs text-slate-500">
                      No study sessions recorded for this user.
                    </div>
                  ) : (
                    selectedUserSessions.map((s, sIdx) => (
                      <div key={s.id ? `admin-sess-${s.id}-${sIdx}` : `admin-sess-idx-${sIdx}`} className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs space-y-1">
                        <div className="flex items-center justify-between font-bold text-slate-200">
                          <span>{s.topic}</span>
                          <span className="text-indigo-400 text-[10px] uppercase font-mono">{s.subject}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
                          <span>Score: {s.quizScore}% | Mastery: {s.masteryScore}%</span>
                          <span>{s.durationMinutes} mins</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Notebooks Section */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-purple-400" />
                  Created Notebooks ({selectedUserNotebooks.length})
                </h4>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {selectedUserNotebooks.length === 0 ? (
                    <div className="p-4 bg-slate-950/60 border border-slate-800/60 rounded-2xl text-center text-xs text-slate-500">
                      No notebooks created by this user.
                    </div>
                  ) : (
                    selectedUserNotebooks.map((n, nIdx) => (
                      <div key={n.id ? `admin-nb-${n.id}-${nIdx}` : `admin-nb-idx-${nIdx}`} className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs flex items-center justify-between">
                        <span className="font-bold text-slate-200">{n.title}</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-lg border border-purple-500/20">
                          {n.subject}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedUser(null)}
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all cursor-pointer mt-4"
            >
              Close Drawer
            </button>
          </div>
        </div>
      )}

      {/* CONFIRMATION SUSPEND MODAL */}
      {isConfirmingSuspend && selectedUser && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[60] flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 max-w-md w-full space-y-6 shadow-2xl">
            <div className="w-14 h-14 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-2xl flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-black text-white">Suspend User Account?</h3>
              <p className="text-xs text-slate-400">
                Are you sure you want to suspend <span className="text-white font-bold">{selectedUser.email}</span>?
              </p>
              <p className="text-[11px] text-rose-400 bg-rose-500/10 p-3 rounded-xl border border-rose-500/20 font-medium">
                This writes <code className="font-mono">disabled: true</code> to their Firestore document. The user will be automatically logged out and blocked from creating or modifying data.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setIsConfirmingSuspend(false)}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-2xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleToggleSuspend}
                disabled={actionProcessing}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-rose-600/30"
              >
                {actionProcessing ? 'Processing...' : 'Confirm Suspend'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
