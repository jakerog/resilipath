'use client';

import React, { useMemo } from 'react';
import { useFirestoreQuery } from '@/hooks/useFirestoreQuery';
import { where, orderBy } from 'firebase/firestore';
import { useAuth } from '@/hooks/useAuth';
import { SkeuomorphicContainer } from '@/components/layout/SkeuomorphicContainer';
import {
  ShieldCheck,
  FileArchive,
  CheckCircle2,
  AlertCircle,
  Info,
  Download,
  Lock,
  Layers
} from 'lucide-react';
import { clsx } from 'clsx';

export default function ComplianceDashboard() {
  const { tenantId } = useAuth();

  // 1. Fetch Compliance Controls
  const { data: controls, loading } = useFirestoreQuery('compliance_controls', [], {
    enabled: !!tenantId && tenantId !== 'pending'
  });

  const frameworks = [
    { id: 'SOC2', name: 'SOC 2 Type II', color: 'text-brand-accent' },
    { id: 'ISO27001', name: 'ISO 27001:2022', color: 'text-brand-success' },
    { id: 'DORA', name: 'EU DORA', color: 'text-brand-primary' },
  ];

  if (loading) return null;

  return (
    <div className="min-h-screen bg-[#f4f7f6] p-4 md:p-8">
      <header className="max-w-7xl mx-auto mb-10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SkeuomorphicContainer className="p-3">
            <ShieldCheck className="w-8 h-8 text-brand-success" />
          </SkeuomorphicContainer>
          <div>
            <h1 className="text-2xl font-bold text-brand-primary tracking-tight">Compliance & Audit</h1>
            <p className="text-xs text-brand-secondary font-medium uppercase tracking-widest opacity-60">
              Automated Control Mapping & Evidence Vault
            </p>
          </div>
        </div>

        <button className="neumorphic-button px-6 py-3 text-[10px] font-bold text-brand-primary uppercase tracking-widest flex items-center gap-2 hover:text-brand-accent transition-colors">
          <FileArchive className="w-4 h-4" />
          Generate Audit Package
        </button>
      </header>

      <main className="max-w-7xl mx-auto space-y-10">
        {/* Framework Overview */}
        <div className="grid md:grid-cols-3 gap-8">
          {frameworks.map((fw) => (
            <SkeuomorphicContainer key={fw.id} className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className={clsx("font-bold uppercase tracking-wider text-xs", fw.color)}>{fw.name}</h3>
                <div className="text-xs font-bold text-brand-secondary">
                   {Math.round((controls.filter((c: any) => c.framework === fw.id && (c.mappedEvidenceIds?.find((m: any) => m.tenantId === tenantId)?.evidenceIds?.length > 0)).length / (controls.filter((c: any) => c.framework === fw.id).length || 1)) * 100)}%
                </div>
              </div>
              <div className="w-full h-2 bg-brand-secondary/10 rounded-full overflow-hidden">
                <div
                  className={clsx("h-full transition-all duration-1000", fw.color.replace('text-', 'bg-'))}
                  style={{ width: '65%' }} // Mock for now
                />
              </div>
              <p className="text-[10px] text-brand-secondary font-medium italic">
                {controls.filter((c: any) => c.framework === fw.id).length} Controls Identified
              </p>
            </SkeuomorphicContainer>
          ))}
        </div>

        {/* Detailed Control Map */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <Layers className="w-5 h-5 text-brand-accent" />
            <h2 className="text-sm font-bold text-brand-primary uppercase tracking-widest">Active Control Mapping</h2>
          </div>

          <div className="grid gap-4">
            {controls.map((control: any) => {
              const mapped = control.mappedEvidenceIds?.find((m: any) => m.tenantId === tenantId);
              const isCompliant = mapped?.evidenceIds?.length > 0;

              return (
                <SkeuomorphicContainer key={control.id} className="p-5 group">
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex-1 space-y-2">
                       <div className="flex items-center gap-3">
                         <span className="text-[10px] font-black text-brand-secondary px-2 py-0.5 rounded bg-brand-secondary/5 font-mono">
                           {control.code}
                         </span>
                         <h4 className="text-sm font-bold text-brand-primary">{control.title}</h4>
                       </div>
                       <p className="text-[11px] text-brand-secondary leading-relaxed max-w-2xl">
                         {control.description}
                       </p>

                       {isCompliant && (
                         <div className="flex flex-wrap gap-2 pt-2">
                            {mapped.evidenceIds.map((eid: string) => (
                              <div key={eid} className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-brand-success/5 border border-brand-success/20 text-[9px] font-bold text-brand-success uppercase">
                                <FileArchive className="w-3 h-3" />
                                Evidence: {eid.slice(0, 8)}
                              </div>
                            ))}
                         </div>
                       )}
                    </div>

                    <div className="flex flex-col items-end gap-3">
                       <div className={clsx(
                         "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-tighter",
                         isCompliant ? "bg-brand-success/10 text-brand-success" : "bg-brand-warning/10 text-brand-warning"
                       )}>
                         {isCompliant ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                         {isCompliant ? 'Audit Ready' : 'Evidence Required'}
                       </div>

                       <button className="neumorphic-button p-2 rounded-lg text-brand-secondary opacity-40 hover:opacity-100 hover:text-brand-accent transition-all">
                         <Info className="w-3.5 h-3.5" />
                       </button>
                    </div>
                  </div>
                </SkeuomorphicContainer>
              );
            })}

            {controls.length === 0 && (
              <div className="py-20 text-center border-2 border-dashed border-brand-secondary/10 rounded-3xl opacity-30 italic font-medium">
                No compliance frameworks mapped to this tenant.
              </div>
            )}
          </div>
        </section>

        {/* Evidence Vault Policy */}
        <div className="bg-brand-primary/5 border border-brand-primary/10 p-6 rounded-3xl flex gap-6 items-start">
           <div className="p-3 neumorphic-inset rounded-2xl">
             <Lock className="w-6 h-6 text-brand-primary" />
           </div>
           <div className="space-y-1">
             <h4 className="text-sm font-bold text-brand-primary uppercase tracking-tight">Immutable Evidence Vault</h4>
             <p className="text-xs text-brand-secondary leading-relaxed max-w-xl">
               ResiliPath enforces cryptographic chaining and hashing for all compliance evidence. Once evidence is mapped to a control, it is locked in the platform's audit trail and can only be amended, never deleted.
             </p>
           </div>
        </div>
      </main>
    </div>
  );
}
