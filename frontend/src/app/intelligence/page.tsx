'use client';

import React, { useMemo } from 'react';
import { useFirestoreQuery } from '@/hooks/useFirestoreQuery';
import { where, orderBy, limit } from 'firebase/firestore';
import { useAuth } from '@/hooks/useAuth';
import { SkeuomorphicContainer } from '@/components/layout/SkeuomorphicContainer';
import {
  BarChart3,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  Zap,
  RefreshCcw,
  Target,
  BrainCircuit
} from 'lucide-react';
import clsx from 'clsx';

export default function IntelligenceDashboard() {
  const { tenantId } = useAuth();

  // 1. Fetch Latest Resilience Score
  const scoreConstraints = useMemo(() => {
    if (!tenantId) return [];
    return [where('tenantId', '==', tenantId), orderBy('calculatedAt', 'desc'), limit(1)];
  }, [tenantId]);

  const { data: scores, loading } = useFirestoreQuery('resilience_scores', scoreConstraints, {
    enabled: !!tenantId && tenantId !== 'pending'
  });
  const latestScore = scores[0] as any;

  if (loading) return null;

  return (
    <div className="min-h-screen bg-[#f4f7f6] p-4 md:p-8">
      <header className="max-w-7xl mx-auto mb-10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SkeuomorphicContainer className="p-3">
            <BrainCircuit className="w-8 h-8 text-brand-accent" />
          </SkeuomorphicContainer>
          <div>
            <h1 className="text-2xl font-bold text-brand-primary tracking-tight">Resilience Intelligence</h1>
            <p className="text-xs text-brand-secondary font-medium uppercase tracking-widest opacity-60">
              ML-Driven Predictive Analytics & Scoring
            </p>
          </div>
        </div>

        <button className="neumorphic-button px-6 py-3 text-[10px] font-bold text-brand-accent uppercase tracking-widest flex items-center gap-2">
          <RefreshCcw className="w-3 h-3" />
          Recalculate Score
        </button>
      </header>

      <main className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-8">
        {/* Main Score Widget */}
        <SkeuomorphicContainer className="lg:col-span-4 flex flex-col items-center justify-center p-12 space-y-6">
          <div className="relative w-48 h-48 flex items-center justify-center">
             <svg className="w-full h-full -rotate-90">
               <circle
                 cx="96"
                 cy="96"
                 r="88"
                 fill="transparent"
                 stroke="currentColor"
                 strokeWidth="12"
                 className="text-brand-secondary/10"
               />
               <circle
                 cx="96"
                 cy="96"
                 r="88"
                 fill="transparent"
                 stroke="currentColor"
                 strokeWidth="12"
                 strokeDasharray={2 * Math.PI * 88}
                 strokeDashoffset={2 * Math.PI * 88 * (1 - (latestScore?.overallScore || 0) / 100)}
                 className={clsx(
                   "transition-all duration-1000",
                   (latestScore?.overallScore || 0) > 75 ? "text-brand-success" : "text-brand-warning"
                 )}
               />
             </svg>
             <div className="absolute inset-0 flex flex-col items-center justify-center">
               <span className="text-5xl font-black text-brand-primary">{latestScore?.overallScore || '--'}</span>
               <span className="text-[10px] font-bold uppercase text-brand-secondary tracking-widest">Resilience Index</span>
             </div>
          </div>

          <div className="text-center space-y-1">
             <p className="text-sm font-bold text-brand-primary">Plan Integrity: Strong</p>
             <p className="text-[10px] text-brand-secondary">Calculated based on {latestScore?.metrics?.evidenceCoverage}% evidence coverage</p>
          </div>
        </SkeuomorphicContainer>

        {/* Category Breakdown */}
        <div className="lg:col-span-8 grid md:grid-cols-2 gap-6">
          {[
            { label: 'Planning Depth', value: latestScore?.categories?.planning, icon: Target, color: 'text-brand-accent' },
            { label: 'Execution Speed', value: latestScore?.categories?.execution, icon: Zap, color: 'text-brand-warning' },
            { label: 'Vendor Resilience', value: latestScore?.categories?.vendors, icon: ShieldCheck, color: 'text-brand-success' },
            { label: 'Infrastructure', value: latestScore?.categories?.infrastructure, icon: TrendingUp, color: 'text-brand-primary' },
          ].map((cat) => (
            <SkeuomorphicContainer key={cat.label} className="p-6">
               <div className="flex items-center justify-between mb-4">
                 <div className={clsx("p-2 rounded-lg bg-current/5", cat.color)}>
                   <cat.icon className="w-5 h-5" />
                 </div>
                 <span className="text-xl font-bold text-brand-primary">{cat.value || '--'}%</span>
               </div>
               <p className="text-xs font-bold text-brand-primary uppercase tracking-wider">{cat.label}</p>
               <div className="mt-4 w-full h-2 bg-brand-secondary/10 rounded-full overflow-hidden">
                 <div
                   className={clsx("h-full transition-all duration-1000", cat.color.replace('text-', 'bg-'))}
                   style={{ width: `${cat.value || 0}%` }}
                 />
               </div>
            </SkeuomorphicContainer>
          ))}
        </div>

        {/* Predictive Insights */}
        <SkeuomorphicContainer className="lg:col-span-12 p-8 space-y-6">
           <div className="flex items-center gap-3 border-b border-brand-secondary/10 pb-4">
            <BarChart3 className="w-5 h-5 text-brand-accent" />
            <h2 className="text-sm font-bold text-brand-primary uppercase tracking-wider">Predictive Gap Analysis</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
             <div className="p-4 neumorphic-inset rounded-2xl border-l-4 border-brand-danger">
                <div className="flex items-center gap-2 text-brand-danger mb-2">
                   <AlertTriangle className="w-4 h-4" />
                   <span className="text-[10px] font-black uppercase">Critical Risk</span>
                </div>
                <p className="text-xs text-brand-primary font-medium leading-relaxed">
                  3 critical assets are currently unmapped to any Resilience Exercise tasks.
                </p>
             </div>
             <div className="p-4 neumorphic-inset rounded-2xl border-l-4 border-brand-warning">
                <div className="flex items-center gap-2 text-brand-warning mb-2">
                   <TrendingUp className="w-4 h-4" />
                   <span className="text-[10px] font-black uppercase">SLA Drift</span>
                </div>
                <p className="text-xs text-brand-primary font-medium leading-relaxed">
                  Vendor recovery times have increased by 12% over the last 3 months.
                </p>
             </div>
             <div className="p-4 neumorphic-inset rounded-2xl border-l-4 border-brand-success">
                <div className="flex items-center gap-2 text-brand-success mb-2">
                   <ShieldCheck className="w-4 h-4" />
                   <span className="text-[10px] font-black uppercase">Audit Ready</span>
                </div>
                <p className="text-xs text-brand-primary font-medium leading-relaxed">
                  All evidence for SOC 2 CC7.5 has been successfully collected and mapped.
                </p>
             </div>
          </div>
        </SkeuomorphicContainer>
      </main>
    </div>
  );
}
