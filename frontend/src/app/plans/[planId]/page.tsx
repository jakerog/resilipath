'use client';

import React, { useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useFirestoreQuery } from '@/hooks/useFirestoreQuery';
import { where, doc, updateDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db, functions } from '@/lib/firebase';
import { httpsCallable } from 'firebase/functions';
import { useAuth } from '@/hooks/useAuth';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { GuidedInterview } from '@/components/planning/GuidedInterview';
import { SyncStatus } from '@/components/layout/SyncStatus';
import { SyncConflictModal } from '@/components/planning/SyncConflictModal';
import { SkeuomorphicContainer } from '@/components/layout/SkeuomorphicContainer';
import { ChevronLeft, FileText, CheckCircle, History, Camera, Clock, ShieldCheck, Send } from 'lucide-react';
import { clsx } from 'clsx';

export default function PlanEditor() {
  const params = useParams();
  const router = useRouter();
  const planId = params.planId as string;
  const { tenantId, user, loading: authLoading } = useAuth();
  const {
    isOnline,
    hasLocalDraft,
    localDraft,
    syncing: isBackgroundSyncing,
    persistLocally,
    removeLocal,
    syncToCloud
  } = useOfflineSync(planId, tenantId);

  // 1. Fetch the specific plan
  const planConstraints = useMemo(() => {
    if (!tenantId) return [];
    return [where('tenantId', '==', tenantId)];
  }, [tenantId]);

  const { data: plans, loading: planLoading } = useFirestoreQuery('plans', planConstraints);
  const plan = plans.find((p: any) => p.id === planId) as any;

  // 2. Fetch the template for this plan
  const templateId = plan?.templateId;
  const { data: templates, loading: templateLoading } = useFirestoreQuery('bcp_templates');
  const template = templates.find((t: any) => t.templateId === templateId) as any;

  // 3. Fetch snapshots
  const snapshotConstraints = useMemo(() => {
    if (!planId) return [];
    return [where('originalPlanId', '==', planId), orderBy('snapshottedAt', 'desc')];
  }, [planId]);

  const { data: snapshots } = useFirestoreQuery('plan_snapshots', snapshotConstraints);

  const [isSaving, setIsSaving] = React.useState(false);
  const [isSnapshotting, setIsSnapshotting] = React.useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = React.useState(false);
  const [showHistory, setShowHistory] = React.useState(false);

  const handleStatusChange = async (newStatus: string) => {
    if (!planId || !user) return;
    setIsUpdatingStatus(true);
    try {
      const planRef = doc(db, 'plans', planId);
      await updateDoc(planRef, {
        status: newStatus,
        lastModifiedBy: user.uid,
        updatedAt: serverTimestamp(),
      });
      console.log(`Plan status updated to ${newStatus}`);
    } catch (err) {
      console.error('Failed to update plan status:', err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleSnapshot = async () => {
    if (!planId) return;
    setIsSnapshotting(true);
    try {
      const snapshotFunc = httpsCallable(functions, 'snapshotPlan');
      await snapshotFunc({ planId, label: `Manual Snapshot v${plan.version}` });
      console.log('Snapshot created');
    } catch (err) {
      console.error('Snapshot failed:', err);
    } finally {
      setIsSnapshotting(false);
    }
  };

  const handleSave = async (data: Record<string, any>) => {
    if (!planId || !user) return;
    setIsSaving(true);
    try {
      const planRef = doc(db, 'plans', planId);
      if (isOnline) {
        await updateDoc(planRef, {
          data,
          lastModifiedBy: user.uid,
          updatedAt: serverTimestamp(),
        });
        await removeLocal();
        console.log('Plan updated successfully (Cloud)');
      } else {
        await persistLocally(data);
        console.log('Plan saved locally (Offline)');
      }
    } catch (err) {
      console.error('Failed to update plan:', err);
      // Fallback to local if cloud fails
      await persistLocally(data);
    } finally {
      setIsSaving(false);
    }
  };

  const loading = authLoading || planLoading || (plan && templateLoading);

  const showConflictModal = isOnline && hasLocalDraft && localDraft &&
    (!plan.updatedAt || localDraft.updatedAt > plan.updatedAt.toDate().getTime() + 1000);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f7f6]">
        <div className="flex flex-col items-center gap-4">
          <FileText className="w-10 h-10 text-brand-accent animate-pulse" />
          <p className="text-sm font-bold text-brand-primary uppercase tracking-widest">
            Loading Resilience Plan...
          </p>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f7f6]">
        <SkeuomorphicContainer className="text-center p-12">
          <h2 className="text-xl font-bold text-brand-primary mb-4">Plan Not Found</h2>
          <button
            onClick={() => router.push('/plans')}
            className="neumorphic-button px-6 py-2 text-xs font-bold text-brand-accent uppercase"
          >
            Back to Gallery
          </button>
        </SkeuomorphicContainer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f7f6] p-4 md:p-8">
      <header className="max-w-5xl mx-auto mb-8 flex items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <button
            onClick={() => router.push('/plans')}
            className="neumorphic-button p-3 hover:text-brand-accent transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-brand-primary">{plan.name}</h1>
             <div className="flex items-center gap-4 mt-1">
              <span className="text-[10px] font-bold text-brand-secondary uppercase tracking-widest opacity-60">
                Resilience Plan Editor • v{plan.version}
              </span>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-brand-success uppercase tracking-widest">
                <CheckCircle className="w-3 h-3" />
                Auto-save active
              </div>
              <span className={clsx(
                "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter",
                plan.status === 'approved' ? "bg-brand-success/10 text-brand-success" :
                plan.status === 'under_review' ? "bg-brand-accent/10 text-brand-accent" :
                "bg-brand-secondary/10 text-brand-secondary"
              )}>
                {plan.status || 'draft'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
           <button
            onClick={() => setShowHistory(!showHistory)}
            className={clsx(
              "neumorphic-button p-3 transition-colors",
              showHistory ? "text-brand-accent neumorphic-inset" : "text-brand-secondary"
            )}
            title="Version History"
          >
            <History className="w-5 h-5" />
          </button>
          {plan.status === 'draft' && (
            <button
              onClick={() => handleStatusChange('under_review')}
              disabled={isUpdatingStatus || !isOnline}
              className="neumorphic-button px-6 py-2 text-xs font-bold text-brand-primary uppercase tracking-widest flex items-center gap-2 disabled:opacity-50"
            >
              <Send className="w-4 h-4 text-brand-accent" />
              Submit for Review
            </button>
          )}

          {plan.status === 'under_review' && (
            <button
              onClick={() => handleStatusChange('approved')}
              disabled={isUpdatingStatus || !isOnline}
              className="neumorphic-button px-6 py-2 text-xs font-bold text-white bg-brand-success uppercase tracking-widest flex items-center gap-2 disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4" />
              Approve Plan
            </button>
          )}

          <button
            onClick={handleSnapshot}
            disabled={isSnapshotting || !isOnline}
            className="neumorphic-button px-6 py-2 text-xs font-bold text-brand-primary uppercase tracking-widest flex items-center gap-2 disabled:opacity-50"
          >
            <Camera className={clsx("w-4 h-4 text-brand-accent", isSnapshotting && "animate-pulse")} />
            {isSnapshotting ? "Snapshotting..." : "Create Snapshot"}
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto mb-8">
        <SyncStatus
          isOnline={isOnline}
          hasLocalData={hasLocalDraft}
          isSyncing={isBackgroundSyncing}
        />
      </div>

      {showConflictModal && (
        <SyncConflictModal
          localUpdatedAt={localDraft.updatedAt}
          onSync={() => syncToCloud(user!.uid)}
          onDiscard={removeLocal}
          isSyncing={isBackgroundSyncing}
        />
      )}

      <main className="max-w-5xl mx-auto grid lg:grid-cols-12 gap-8 items-start">
        <div className={clsx("transition-all duration-500", showHistory ? "lg:col-span-8" : "lg:col-span-12")}>
          {template ? (
          <GuidedInterview
            template={template}
            initialData={plan.data}
            onSave={handleSave}
            isSaving={isSaving}
          />
          ) : (
          <SkeuomorphicContainer className="text-center py-20">
             <p className="text-sm italic text-brand-secondary opacity-50">
               Associating template metadata...
             </p>
          </SkeuomorphicContainer>
          )}
        </div>

        {showHistory && (
          <aside className="lg:col-span-4 space-y-6 animate-in slide-in-from-right-4 duration-300">
            <h2 className="text-sm font-bold text-brand-primary uppercase tracking-widest flex items-center gap-2">
              <History className="w-4 h-4 text-brand-accent" />
              Plan History
            </h2>

            <div className="space-y-4">
              {snapshots.map((snap: any) => (
                <SkeuomorphicContainer key={snap.id} inset className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <p className="text-xs font-bold text-brand-primary leading-tight">
                      {snap.snapshotLabel}
                    </p>
                    <span className="text-[9px] font-bold bg-brand-primary/10 px-1.5 py-0.5 rounded text-brand-secondary">
                      v{snap.version}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-brand-secondary font-medium uppercase opacity-60">
                    <Clock className="w-3 h-3" />
                    {snap.snapshottedAt?.toDate()?.toLocaleString()}
                  </div>
                  <button className="w-full neumorphic-button py-1.5 text-[10px] font-bold text-brand-accent uppercase tracking-tighter">
                    View Immutable Snapshot
                  </button>
                </SkeuomorphicContainer>
              ))}

              {snapshots.length === 0 && (
                <p className="text-xs italic text-brand-secondary text-center py-8 opacity-40">
                  No snapshots captured yet.
                </p>
              )}
            </div>
          </aside>
        )}
      </main>
    </div>
  );
}
