import { useState, useEffect, useCallback } from 'react';
import { saveDraft, getDraft, clearDraft, PlanDraft } from '@/lib/offline/db';

export function useOfflineSync(planId: string | null, tenantId: string | null) {
  const [isOnline, setIsOnline] = useState(true);
  const [hasLocalDraft, setHasLocalDraft] = useState(false);
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

  useEffect(() => {
    if (!planId) return;
    getDraft(planId).then(draft => setHasLocalDraft(!!draft));
  }, [planId]);

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
  }, [planId]);

  return { isOnline, hasLocalDraft, syncing, persistLocally, removeLocal };
}
