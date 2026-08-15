import React, { useState } from 'react';
import { Home, PieChart, Zap, User, ArrowUpRight, TrendingUp } from 'lucide-react';

export default function CleanDashboard() {
  const [activeTab, setActiveTab] = useState('home');

  const portfolioSummary = [
    { name: 'Kalahari Solar Field', category: 'Clean Energy', value: '$45,200', yield: '12.4%', status: 'Active' },
    { name: 'Maputo Logistics Hub', category: 'Infrastructure', value: '$28,150', yield: '9.8%', status: 'Active' },
    { name: 'Nairobi Data Center', category: 'Tech Real Estate', value: '$18,400', yield: '14.1%', status: 'Active' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-24 lg:pb-8">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold tracking-wide text-sm text-slate-200">Terminal Live</span>
          </div>
          <span className="font-mono text-xs text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700">
            ID: 78D09C87
          </span>
        </div>
      </header>

      {/* Main Container - Fully Responsive */}
      <main className="max-w-6xl mx-auto px-4 py-6 space-y-8">
        
        {/* Top Metric Cards Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Total Portfolio Value</p>
            <p className="text-2xl font-bold font-mono text-white">$91,750.00</p>
            <div className="flex items-center gap-1 text-emerald-400 text-xs font-medium mt-2">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+8.4% this month</span>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Average APY</p>
            <p className="text-2xl font-bold font-mono text-emerald-400">12.1%</p>
            <p className="text-xs text-slate-500 mt-2">Weighted across 3 active assets</p>
          </div>

          <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 sm:col-span-2 lg:col-span-1">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Monthly Yield</p>
            <p className="text-2xl font-bold font-mono text-white">$925.30</p>
            <p className="text-xs text-slate-500 mt-2">Next payout in 4 days</p>
          </div>
        </section>

        {/* Aggregated Portfolio Section */}
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-slate-100">Active Allocations</h2>
            <button className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1">
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {portfolioSummary.map((item, idx) => (
              <div 
                key={idx}
                className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 hover:border-slate-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <h3 className="font-medium text-slate-200">{item.name}</h3>
                  <p className="text-xs text-slate-400">{item.category}</p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 border-slate-800/60 pt-3 sm:pt-0">
                  <div className="text-left sm:text-right">
                    <p className="text-xs text-slate-400">Value</p>
                    <p className="font-mono text-sm font-semibold text-slate-200">{item.value}</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-xs text-slate-400">Yield</p>
                    <p className="font-mono text-sm font-semibold text-emerald-400">{item.yield}</p>
                  </div>
                  <span className="px-2.5 py-1 text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Streamlined Bottom Nav (4 essential items for mobile) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-slate-900/95 border-t border-slate-800 backdrop-blur px-6 py-2.5 z-20">
        <div className="flex justify-between items-center max-w-md mx-auto">
          {[
            { id: 'home', label: 'Home', icon: Home },
            { id: 'portfolio', label: 'Portfolio', icon: PieChart },
            { id: 'signals', label: 'Signals', icon: Zap },
            { id: 'profile', label: 'Profile', icon: User },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center gap-1 text-xs font-medium transition ${
                  isActive ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
