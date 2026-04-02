'use client';

import React from 'react';
import { Wifi, WifiOff, RefreshCw, Database } from 'lucide-react';
import { clsx } from 'clsx';
import { SkeuomorphicContainer } from './SkeuomorphicContainer';

interface SyncStatusProps {
  isOnline: boolean;
  isSyncing?: boolean;
  hasLocalData?: boolean;
}

export const SyncStatus: React.FC<SyncStatusProps> = ({
  isOnline,
  isSyncing = false,
  hasLocalData = false
}) => {
  return (
    <SkeuomorphicContainer inset className="flex items-center gap-4 px-4 py-2">
      <div className="flex items-center gap-2">
        {isOnline ? (
          <Wifi className="w-3.5 h-3.5 text-brand-success" />
        ) : (
          <WifiOff className="w-3.5 h-3.5 text-brand-danger animate-pulse" />
        )}
        <span className={clsx(
          "text-[10px] font-bold uppercase tracking-widest",
          isOnline ? "text-brand-secondary" : "text-brand-danger"
        )}>
          {isOnline ? "Cloud Connected" : "Offline Mode"}
        </span>
      </div>

      <div className="h-3 w-[1px] bg-brand-secondary/20" />

      <div className="flex items-center gap-2">
        {isSyncing ? (
          <RefreshCw className="w-3.5 h-3.5 text-brand-accent animate-spin" />
        ) : (
          <Database className={clsx("w-3.5 h-3.5", hasLocalData ? "text-brand-accent" : "text-brand-secondary opacity-40")} />
        )}
        <span className="text-[10px] font-bold text-brand-secondary uppercase tracking-widest">
          {isSyncing ? "Syncing..." : hasLocalData ? "Local Draft Ready" : "Data Synced"}
        </span>
      </div>
    </SkeuomorphicContainer>
  );
};
