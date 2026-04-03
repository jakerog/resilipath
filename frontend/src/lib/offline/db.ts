/**
 * ResiliPath - IndexedDB Wrapper for Offline Planning
 */

const DB_NAME = 'resilipath_offline';
const DB_VERSION = 1;
const STORE_NAME = 'plan_drafts';

export interface PlanDraft {
  planId: string;
  tenantId: string;
  data: Record<string, any>;
  updatedAt: number;
}

export function openOfflineDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'planId' });
      }
    };
  });
}

export async function saveDraft(draft: PlanDraft): Promise<void> {
  const db = await openOfflineDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(draft);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function getDraft(planId: string): Promise<PlanDraft | null> {
  const db = await openOfflineDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(planId);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || null);
  });
}

export async function clearDraft(planId: string): Promise<void> {
  const db = await openOfflineDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(planId);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}
