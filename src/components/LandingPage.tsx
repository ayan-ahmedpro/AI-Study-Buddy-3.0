import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Brain, 
  BookOpen, 
  Mic, 
  Layers, 
  Target, 
  GraduationCap, 
  Award, 
  ArrowRight, 
  CheckCircle2, 
  Star, 
  Zap, 
  ShieldCheck, 
  Globe2, 
  MessageSquare, 
  Map, 
  Play, 
  Users, 
  ChevronRight, 
  BrainCircuit, 
  Flame, 
  Lock, 
  Sun, 
  Moon, 
  User as UserIcon,
  LogOut,
  BarChart2
} from 'lucide-react';
import { User } from 'firebase/auth';
import { cn } from '../lib/utils';
import ThreeBackground from './ThreeBackground';
// @ts-ignore
import heroBgImage from '../assets/images/hero_study_bg_1785260635440.jpg';

interface LandingPageProps {
  user: User | null;
  onOpenAuth: (mode: 'signin' | 'signup') => void;
  onEnterWorkspace: () => void;
  onSignOut: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenUniversityTracker: () => void;
  onOpenScholarshipTracker: () => void;
}

export default function LandingPage({
  user,
  onOpenAuth,
  onEnterWorkspace,
  onSignOut,
  isDarkMode,
  onToggleDarkMode,
  onOpenUniversityTracker,
  onOpenScholarshipTracker,
}: LandingPageProps) {
  const [activeFeatureTab, setActiveFeatureTab] = useState<'voice' | 'notebook' | 'flashcards' | 'quiz' | 'mindmap'>('voice');

  const featureDetails = {
    voice: {
      title: "Real-Time Conversational Voice Teacher",
      description: "Talk directly to your AI tutor using natural voice. Ask questions, interrupt to clarify, and hear age-adapted explanations in real-time.",
      badge: "SOTA Gemini Voice API",
      highlights: ["Adaptive to age (7, 15, 25, 50+)", "Instant spoken feedback", "Handles complex technical equations"],
      accentColor: "from-blue-600 to-indigo-600"
    },
    notebook: {
      title: "Grounded Multi-Source Notebooks",
      description: "Combine PDFs, textbook scans, slide decks, video lessons, and notes into unified intelligence hubs that ground every AI answer in source citations.",
      badge: "Multi-Modal Grounding",
      highlights: ["PDF, Video (MP4/WebM), & Image OCR", "Source excerpt inspection", "Zero hallucination guarantee"],
      accentColor: "from-indigo-600 to-purple-600"
    },
    flashcards: {
      title: "3D Active Recall & Spaced Repetition",
      description: "Auto-generated flashcards with 3D flip physics and SM-2 spaced repetition algorithms so you remember facts right before exams.",
      badge: "Cognitive Science Engine",
      highlights: ["3D card flip animation", "Confidence self-rating (Again, Hard, Good, Easy)", "Memory curve tracking"],
      accentColor: "from-emerald-600 to-teal-600"
    },
    quiz: {
      title: "Adaptive Test Maker & Weakness Detector",
      description: "Create practice exams based on your exact weak areas. Get instant AI grading and step-by-step explanations.",
      badge: "Psychological Analytics",
      highlights: ["Custom MCQ & essay tests", "Weakness radar map", "Targeted study recommendations"],
      accentColor: "from-amber-600 to-orange-600"
    },
    mindmap: {
      title: "Interactive Cognitive Mind Maps",
      description: "Visualize relationships between complex concepts with draggable interactive mind maps and quick node explanations.",
      badge: "Concept Visualizer",
      highlights: ["Auto-structured hierarchy", "Node-level AI breakdown", "Interactive zoom & drag"],
      accentColor: "from-purple-600 to-pink-600"
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfcfb] dark:bg-[#030712] text-slate-950 dark:text-slate-100 font-sans selection:bg-blue-500 selection:text-white transition-colors duration-300">
      
      {/* 1. Header Navigation */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 transition-all">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between gap-4">
          
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={onEnterWorkspace}>
            <div className="w-11 h-11 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20 hover:scale-105 transition-transform">
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-black text-xl tracking-tight text-slate-900 dark:text-white">
                  AI Study <span className="text-blue-600">BUDDY</span>
                </span>
                <span className="px-2 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-[10px] font-black tracking-wider uppercase rounded-md shadow-xs">
                  PRO
                </span>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Multi-Source Grounded Tutor</p>
            </div>
          </div>

          {/* Quick Nav Links */}
          <nav className="hidden lg:flex items-center gap-8 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
            <a href="#features" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">How It Works</a>
            <button onClick={onOpenUniversityTracker} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1.5 cursor-pointer">
              <GraduationCap className="w-4 h-4 text-blue-500" /> Uni Tracker
            </button>
            <button onClick={onOpenScholarshipTracker} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1.5 cursor-pointer">
              <Award className="w-4 h-4 text-amber-500" /> Scholarships
            </button>
            <a href="#testimonials" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Reviews</a>
          </nav>

          {/* Header Action Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleDarkMode}
              className="w-10 h-10 flex items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              title={isDarkMode ? "Light Mode" : "Dark Mode"}
            >
              {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-600" />}
            </button>

            {user ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={onEnterWorkspace}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <BrainCircuit className="w-4 h-4" /> Go To Workspace
                </button>
                <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
                  <img
                    src={user.photoURL || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"}
                    alt={user.displayName || "User"}
                    className="w-9 h-9 rounded-2xl border-2 border-white dark:border-slate-800 shadow-sm object-cover"
                  />
                  <button
                    onClick={onSignOut}
                    className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenAuth('signin')}
                  className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-2xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onOpenAuth('signup')}
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg shadow-blue-500/25 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Sign Up Free
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative pt-12 pb-28 overflow-hidden">
        {/* Interactive 3D Canvas Background */}
        <ThreeBackground isDarkMode={isDarkMode} className="opacity-80 dark:opacity-90" />

        {/* Background Visual Overlay */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-15 dark:opacity-25">
          <img 
            src={heroBgImage} 
            alt="Hero Background" 
            className="w-full h-full object-cover filter blur-[2px]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#fdfcfb] via-transparent to-[#fdfcfb] dark:from-[#030712] dark:via-transparent dark:to-[#030712]" />
        </div>

        {/* Ambient Glowing Orbs */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-tr from-blue-500/20 via-indigo-500/20 to-purple-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center space-y-8">
          
          {/* Status Badge */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-3 px-6 py-2.5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-full border border-blue-500/20 shadow-xl"
          >
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">
              Next-Gen Cognitive Study Protocol
            </span>
            <span className="px-2 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-black rounded-md uppercase">
              v3.8 Live
            </span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-black tracking-tight leading-[0.95] text-slate-950 dark:text-white max-w-5xl mx-auto"
          >
            Study <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600">10x Faster</span> With Grounded AI Intelligence
          </motion.h1>

          {/* Subtitle */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg sm:text-xl md:text-2xl text-slate-600 dark:text-slate-300 font-medium max-w-3xl mx-auto leading-relaxed"
          >
            Turn textbooks, PDFs, lecture videos, and class notes into interactive synthesis, 3D spaced-repetition flashcards, real-time voice tutoring, and custom practice exams.
          </motion.p>

          {/* Call-to-Action Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 max-w-xl mx-auto"
          >
            <button
              onClick={() => onOpenAuth('signup')}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl font-black text-base uppercase tracking-wider shadow-2xl shadow-blue-500/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 cursor-pointer group"
            >
              <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              <span>Start Learning Free</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={onEnterWorkspace}
              className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 hover:border-blue-500 text-slate-900 dark:text-white rounded-2xl font-black text-base uppercase tracking-wider shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current text-blue-600" />
              <span>Explore Demo Mode</span>
            </button>
          </motion.div>

          {/* Social Proof Bar */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-6 text-slate-500 dark:text-slate-400 text-xs font-bold"
          >
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
              <span className="ml-2 text-slate-900 dark:text-white font-black">4.9 / 5.0</span>
            </div>
            <span className="hidden sm:inline opacity-30">•</span>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" />
              <span>Used by 50,000+ students globally</span>
            </div>
            <span className="hidden sm:inline opacity-30">•</span>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Zero Hallucination Grounded AI</span>
            </div>
          </motion.div>

          {/* Hero Feature Showcase Graphic */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="pt-12 max-w-6xl mx-auto"
          >
            <div className="relative rounded-[3rem] p-5 bg-gradient-to-b from-blue-500/20 via-indigo-500/10 to-purple-500/20 dark:from-blue-500/15 dark:via-slate-900/60 dark:to-purple-500/15 border border-white/40 dark:border-slate-800/80 shadow-2xl backdrop-blur-2xl transition-all duration-300 hover:shadow-blue-500/10">
              
              {/* Floating Decorative Badges */}
              <div className="hidden lg:flex absolute -top-5 -left-5 items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-2xl border border-blue-500/40 shadow-xl text-xs font-mono font-bold animate-bounce">
                <BrainCircuit className="w-4 h-4 text-blue-400" />
                <span>3D Neural Field Active</span>
              </div>

              <div className="hidden lg:flex absolute -bottom-5 -right-5 items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl shadow-xl text-xs font-black uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>99.8% Grounded Accuracy</span>
              </div>

              {/* Window Frame Header */}
              <div className="flex items-center justify-between px-6 py-3.5 bg-white/90 dark:bg-slate-900/90 rounded-2xl border border-slate-200/80 dark:border-slate-800 mb-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="ml-3 text-xs font-mono font-bold text-slate-400">ai-study-buddy.app / 3d-workspace</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-3.5 py-1.5 rounded-full border border-blue-200 dark:border-blue-900/50">
                  <Zap className="w-3.5 h-3.5 fill-current animate-pulse text-amber-500" /> Grounded 3D Neural Engine
                </div>
              </div>

              {/* Showcase Grid inside mock workspace */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-left">
                
                {/* Card 1 */}
                <div className="bg-white/90 dark:bg-slate-900/90 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-lg hover:border-blue-500/50 hover:scale-[1.02] transition-all cursor-pointer group">
                  <div className="flex items-center gap-3.5 mb-4">
                    <div className="p-3 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <Mic className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-slate-900 dark:text-white">Live Voice Teacher</h4>
                      <p className="text-[10px] text-blue-600 dark:text-blue-400 font-black uppercase">Bi-directional Speech</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                    "Explain quantum tunneling like I'm 15." — Speaks out loud with age-adapted explanations in real-time.
                  </p>
                </div>

                {/* Card 2 */}
                <div className="bg-white/90 dark:bg-slate-900/90 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-lg hover:border-indigo-500/50 hover:scale-[1.02] transition-all cursor-pointer group">
                  <div className="flex items-center gap-3.5 mb-4">
                    <div className="p-3 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-slate-900 dark:text-white">Multi-Source Notebook</h4>
                      <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-black uppercase">Textbooks, Videos & PDFs</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                    Synthesizes 12 sources simultaneously with exact page citations and zero hallucination guarantee.
                  </p>
                </div>

                {/* Card 3 */}
                <div className="bg-white/90 dark:bg-slate-900/90 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-lg hover:border-emerald-500/50 hover:scale-[1.02] transition-all cursor-pointer group">
                  <div className="flex items-center gap-3.5 mb-4">
                    <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                      <Layers className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-slate-900 dark:text-white">3D Active Recall</h4>
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-black uppercase">Spaced Repetition</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                    Auto-generated 3D flip cards using SM-2 cognitive memory algorithms so facts stay locked in long term.
                  </p>
                </div>

              </div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* 3. Interactive Feature Deep Dive */}
      <section id="features" className="py-24 bg-slate-50 dark:bg-slate-900/50 border-y border-slate-200/60 dark:border-slate-800/60">
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="text-center space-y-4 mb-16">
            <span className="px-4 py-1.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-black text-xs uppercase tracking-widest rounded-full">
              Full Spectrum AI Suite
            </span>
            <h2 className="text-4xl md:text-5xl font-display font-black tracking-tight text-slate-950 dark:text-white">
              Everything You Need To Master Any Subject
            </h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-base font-medium">
              Click any feature module below to preview how AI Study BUDDY transforms study sessions into top grades.
            </p>
          </div>

          {/* Interactive Feature Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {[
              { id: 'voice', label: 'Voice Teacher', icon: Mic },
              { id: 'notebook', label: 'Notebook Hub', icon: BookOpen },
              { id: 'flashcards', label: '3D Flashcards', icon: Layers },
              { id: 'quiz', label: 'Test Maker', icon: Target },
              { id: 'mindmap', label: 'Mind Map', icon: BrainCircuit }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFeatureTab(tab.id as any)}
                className={cn(
                  "px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2.5 cursor-pointer",
                  activeFeatureTab === tab.id 
                    ? "bg-slate-950 dark:bg-white text-white dark:text-slate-950 shadow-xl scale-105" 
                    : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
                )}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Active Tab Showcase Card */}
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 md:p-12 border border-slate-200 dark:border-slate-800 shadow-2xl relative overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              
              <div className="space-y-6">
                <span className="px-4 py-1.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-black uppercase tracking-widest rounded-md">
                  {featureDetails[activeFeatureTab].badge}
                </span>

                <h3 className="text-3xl sm:text-4xl font-display font-black text-slate-950 dark:text-white tracking-tight leading-tight">
                  {featureDetails[activeFeatureTab].title}
                </h3>

                <p className="text-slate-600 dark:text-slate-300 text-base font-medium leading-relaxed">
                  {featureDetails[activeFeatureTab].description}
                </p>

                <div className="space-y-3 pt-2">
                  {featureDetails[activeFeatureTab].highlights.map((h, i) => (
                    <div key={`feat-hl-${activeFeatureTab}-${i}`} className="flex items-center gap-3 text-sm font-bold text-slate-800 dark:text-slate-200">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4">
                  <button
                    onClick={() => onOpenAuth('signup')}
                    className="px-8 py-4 bg-slate-950 dark:bg-white text-white dark:text-slate-950 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl flex items-center gap-3 cursor-pointer"
                  >
                    <span>Try This Feature Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Visual Demo Card */}
              <div className="relative p-8 rounded-[2.5rem] bg-slate-950 text-white overflow-hidden shadow-2xl border border-white/10 group">
                <div className={cn("absolute -top-12 -right-12 w-64 h-64 blur-3xl opacity-30 rounded-full bg-gradient-to-tr", featureDetails[activeFeatureTab].accentColor)} />
                
                <div className="relative z-10 space-y-6">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                      <span className="text-xs font-mono font-bold text-slate-300">SYSTEM RESPONSE PREVIEW</span>
                    </div>
                    <span className="text-[10px] font-black uppercase text-blue-400 bg-blue-500/20 px-3 py-1 rounded-full">
                      Latency &lt; 250ms
                    </span>
                  </div>

                  <div className="p-5 bg-white/5 rounded-2xl border border-white/10 space-y-3">
                    <div className="text-xs text-slate-400 font-bold uppercase tracking-widest">Input Stream</div>
                    <p className="text-sm font-medium italic text-slate-200">
                      "Analyze Chapter 4 on Neural Network Backpropagation and generate flashcards for key formulas."
                    </p>
                  </div>

                  <div className="p-5 bg-blue-600/20 rounded-2xl border border-blue-500/30 space-y-3">
                    <div className="flex items-center gap-2 text-xs text-blue-300 font-bold uppercase tracking-widest">
                      <Sparkles className="w-4 h-4 text-blue-400" /> Output Generated
                    </div>
                    <p className="text-sm font-bold text-white leading-relaxed">
                      "Created 8 synthesis flashcards, 1 interactive quiz, and updated your weak areas: Partial Derivatives chain rule."
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* 4. How It Works - Interactive Step-by-Step Instructions */}
      <section id="how-it-works" className="py-24 bg-slate-900/40 border-t border-slate-200/60 dark:border-slate-800/60">
        <div className="max-w-7xl mx-auto px-6 space-y-16">
          <div className="text-center space-y-4">
            <span className="px-4 py-1.5 bg-sky-500/10 text-sky-600 dark:text-sky-400 font-black text-xs uppercase tracking-widest rounded-full border border-sky-500/20">
              Simple 4-Step Instructions
            </span>
            <h2 className="text-4xl md:text-5xl font-display font-black tracking-tight text-slate-950 dark:text-white">
              How AI Study BUDDY Works
            </h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-base font-medium">
              From uploading multi-source textbooks to discovering 100% fully funded scholarships and top university degree matches.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4 relative overflow-hidden group">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 font-black text-lg flex items-center justify-center border border-blue-500/20">
                01
              </div>
              <h3 className="text-xl font-black text-slate-950 dark:text-white">Upload & Analyze</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                Drop your PDFs, lecture slides, or textbook images into the Engineering Mastery workspace. The grounded Gemini neural engine parses chapters instantly.
              </p>
            </div>

            <div className="p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4 relative overflow-hidden group">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 font-black text-lg flex items-center justify-center border border-purple-500/20">
                02
              </div>
              <h3 className="text-xl font-black text-slate-950 dark:text-white">Adapt & Practice</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                Adjust explanation age from 7 to 50. Generate interactive 3D mind maps, active recall quizzes, audio podcasts, and formula cheat sheets.
              </p>
            </div>

            <div className="p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4 relative overflow-hidden group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black text-lg flex items-center justify-center border border-emerald-500/20">
                03
              </div>
              <h3 className="text-xl font-black text-slate-950 dark:text-white">Match Universities</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                Input your GPA and location (Nepal, Pakistan, US, UK, Global). View real-world top university recommendations, acceptance rates, and export PDF reports.
              </p>
            </div>

            <div className="p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4 relative overflow-hidden group">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 font-black text-lg flex items-center justify-center border border-amber-500/20">
                04
              </div>
              <h3 className="text-xl font-black text-slate-950 dark:text-white">Claim Scholarships</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                Find 100% fully funded merit grants, stipends, and tuition waivers. Save active grants and review step-by-step document preparation guides.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. University & Scholarship Trackers Highlights */}
      <section className="py-20 max-w-7xl mx-auto px-6">
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 rounded-[3.5rem] p-10 md:p-16 text-white shadow-2xl relative overflow-hidden border border-white/10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-xs font-black uppercase tracking-widest">
                <GraduationCap className="w-4 h-4 text-amber-400" /> Beyond Classrooms
              </div>

              <h2 className="text-4xl md:text-5xl font-display font-black tracking-tight leading-tight">
                Global University & Scholarship Hub
              </h2>

              <p className="text-slate-300 font-medium text-base leading-relaxed">
                Track admissions deadlines, acceptance rates, tuition costs, and merit-based grants for top universities worldwide with automated AI application guidance.
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                <button
                  onClick={onOpenUniversityTracker}
                  className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg cursor-pointer"
                >
                  <GraduationCap className="w-4 h-4" /> Explore Universities
                </button>
                <button
                  onClick={onOpenScholarshipTracker}
                  className="px-6 py-3.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-2xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg cursor-pointer"
                >
                  <Award className="w-4 h-4" /> Find Scholarships
                </button>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                <div className="text-3xl md:text-4xl font-display font-black text-amber-400">500+</div>
                <div className="text-xs font-bold text-slate-300 mt-1 uppercase tracking-wider">Top Global Universities</div>
              </div>
              <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                <div className="text-3xl md:text-4xl font-display font-black text-emerald-400">$100M+</div>
                <div className="text-xs font-bold text-slate-300 mt-1 uppercase tracking-wider">Scholarships Listed</div>
              </div>
              <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                <div className="text-3xl md:text-4xl font-display font-black text-blue-400">98.4%</div>
                <div className="text-xs font-bold text-slate-300 mt-1 uppercase tracking-wider">Exam Pass Rate</div>
              </div>
              <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                <div className="text-3xl md:text-4xl font-display font-black text-purple-400">24/7</div>
                <div className="text-xs font-bold text-slate-300 mt-1 uppercase tracking-wider">Instant AI Tutor</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Real Student Reviews */}
      <section id="testimonials" className="py-20 max-w-7xl mx-auto px-6">
        <div className="text-center space-y-4 mb-16">
          <span className="px-4 py-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black text-xs uppercase tracking-widest rounded-full">
            Real Student Results
          </span>
          <h2 className="text-4xl font-display font-black tracking-tight text-slate-950 dark:text-white">
            Loved By Top Performing Students
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              quote: "The voice teacher mode completely saved my Organic Chemistry grade. I can talk through mechanism reactions out loud and get instant corrections.",
              name: "Maya Lin",
              role: "Pre-Med Student, Stanford",
              rating: 5,
              avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"
            },
            {
              quote: "Uploading entire 200-page medical textbooks and asking questions grounded specifically in my syllabus gave me the top score in my class.",
              name: "David Chen",
              role: "Biomedical Engineering, MIT",
              rating: 5,
              avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80"
            },
            {
              quote: "The 3D flashcards with SM-2 spaced repetition meant I only spent 15 minutes a day reviewing and aced my finals without all-nighters.",
              name: "Sophia Rodriguez",
              role: "Law Scholar, Oxford",
              rating: 5,
              avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80"
            }
          ].map((t, idx) => (
            <div key={idx} className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-1">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={`testimonial-star-${idx}-${i}`} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-slate-700 dark:text-slate-300 font-medium text-sm leading-relaxed italic">
                  "{t.quote}"
                </p>
              </div>

              <div className="flex items-center gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-2xl object-cover border-2 border-blue-500/30" />
                <div>
                  <h4 className="font-black text-sm text-slate-900 dark:text-white">{t.name}</h4>
                  <p className="text-xs text-slate-500 font-medium">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Final Call To Action */}
      <section className="py-20 max-w-5xl mx-auto px-6 text-center">
        <div className="p-12 md:p-20 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden">
          <div className="relative z-10 space-y-8">
            <h2 className="text-4xl md:text-6xl font-display font-black tracking-tight max-w-2xl mx-auto">
              Ready To Supercharge Your Grades?
            </h2>
            <p className="text-lg text-blue-100 font-medium max-w-xl mx-auto">
              Create your free account now and start studying smarter with grounded AI.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
              <button
                onClick={() => onOpenAuth('signup')}
                className="px-10 py-5 bg-white text-slate-950 font-black text-lg uppercase tracking-wider rounded-2xl shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                Sign Up Free Now
              </button>
              <button
                onClick={onEnterWorkspace}
                className="px-10 py-5 bg-black/20 hover:bg-black/30 border border-white/20 text-white font-black text-lg uppercase tracking-wider rounded-2xl transition-all cursor-pointer"
              >
                Try Demo Mode
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-200 dark:border-slate-800 text-center text-xs font-bold text-slate-400">
        <p className="uppercase tracking-widest text-slate-500">AI STUDY BUDDY PRO • CREATED BY AYAN AHMED</p>
        <p className="mt-2 font-medium">Built with extreme attention to educational quality & zero hallucination AI.</p>
      </footer>

    </div>
  );
}
