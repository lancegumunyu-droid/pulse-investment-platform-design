'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Lock,
  PieChart,
  Zap,
  Globe,
  ChevronRight,
  CheckCircle2,
  BarChart3,
  Users,
  Award,
  DollarSign
} from 'lucide-react'

// Fade and slide variant generator for Framer Motion
const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      delay: i * 0.1,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
}

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
}

export default function LandingPage() {
  const [depositAmount, setDepositAmount] = useState<number>(10000)
  const [selectedDuration, setSelectedDuration] = useState<number>(12) // months
  const [annualRate] = useState<number>(0.142) // 14.2% projected yield

  // Projected Return Calculation
  const estimatedReturn = Math.round(depositAmount * (1 + annualRate * (selectedDuration / 12)))
  const estimatedProfit = estimatedReturn - depositAmount

  return (
    <div className="relative min-h-screen bg-[#050505] text-[#f4f4f5] selection:bg-[#e8a317]/30 selection:text-[#f0d9a8] overflow-x-hidden">
      {/* Dynamic Background Mesh */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-radial from-[#e8a317]/12 via-transparent to-transparent blur-3xl opacity-70" />
        <div className="absolute top-[40%] right-[-10%] w-[600px] h-[600px] bg-radial from-[#10b981]/08 via-transparent to-transparent blur-3xl opacity-50" />
      </div>

      {/* 1. Floating Luxury Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#050505]/70 border-b border-white/08 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[#e8a317] to-[#e8a317]/60 p-[1px] shadow-lg shadow-[#e8a317]/20">
              <div className="w-full h-full bg-[#0d0d0f] rounded-[11px] flex items-center justify-center">
                <Zap className="w-5 h-5 text-[#e8a317] transition-transform duration-300 group-hover:scale-110" />
              </div>
            </div>
            <span className="font-cooper-medium text-2xl tracking-tight text-white group-hover:text-[#f0d9a8] transition-colors">
              Pulse
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#calculator" className="hover:text-white transition-colors">Yield Calculator</a>
            <a href="#security" className="hover:text-white transition-colors">Security & Trust</a>
            <a href="#about" className="hover:text-white transition-colors">About</a>
          </nav>

          <div className="flex items-center gap-4">
            <Link
              href="/auth/login"
              className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white transition-colors"
            >
              Sign In
            </Link>

            <Link
              href="/auth/sign-up"
              className="relative inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-[#0a0a0a] bg-gradient-to-r from-[#e8a317] via-[#f0d9a8] to-[#e8a317] shadow-lg shadow-[#e8a317]/25 hover:shadow-[#e8a317]/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shimmer-sweep"
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative z-10 pt-20 pb-28 px-6 max-w-7xl mx-auto text-center">
        <motion.div
          custom={0}
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#e8a317]/10 border border-[#e8a317]/30 text-[#f0d9a8] text-xs font-semibold uppercase tracking-wider mb-8"
        >
          <Sparkles className="w-4 h-4 text-[#e8a317]" />
          Next-Generation Institutional Wealth
        </motion.div>

        <motion.h1
          custom={1}
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="font-cooper text-5xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight leading-[1.08] max-w-5xl mx-auto mb-8"
        >
          Where Smart Capital <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e8a317] via-[#f0d9a8] to-[#10b981]">
            Builds Unrivaled Yields.
          </span>
        </motion.h1>

        <motion.p
          custom={2}
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed mb-10"
        >
          Automated asset allocation, transparent real-time telemetry, and high-tier institutional security. Designed to preserve and accelerate your portfolio.
        </motion.p>

        <motion.div
          custom={3}
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto mb-16"
        >
          <Link
            href="/auth/sign-up"
            className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-semibold text-[#0a0a0a] bg-[#e8a317] hover:bg-[#f0d9a8] shadow-xl shadow-[#e8a317]/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-3"
          >
            Create Your Account
            <ArrowRight className="w-5 h-5" />
          </Link>

          <Link
            href="/auth/login"
            className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-semibold text-zinc-300 bg-white/05 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-200 flex items-center justify-center"
          >
            Access Portal
          </Link>
        </motion.div>

        {/* Dynamic Metric Tickers */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={scaleIn}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto"
        >
          {[
            { label: 'Total Value Managed', val: '$420M+', icon: DollarSign },
            { label: 'Average Annual APY', val: '14.2%', icon: TrendingUp },
            { label: 'Active Investors', val: '18,500+', icon: Users },
            { label: 'Platform Uptime', val: '99.99%', icon: ShieldCheck },
          ].map((stat, idx) => (
            <div key={idx} className="glass p-6 rounded-2xl text-left border border-white/08 relative overflow-hidden group hover:border-[#e8a317]/40 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-zinc-400">{stat.label}</span>
                <stat.icon className="w-4 h-4 text-[#e8a317] opacity-80" />
              </div>
              <p className="font-cooper-medium text-2xl sm:text-3xl text-white group-hover:text-[#f0d9a8] transition-colors">{stat.val}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* 3. Interactive ROI Yield Simulator */}
      <section id="calculator" className="relative z-10 py-20 px-6 max-w-5xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={scaleIn}
          className="glass-gold p-8 sm:p-12 rounded-3xl relative overflow-hidden"
        >
          <div className="max-w-2xl mx-auto text-center mb-10">
            <span className="text-xs font-semibold text-[#e8a317] uppercase tracking-wider">Interactive Simulator</span>
            <h2 className="font-cooper text-3xl sm:text-4xl text-white mt-2">Project Your Investment Yield</h2>
            <p className="text-zinc-400 text-sm mt-2">Adjust your deposit and duration to calculate projected compounding returns.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Controls */}
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-zinc-400">Initial Deposit</span>
                  <span className="font-semibold text-[#f0d9a8]">${depositAmount.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="100000"
                  step="1000"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(Number(e.target.value))}
                  className="w-full accent-[#e8a317] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-zinc-400">Duration</span>
                  <span className="font-semibold text-[#f0d9a8]">{selectedDuration} Months</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[3, 6, 12, 24].map((m) => (
                    <button
                      key={m}
                      onClick={() => setSelectedDuration(m)}
                      className={`py-2 text-xs rounded-lg border transition-all ${
                        selectedDuration === m
                          ? 'bg-[#e8a317] text-[#0a0a0a] font-bold border-[#e8a317]'
                          : 'bg-white/05 text-zinc-400 border-white/10 hover:border-white/20'
                      }`}
                    >
                      {m} Mo
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Output Card */}
            <div className="glass p-6 rounded-2xl border border-[#e8a317]/30 text-center relative">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Estimated Balance</span>
              <p className="font-cooper text-4xl sm:text-5xl text-[#f0d9a8] my-3">
                ${estimatedReturn.toLocaleString()}
              </p>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#10b981]/10 text-[#10b981] text-xs font-medium">
                <TrendingUp className="w-3.5 h-3.5" />
                +${estimatedProfit.toLocaleString()} projected profit
              </div>

              <Link
                href="/auth/sign-up"
                className="mt-6 w-full py-3 rounded-xl bg-[#e8a317] hover:bg-[#f0d9a8] text-[#0a0a0a] text-sm font-semibold transition-all flex items-center justify-center gap-2"
              >
                Start Earning Now
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 4. Value Pillars Section */}
      <section id="features" className="relative z-10 py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-cooper text-3xl sm:text-5xl text-white">Engineered for High-Yield Performance</h2>
          <p className="text-zinc-400 mt-4">Uncompromising architecture built on transparent execution and rigorous risk controls.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              title: 'Automated Portfolio Rebalancing',
              desc: 'Algorithmic dynamic adjustments maximize yield capture while guarding against unnecessary downside volatility.',
              icon: BarChart3,
            },
            {
              title: 'Institutional Multi-Sig Vaults',
              desc: 'Assets are safeguarded behind strict multi-signature protocols and enterprise-grade cold storage parameters.',
              icon: Lock,
            },
            {
              title: 'Real-Time Telemetry & Reporting',
              desc: 'Track every micro-fraction of performance with real-time auditability and granular yield analytics.',
              icon: PieChart,
            },
          ].map((feature, idx) => (
            <motion.div
              key={idx}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={idx}
              variants={fadeInUp}
              className="glass p-8 rounded-2xl border border-white/08 hover:border-[#e8a317]/50 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-12 h-12 rounded-xl bg-[#e8a317]/10 flex items-center justify-center mb-6">
                <feature.icon className="w-6 h-6 text-[#e8a317]" />
              </div>
              <h3 className="font-cooper-medium text-xl text-white mb-3">{feature.title}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 5. Bottom Conversion Banner */}
      <section className="relative z-10 py-24 px-6 max-w-5xl mx-auto text-center">
        <div className="glass p-12 sm:p-16 rounded-3xl border border-[#e8a317]/30 relative overflow-hidden">
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-[#e8a317]/10 rounded-full blur-3xl" />
          <h2 className="font-cooper text-3xl sm:text-5xl text-white max-w-2xl mx-auto mb-6">
            Ready to Take Command of Your Financial Future?
          </h2>
          <p className="text-zinc-400 max-w-lg mx-auto mb-8 text-base">
            Join thousands of smart investors securing institutional yields today. Setup takes under 2 minutes.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/auth/sign-up"
              className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-semibold text-[#0a0a0a] bg-[#e8a317] hover:bg-[#f0d9a8] shadow-lg shadow-[#e8a317]/20 transition-all duration-200"
            >
              Open Your Account
            </Link>
            <Link
              href="/auth/login"
              className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-semibold text-zinc-300 bg-white/05 hover:bg-white/10 border border-white/10 transition-all duration-200"
            >
              Existing Client Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/08 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#e8a317]" />
            <span className="font-cooper text-sm text-zinc-300">Pulse Investment Platform</span>
          </div>
          <p>© {new Date().getFullYear()} Pulse Platform. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/legal/privacy" className="hover:text-zinc-300 transition-colors">Privacy Policy</Link>
            <Link href="/legal/terms" className="hover:text-zinc-300 transition-colors">Terms of Service</Link>
            <Link href="/legal/risk-disclaimer" className="hover:text-zinc-300 transition-colors">Risk Disclaimer</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
