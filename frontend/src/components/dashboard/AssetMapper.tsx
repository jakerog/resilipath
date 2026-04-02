import React, { useMemo } from 'react';
import { useFirestoreQuery } from '@/hooks/useFirestoreQuery';
import { SkeuomorphicContainer } from '@/components/layout/SkeuomorphicContainer';
import { Tag, CheckCircle2, Circle, X } from 'lucide-react';
import { clsx } from 'clsx';

interface AssetMapperProps {
  selectedAssetIds: string[];
  onToggleAsset: (assetId: string) => void;
  onClose: () => void;
}

export const AssetMapper: React.FC<AssetMapperProps> = ({
  selectedAssetIds,
  onToggleAsset,
  onClose
}) => {
  const { data: assets, loading } = useFirestoreQuery('assets');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
      <SkeuomorphicContainer className="w-full max-w-lg max-h-[80vh] flex flex-col p-0 overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-brand-secondary/10 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-brand-primary">Link Critical Assets</h2>
            <p className="text-xs text-brand-secondary font-medium uppercase tracking-wider">
              Map dependencies for this task
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-brand-secondary/5 transition-colors"
          >
            <X className="w-5 h-5 text-brand-secondary" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {loading ? (
            <div className="py-12 text-center flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-brand-accent/30 border-t-brand-accent rounded-full animate-spin" />
              <p className="text-xs font-bold text-brand-secondary uppercase tracking-widest">
                Fetching Inventory...
              </p>
            </div>
          ) : assets.length === 0 ? (
            <div className="py-12 text-center opacity-40">
              <Tag className="w-12 h-12 mx-auto mb-3" />
              <p className="text-sm italic">No assets found in registry.</p>
            </div>
          ) : (
            assets.map((asset: any) => {
              const isSelected = selectedAssetIds.includes(asset.assetId);
              return (
                <button
                  key={asset.assetId}
                  onClick={() => onToggleAsset(asset.assetId)}
                  className={clsx(
                    "w-full text-left p-4 rounded-xl transition-all flex items-center justify-between group",
                    isSelected
                      ? "neumorphic-inset bg-brand-accent/5 border-brand-accent/20"
                      : "hover:bg-brand-secondary/5 border-transparent"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={clsx(
                      "p-2 rounded-lg neumorphic-inset transition-colors",
                      isSelected ? "text-brand-accent" : "text-brand-secondary"
                    )}>
                      <Tag className="w-4 h-4" />
                    </div>
                    <div>
                      <p className={clsx(
                        "font-bold transition-colors",
                        isSelected ? "text-brand-primary" : "text-brand-secondary group-hover:text-brand-primary"
                      )}>
                        {asset.name}
                      </p>
                      <p className="text-[10px] font-bold uppercase tracking-wider opacity-60">
                        {asset.type} • {asset.criticality}
                      </p>
                    </div>
                  </div>
                  {isSelected ? (
                    <CheckCircle2 className="w-5 h-5 text-brand-accent" />
                  ) : (
                    <Circle className="w-5 h-5 text-brand-secondary/30" />
                  )}
                </button>
              );
            })
          )}
        </div>

        <div className="p-6 bg-brand-primary/5 border-t border-brand-secondary/10 flex justify-end">
          <button
            onClick={onClose}
            className="neumorphic-button px-6 py-2 text-xs font-bold text-brand-primary uppercase tracking-widest"
          >
            Done
          </button>
        </div>
      </SkeuomorphicContainer>
    </div>
  );
};
