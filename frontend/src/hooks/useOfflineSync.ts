import { useState, useEffect, useCallback } from 'react';
import { saveDraft, getDraft, clearDraft, PlanDraft } from '@/lib/offline/db';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export function useOfflineSync(planId: string | null, tenantId: string | null) {
  const [isOnline, setIsOnline] = useState(true);
  const [hasLocalDraft, setHasLocalDraft] = useState(false);
  const [localDraft, setLocalDraft] = useState<PlanDraft | null>(null);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const checkLocal = useCallback(async () => {
    if (!planId) return;
    const draft = await getDraft(planId);
    setHasLocalDraft(!!draft);
    setLocalDraft(draft);
  }, [planId]);

  useEffect(() => {
    checkLocal();
  }, [planId, checkLocal]);

  const persistLocally = useCallback(async (data: Record<string, any>) => {
    if (!planId || !tenantId) return;
    await saveDraft({
      planId,
      tenantId,
      data,
      updatedAt: Date.now()
    });
    setHasLocalDraft(true);
  }, [planId, tenantId]);

  const removeLocal = useCallback(async () => {
    if (!planId) return;
    await clearDraft(planId);
    setHasLocalDraft(false);
    setLocalDraft(null);
  }, [planId]);

  const syncToCloud = useCallback(async (uid: string) => {
    if (!planId || !localDraft) return;
    setSyncing(true);
    try {
      const planRef = doc(db, 'plans', planId);
      await updateDoc(planRef, {
        data: localDraft.data,
        lastModifiedBy: uid,
        updatedAt: serverTimestamp(),
      });
      await removeLocal();
      console.log('Local draft successfully synced to cloud');
    } catch (err) {
      console.error('Background sync failed:', err);
    } finally {
      setSyncing(false);
    }
  }, [planId, localDraft, removeLocal]);

  return {
    isOnline,
    hasLocalDraft,
    localDraft,
    syncing,
    persistLocally,
    removeLocal,
    syncToCloud
  };
}
