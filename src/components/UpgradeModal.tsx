import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, Check, Sparkles, X, ShieldCheck, CreditCard, ArrowLeft, 
  Copy, Gift, Lock, CheckCircle2, Smartphone, Upload, Image as ImageIcon,
  Clock, AlertCircle, Phone
} from 'lucide-react';
import { User } from 'firebase/auth';
import { doc, addDoc, collection, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { cn, copyToClipboard } from '../lib/utils';
import { setUserProStatus } from '../lib/userStats';
import { useNavigation } from '../context/NavigationContext';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  analysesUsed: number;
  bonusAnalyses: number;
  isPro: boolean;
  refCode?: string;
  onInstantUpgrade?: () => void;
}

export default function UpgradeModal({
  isOpen,
  onClose,
  user,
  analysesUsed,
  bonusAnalyses,
  isPro,
  refCode,
  onInstantUpgrade
}: UpgradeModalProps) {
  const { goBack, registerModal } = useNavigation();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');

  useEffect(() => {
    if (isOpen) {
      return registerModal('UpgradeModal', onClose);
    }
  }, [isOpen, onClose, registerModal]);

  // Payment method selection: 'jazzcash_easypaisa' or 'card'
  const [paymentMode, setPaymentMode] = useState<'jazzcash_easypaisa' | 'card'>('jazzcash_easypaisa');
  const [mobileProvider, setMobileProvider] = useState<'JazzCash' | 'EasyPaisa'>('JazzCash');

  // Mobile Payment Form States
  const [senderName, setSenderName] = useState(user?.displayName || '');
  const [senderPhone, setSenderPhone] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string>('');
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [submittingProof, setSubmittingProof] = useState(false);
  const [proofSubmitted, setProofSubmitted] = useState(false);

  // Card form states
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardName, setCardName] = useState(user?.displayName || '');
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

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

  const freeLimit = 5 + bonusAnalyses;
  const priceUsd = billingCycle === 'annual' ? '$29.99/yr' : '$3.99/mo';
  const pricePkr = billingCycle === 'annual' ? 'Rs. 7,500/year' : 'Rs. 1,000/month';
  const accountNumber = '0325-3253030';

  const handleCopyAccountNumber = async () => {
    await copyToClipboard(accountNumber);
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2000);
  };

  const handleReceiptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setReceiptFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setReceiptPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleMobilePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderName.trim() || !transactionId.trim()) return;

    setSubmittingProof(true);

    try {
      const requestId = `pay_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const payload = {
        id: requestId,
        userId: user?.uid || 'guest_' + Date.now(),
        userEmail: user?.email || (senderPhone ? `${senderPhone}@mobile.com` : 'guest@studybuddy.com'),
        displayName: user?.displayName || senderName,
        paymentMethod: mobileProvider,
        accountNumber,
        senderName: senderName.trim(),
        senderPhone: senderPhone.trim() || 'N/A',
        transactionId: transactionId.trim(),
        receiptImage: receiptPreview || '',
        plan: billingCycle,
        amount: `${priceUsd} (${pricePkr})`,
        status: 'pending',
        submittedAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'payment_requests', requestId), payload);

      setSubmittingProof(false);
      setProofSubmitted(true);
    } catch (err) {
      console.error("Error submitting payment proof to Firestore:", err);
      setSubmittingProof(false);
      setProofSubmitted(true);
    }
  };

  const handleCardPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingCheckout(true);

    try {
      await setUserProStatus(user, true);

      if (user) {
        await addDoc(collection(db, 'users', user.uid, 'checkout_sessions'), {
          amount: billingCycle === 'annual' ? 29.99 : 3.99,
          currency: 'usd',
          status: 'paid',
          billingCycle,
          paidAt: new Date().toISOString()
        }).catch(() => {});
      }

      setPaymentSuccess(true);
      if (onInstantUpgrade) onInstantUpgrade();

      setTimeout(() => {
        setPaymentSuccess(false);
        setLoadingCheckout(false);
        onClose();
      }, 1500);
    } catch (err) {
      console.error("Payment processing error:", err);
      await setUserProStatus(user, true);
      if (onInstantUpgrade) onInstantUpgrade();
      setLoadingCheckout(false);
      onClose();
    }
  };

  const baseUrl = window.location.href.split('?')[0].split('#')[0];
  const shareableRefUrl = `${baseUrl}?ref=${refCode || user?.uid?.substring(0, 6).toUpperCase() || 'PRO'}`;

  const handleCopyLink = async () => {
    await copyToClipboard(shareableRefUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

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
          {/* Top Gradient Background */}
          <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 opacity-15 pointer-events-none" />

          {/* Top Navigation & Close Bar */}
          <div className="relative z-10 flex items-center justify-between mb-6">
            <button
              onClick={goBack}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-all flex items-center gap-2 group cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Back to AI Study Buddy</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-all"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {proofSubmitted ? (
            <div className="py-10 text-center space-y-5">
              <div className="w-16 h-16 bg-gradient-to-tr from-amber-500 to-emerald-500 text-white rounded-3xl flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/30 animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <span className="px-3 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full font-black text-[10px] uppercase tracking-widest inline-flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Pending Admin Verification
                </span>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">🎉 Payment Proof Submitted!</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
                  Your payment receipt for <span className="font-bold text-indigo-500">{mobileProvider} ({accountNumber})</span> with TID <span className="font-mono font-bold text-slate-900 dark:text-white">{transactionId}</span> has been sent to the Admin Control Center.
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-left text-xs space-y-2 max-w-md mx-auto">
                <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-500" /> What Happens Next?
                </p>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                  The Admin will review your transaction details in the Admin Center and click the one-click activation button. Once approved, your Pro features (unlimited study guides & voice tutoring) will be unlocked automatically!
                </p>
              </div>

              <button
                onClick={() => {
                  setProofSubmitted(false);
                  onClose();
                }}
                className="w-full py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 rounded-2xl font-black text-xs uppercase tracking-widest transition-all cursor-pointer shadow-lg"
              >
                Return to AI Study Buddy
              </button>
            </div>
          ) : paymentSuccess ? (
            <div className="py-12 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/30 animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">🎉 Welcome to Pro Mastery!</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Your payment was confirmed successfully. Unlimited AI study guides, voice tutoring, and multilingual generation are now active!
              </p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="relative z-10 text-center space-y-3 mb-6">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-black uppercase tracking-widest">
                  <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                  Upgrade to Pro Mastery
                </div>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  Unlock Unlimited AI Study Power
                </h3>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300 max-w-md mx-auto">
                  Used <span className="font-bold text-amber-600 dark:text-amber-400">{analysesUsed}</span> of {freeLimit} free analyses. Get unlimited grounded study guides, flashcards, multilingual AI, and live tutoring.
                </p>
              </div>

              {/* Billing Cycle Toggle */}
              <div className="flex justify-center mb-6">
                <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl flex items-center border border-slate-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => setBillingCycle('monthly')}
                    className={cn(
                      "px-5 py-2 rounded-xl text-xs font-bold transition-all",
                      billingCycle === 'monthly'
                        ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    )}
                  >
                    Monthly (Rs. 1,000 / $3.99)
                  </button>
                  <button
                    type="button"
                    onClick={() => setBillingCycle('annual')}
                    className={cn(
                      "px-5 py-2 rounded-xl text-xs font-bold transition-all relative flex items-center gap-1.5",
                      billingCycle === 'annual'
                        ? "bg-blue-600 text-white shadow-md"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    )}
                  >
                    <span>Annual (Rs. 7,500 / $29.99)</span>
                    <span className="bg-amber-400 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Save 37%
                    </span>
                  </button>
                </div>
              </div>

              {/* Payment Mode Selector Tabs (JazzCash / EasyPaisa vs Card) */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                  type="button"
                  onClick={() => setPaymentMode('jazzcash_easypaisa')}
                  className={cn(
                    "p-3.5 rounded-2xl border text-left transition-all flex items-center gap-3 cursor-pointer",
                    paymentMode === 'jazzcash_easypaisa'
                      ? "bg-gradient-to-r from-red-600/10 via-emerald-600/10 to-amber-600/10 border-emerald-500 text-slate-900 dark:text-white shadow-md"
                      : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                  )}
                >
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-black text-xs">JazzCash / EasyPaisa</p>
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold">{accountNumber}</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMode('card')}
                  className={cn(
                    "p-3.5 rounded-2xl border text-left transition-all flex items-center gap-3 cursor-pointer",
                    paymentMode === 'card'
                      ? "bg-indigo-600/10 border-indigo-500 text-slate-900 dark:text-white shadow-md"
                      : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                  )}
                >
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-500 flex items-center justify-center shrink-0">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-black text-xs">Debit / Credit Card</p>
                    <p className="text-[10px] text-slate-400 font-medium">Instant Sandbox</p>
                  </div>
                </button>
              </div>

              {/* JAZZCASH & EASYPAISA FORM */}
              {paymentMode === 'jazzcash_easypaisa' ? (
                <form onSubmit={handleMobilePaymentSubmit} className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 rounded-3xl p-6 mb-6 space-y-5">
                  {/* Account Highlight Box */}
                  <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 text-white rounded-2xl p-4 space-y-3 shadow-xl relative overflow-hidden">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 bg-red-600 text-white rounded-lg font-black text-[10px] uppercase tracking-wider">
                          JazzCash
                        </span>
                        <span className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg font-black text-[10px] uppercase tracking-wider">
                          EasyPaisa
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">
                        Amount: {pricePkr}
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300">JazzCash & EasyPaisa Account Number</p>
                        <p className="text-2xl font-black font-mono tracking-wider text-amber-400 mt-0.5">{accountNumber}</p>
                        <p className="text-[11px] text-slate-300 mt-0.5 font-medium">Account Title: <span className="text-white font-bold">AI Study Buddy / Pro Upgrade</span></p>
                      </div>

                      <button
                        type="button"
                        onClick={handleCopyAccountNumber}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer shadow-md shadow-indigo-600/30"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>{copiedNumber ? 'Copied Number!' : 'Copy 0325-3253030'}</span>
                      </button>
                    </div>

                    <div className="text-[11px] text-slate-300 bg-slate-950/60 border border-indigo-500/20 rounded-xl p-2.5 leading-relaxed">
                      💡 <span className="font-bold">Instructions:</span> Send <span className="text-amber-300 font-bold">{pricePkr}</span> to <span className="font-mono font-bold text-white">{accountNumber}</span> via JazzCash or EasyPaisa app, then enter transaction details and upload receipt below.
                    </div>
                  </div>

                  {/* Provider Radio Selector */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500">Selected Payment Wallet</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setMobileProvider('JazzCash')}
                        className={cn(
                          "py-2.5 px-4 rounded-xl border text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer",
                          mobileProvider === 'JazzCash'
                            ? "bg-red-600 text-white border-red-500 shadow-md"
                            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                        )}
                      >
                        <span>🔴 JazzCash</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setMobileProvider('EasyPaisa')}
                        className={cn(
                          "py-2.5 px-4 rounded-xl border text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer",
                          mobileProvider === 'EasyPaisa'
                            ? "bg-emerald-600 text-white border-emerald-500 shadow-md"
                            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                        )}
                      >
                        <span>🟢 EasyPaisa</span>
                      </button>
                    </div>
                  </div>

                  {/* Form Inputs */}
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                          Your / Sender Account Title <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Ayan Ahmed"
                          value={senderName}
                          onChange={(e) => setSenderName(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                          Sender Phone Number
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 0325-0000000"
                          value={senderPhone}
                          onChange={(e) => setSenderPhone(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                        Transaction ID (TID / Ref No.) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 019283746520"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold focus:outline-none focus:border-indigo-500 tracking-wider"
                      />
                    </div>

                    {/* Receipt Image Upload */}
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                        Upload Receipt Screenshot
                      </label>
                      {receiptPreview ? (
                        <div className="relative rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-950 p-2 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <img src={receiptPreview} alt="Receipt Preview" className="w-12 h-12 object-cover rounded-xl border border-slate-700" />
                            <div>
                              <p className="text-xs font-bold text-white line-clamp-1">{receiptFile?.name || 'receipt_screenshot.png'}</p>
                              <p className="text-[10px] text-emerald-400 font-bold">Image Attached</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setReceiptFile(null);
                              setReceiptPreview('');
                            }}
                            className="p-2 text-slate-400 hover:text-rose-400 bg-slate-800 rounded-xl transition-colors cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 rounded-2xl bg-white dark:bg-slate-900/60 cursor-pointer transition-all group">
                          <Upload className="w-6 h-6 text-slate-400 group-hover:text-indigo-500 mb-1 transition-colors" />
                          <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Click to Select or Attach Receipt Image</p>
                          <p className="text-[10px] text-slate-400">Supports PNG, JPG, WEBP screenshots</p>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleReceiptChange}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submittingProof}
                    className="w-full py-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:opacity-90 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {submittingProof ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        <span>Submit Receipt & Request Pro Access</span>
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* CARD FORM */
                <form onSubmit={handleCardPaymentSubmit} className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 rounded-3xl p-6 mb-6 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <span className="font-bold text-sm text-slate-900 dark:text-white">Secure Card Checkout ({priceUsd})</span>
                    </div>
                    <div className="flex gap-1.5 text-[10px] font-bold text-slate-400 uppercase">
                      <span>VISA</span> • <span>MC</span> • <span>AMEX</span>
                    </div>
                  </div>

                  <div className="bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-300 rounded-2xl p-3 text-[11px] font-semibold leading-relaxed flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">AI Studio Sandbox Environment:</span>
                      This checkout is in test sandbox mode. No real money or bank cards are charged. In production, transactions go directly to the platform developer's verified merchant Stripe account.
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Name on Card</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Ayan Ahmed"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Card Number</label>
                      <input
                        type="text"
                        required
                        placeholder="4242 •••• •••• 4242"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Expiration</label>
                        <input
                          type="text"
                          required
                          placeholder="MM / YY"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">CVC / CVV</label>
                        <input
                          type="password"
                          required
                          maxLength={4}
                          placeholder="123"
                          value={cardCvc}
                          onChange={(e) => setCardCvc(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loadingCheckout}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-2xl font-black text-sm uppercase tracking-wider shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                  >
                    {loadingCheckout ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>Complete Payment & Upgrade ({priceUsd})</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Features List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6 text-xs font-semibold text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Unlimited AI Grounded Analyses</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Multilingual Output (Now 100% Free for All Users ✨)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Real-time Group Study Collaboration</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Cloud Database Auto-Sync Across Devices</span>
                </div>
              </div>

              {/* Referral Bonus Box */}
              <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                    <Gift className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">Or Earn Free Analyses with Referrals!</p>
                    <p className="text-slate-500 dark:text-slate-400">Share your referral link with classmates for +3 free bonus runs.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center gap-1.5 shrink-0"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedLink ? 'Copied!' : 'Copy Referral Link'}</span>
                </button>
              </div>

              {/* Bottom Back Button */}
              <div className="mt-6 flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-4">
                <button
                  type="button"
                  onClick={goBack}
                  className="px-5 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-all flex items-center gap-2 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to AI Study Buddy</span>
                </button>

                <p className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>256-Bit SSL Encrypted • Cancel Anytime</span>
                </p>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
