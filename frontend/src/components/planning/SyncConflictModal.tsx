'use client';

import React from 'react';
import { SkeuomorphicContainer } from '@/components/layout/SkeuomorphicContainer';
import { AlertTriangle, CloudUpload, Trash2, Clock } from 'lucide-react';

interface SyncConflictModalProps {
  localUpdatedAt: number;
  onSync: () => void;
  onDiscard: () => void;
  isSyncing?: boolean;
}

export const SyncConflictModal: React.FC<SyncConflictModalProps> = ({
  localUpdatedAt,
  onSync,
  onDiscard,
  isSyncing = false
}) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-300">
      <SkeuomorphicContainer className="w-full max-w-md p-8 space-y-6">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="p-4 rounded-full bg-brand-warning/10 text-brand-warning">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-brand-primary">Unsynced Local Changes</h2>
            <p className="text-sm text-brand-secondary mt-2">
              We found a newer draft saved locally from your offline session.
              Would you like to sync it to the cloud?
            </p>
          </div>
        </div>

        <div className="neumorphic-inset p-4 flex items-center justify-between rounded-xl">
           <div className="flex items-center gap-3 text-brand-secondary">
             <Clock className="w-4 h-4" />
             <div className="flex flex-col">
               <span className="text-[10px] font-bold uppercase opacity-60">Local Draft Saved</span>
               <span className="text-xs font-bold">{new Date(localUpdatedAt).toLocaleString()}</span>
             </div>
           </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={onDiscard}
            disabled={isSyncing}
            className="neumorphic-button py-3 text-xs font-bold text-brand-danger uppercase tracking-widest flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" /> Discard
          </button>
          <button
            onClick={onSync}
            disabled={isSyncing}
            className="neumorphic-button py-3 text-xs font-bold text-brand-accent uppercase tracking-widest flex items-center justify-center gap-2"
          >
            <CloudUpload className={isSyncing ? "animate-bounce" : "w-4 h-4"} />
            {isSyncing ? "Syncing..." : "Sync to Cloud"}
          </button>
        </div>
      </SkeuomorphicContainer>
    </div>
  );
};
