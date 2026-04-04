'use client';

import { useRouter } from 'next/navigation';
import { SkeuomorphicContainer } from '@/components/layout/SkeuomorphicContainer';
import { Activity, ShieldCheck, Mail, Smartphone, ArrowRight } from 'lucide-react';

export default function Home() {
  const router = useRouter();

  return (
    <main className="p-8 max-w-4xl mx-auto space-y-8">
      <SkeuomorphicContainer className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-brand-primary">ResiliPath</h1>
        <p className="mt-2 text-brand-secondary font-medium uppercase tracking-widest text-sm">
          Resilience Exercise Execution Engine
        </p>
      </SkeuomorphicContainer>

      <div className="grid md:grid-cols-2 gap-8">
        <SkeuomorphicContainer className="space-y-4">
          <div className="flex items-center gap-3 text-brand-accent">
            <Activity className="w-6 h-6" />
            <h2 className="text-xl font-semibold">Live Orchestration</h2>
          </div>
          <p className="text-sm text-brand-secondary">
            Real-time exercise tracking with automated status propagation and dependency validation.
          </p>
        </SkeuomorphicContainer>

        <SkeuomorphicContainer className="space-y-4">
          <div className="flex items-center gap-3 text-brand-success">
            <ShieldCheck className="w-6 h-6" />
            <h2 className="text-xl font-semibold">Audit Ready</h2>
          </div>
          <p className="text-sm text-brand-secondary">
            Immutable audit logs and evidence collection aligned with ISO 22301 and NIST.
          </p>
        </SkeuomorphicContainer>

        <SkeuomorphicContainer className="space-y-4">
          <div className="flex items-center gap-3 text-brand-warning">
            <Mail className="w-6 h-6" />
            <h2 className="text-xl font-semibold">Smart Notifications</h2>
          </div>
          <p className="text-sm text-brand-secondary">
            Event-driven email alerts triggered automatically by exercise state transitions.
          </p>
        </SkeuomorphicContainer>

        <SkeuomorphicContainer className="space-y-4">
          <div className="flex items-center gap-3 text-brand-danger">
            <Smartphone className="w-6 h-6" />
            <h2 className="text-xl font-semibold">SMS Alerting</h2>
          </div>
          <p className="text-sm text-brand-secondary">
            High-priority SMS notifications for critical exercise updates and Go/No-Go decisions.
          </p>
        </SkeuomorphicContainer>
      </div>

      <SkeuomorphicContainer inset className="text-center p-12">
        <button
          onClick={() => router.push('/dashboard')}
          className="neumorphic-button px-8 py-3 font-bold text-brand-primary hover:text-brand-accent transition-colors flex items-center gap-3 mx-auto"
        >
          Initialize Exercise Dashboard
          <ArrowRight className="w-5 h-5 text-brand-accent" />
        </button>
      </SkeuomorphicContainer>
    </main>
  );
}
