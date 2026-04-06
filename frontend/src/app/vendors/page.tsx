'use client';

import React, { useMemo } from 'react';
import { useFirestoreQuery } from '@/hooks/useFirestoreQuery';
import { where, orderBy } from 'firebase/firestore';
import { useAuth } from '@/hooks/useAuth';
import { SkeuomorphicContainer } from '@/components/layout/SkeuomorphicContainer';
import {
  ShieldAlert,
  Users,
  Activity,
  Send,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  Target
} from 'lucide-react';
import { clsx } from 'clsx';

export default function VendorRiskDashboard() {
  const { tenantId } = useAuth();

  // 1. Fetch Vendors
  const vendorConstraints = useMemo(() => {
    if (!tenantId) return [];
    return [where('tenantId', '==', tenantId), orderBy('name', 'asc')];
  }, [tenantId]);

  const { data: vendors, loading } = useFirestoreQuery('vendors', vendorConstraints);

  if (loading) return null;

  return (
    <div className="min-h-screen bg-[#f4f7f6] p-4 md:p-8">
      <header className="max-w-7xl mx-auto mb-10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SkeuomorphicContainer className="p-3">
            <ShieldAlert className="w-8 h-8 text-brand-danger" />
          </SkeuomorphicContainer>
          <div>
            <h1 className="text-2xl font-bold text-brand-primary tracking-tight">Vendor Risk Intelligence</h1>
            <p className="text-xs text-brand-secondary font-medium uppercase tracking-widest opacity-60">
              Third-Party SLA & Compliance Monitoring
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-8">
        {/* Risk Radar / Overview */}
        <SkeuomorphicContainer className="lg:col-span-1 space-y-6">
          <div className="flex items-center gap-2 border-b border-brand-secondary/10 pb-4">
            <Target className="w-5 h-5 text-brand-accent" />
            <h2 className="text-sm font-bold text-brand-primary uppercase tracking-wider">Risk Distribution</h2>
          </div>

          <div className="aspect-square relative flex items-center justify-center">
            {/* Skeuomorphic Radar Mockup */}
            <div className="absolute inset-0 rounded-full border-4 border-brand-secondary/5 neumorphic-inset" />
            <div className="w-3/4 h-3/4 rounded-full border-2 border-brand-accent/20 border-dashed animate-[spin_10s_linear_infinite]" />
            <div className="text-center z-10">
              <div className="text-4xl font-bold text-brand-primary">
                {Math.round(vendors.reduce((acc, v: any) => acc + (v.riskScore || 0), 0) / (vendors.length || 1))}
              </div>
              <div className="text-[10px] font-bold uppercase text-brand-secondary tracking-widest">Avg Resilience Score</div>
            </div>
          </div>

          <div className="space-y-3 pt-4">
             <div className="flex justify-between items-center text-[10px] font-bold uppercase text-brand-secondary">
               <span>Critical Vendors</span>
               <span className="text-brand-danger">{vendors.filter((v: any) => v.criticality === 'critical').length}</span>
             </div>
             <div className="w-full h-1.5 bg-brand-secondary/10 rounded-full overflow-hidden">
               <div className="h-full bg-brand-danger w-1/4 shadow-[0_0_8px_rgba(231,76,60,0.4)]" />
             </div>
          </div>
        </SkeuomorphicContainer>

        {/* Vendor Inventory */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
             <h2 className="text-sm font-bold text-brand-primary uppercase tracking-widest flex items-center gap-2">
              <Users className="w-4 h-4 text-brand-accent" />
              Critical Provider Registry
            </h2>
          </div>

          <div className="grid gap-4">
            {vendors.map((vendor: any) => (
              <SkeuomorphicContainer key={vendor.id} className="p-5 group hover:scale-[1.01] transition-transform">
                <div className="flex items-center justify-between gap-6">
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-brand-primary truncate">{vendor.name}</h3>
                      <span className={clsx(
                        "text-[8px] font-black uppercase px-2 py-0.5 rounded-full border",
                        vendor.criticality === 'critical' ? "border-brand-danger/30 text-brand-danger bg-brand-danger/5" : "border-brand-secondary/20 text-brand-secondary"
                      )}>
                        {vendor.criticality}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-[10px] font-medium text-brand-secondary">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> SLA: {vendor.slaMinutes || '--'}m</span>
                      <span className="flex items-center gap-1 underline"><ExternalLink className="w-3 h-3" /> {vendor.contactEmail}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-8">
                    <div className="text-right">
                       <div className={clsx(
                         "text-lg font-bold",
                         (vendor.riskScore || 0) > 70 ? "text-brand-success" : "text-brand-warning"
                       )}>
                         {vendor.riskScore || '--'}
                       </div>
                       <div className="text-[8px] font-bold uppercase text-brand-secondary tracking-tighter opacity-60">Resilience</div>
                    </div>

                    <button className="neumorphic-button p-3 rounded-xl text-brand-accent hover:text-brand-primary transition-colors">
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </SkeuomorphicContainer>
            ))}

            {vendors.length === 0 && (
               <div className="py-12 text-center border-2 border-dashed border-brand-secondary/10 rounded-3xl opacity-40 italic text-sm font-medium">
                 No critical vendors registered.
               </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
