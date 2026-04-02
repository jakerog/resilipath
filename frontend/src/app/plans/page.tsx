'use client';

import React, { useMemo } from 'react';
import { useFirestoreQuery } from '@/hooks/useFirestoreQuery';
import { where, orderBy } from 'firebase/firestore';
import { useAuth } from '@/hooks/useAuth';
import { SkeuomorphicContainer } from '@/components/layout/SkeuomorphicContainer';
import { BookOpen, FileText, Plus, ArrowRight, Shield } from 'lucide-react';

export default function PlanGallery() {
  const { tenantId, loading: authLoading } = useAuth();

  // 1. Fetch available templates (global)
  const { data: templates, loading: templatesLoading } = useFirestoreQuery('bcp_templates');

  // 2. Fetch tenant plans
  const planConstraints = useMemo(() => {
    if (!tenantId) return [];
    return [
      where('tenantId', '==', tenantId),
      orderBy('updatedAt', 'desc')
    ];
  }, [tenantId]);

  const { data: plans, loading: plansLoading } = useFirestoreQuery('plans', planConstraints);

  const loading = authLoading || templatesLoading || plansLoading;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f7f6]">
        <div className="flex flex-col items-center gap-4">
          <BookOpen className="w-10 h-10 text-brand-accent animate-pulse" />
          <p className="text-sm font-bold text-brand-primary uppercase tracking-widest">
            Opening Library...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f7f6] p-4 md:p-8">
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-4">
          <SkeuomorphicContainer className="p-3">
            <BookOpen className="w-6 h-6 text-brand-accent" />
          </SkeuomorphicContainer>
          <div>
            <h1 className="text-2xl font-bold text-brand-primary">Resilience Planning</h1>
            <p className="text-xs text-brand-secondary font-medium uppercase tracking-widest opacity-60">
              BCP Templates & Active Plans
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto space-y-12">
        {/* Active Plans Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-brand-primary uppercase tracking-widest flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-accent" />
              Your Active Plans
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan: any) => (
              <SkeuomorphicContainer key={plan.id} className="group hover:scale-[1.02] transition-transform">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-brand-primary">{plan.name}</h3>
                    <span className="text-[10px] font-bold uppercase px-2 py-1 rounded bg-brand-primary/5 text-brand-secondary">
                      v{plan.version}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-medium text-brand-secondary">
                    <div className={`w-2 h-2 rounded-full ${
                      plan.status === 'approved' ? 'bg-brand-success' : 'bg-brand-warning'
                    }`} />
                    <span className="capitalize">{plan.status.replace('_', ' ')}</span>
                  </div>
                  <button className="w-full neumorphic-button py-2 text-xs font-bold text-brand-primary flex items-center justify-center gap-2">
                    Open Plan <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </SkeuomorphicContainer>
            ))}

            {plans.length === 0 && (
              <div className="col-span-full py-12 text-center border-2 border-dashed border-brand-secondary/20 rounded-2xl opacity-40">
                <p className="text-sm italic">No active resilience plans found.</p>
              </div>
            )}
          </div>
        </section>

        {/* Template Gallery Section */}
        <section className="space-y-6">
           <h2 className="text-sm font-bold text-brand-primary uppercase tracking-widest flex items-center gap-2">
            <Shield className="w-4 h-4 text-brand-success" />
            Standardized BCP Templates
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template: any) => (
              <SkeuomorphicContainer key={template.id} className="flex flex-col h-full">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2">
                     <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-brand-accent/10 text-brand-accent">
                      {template.category}
                    </span>
                  </div>
                  <h3 className="font-bold text-brand-primary">{template.name}</h3>
                  <p className="text-xs text-brand-secondary leading-relaxed">
                    {template.description}
                  </p>
                </div>
                <div className="mt-6 pt-6 border-t border-brand-secondary/10">
                  <button className="w-full neumorphic-button py-2 text-xs font-bold text-brand-accent flex items-center justify-center gap-2">
                    <Plus className="w-3 h-3" /> Use Template
                  </button>
                </div>
              </SkeuomorphicContainer>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
