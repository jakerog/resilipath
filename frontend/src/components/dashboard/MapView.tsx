'use client';

import React, { useMemo } from 'react';
import { SkeuomorphicContainer } from '@/components/layout/SkeuomorphicContainer';
import { MapPin, Info, Shield } from 'lucide-react';
import { clsx } from 'clsx';

interface MapViewProps {
  assets: any[];
  className?: string;
}

export const MapView: React.FC<MapViewProps> = ({ assets, className }) => {
  // 1. Filter and Cluster assets with location data
  const clusters = useMemo(() => {
    const validAssets = assets.filter(a => a.location?.lat && a.location?.lng);
    const groups: Record<string, any[]> = {};

    validAssets.forEach(asset => {
      // Simple coordinate-based clustering (approx 0.001 degree precision)
      const key = `${asset.location.lat.toFixed(3)}_${asset.location.lng.toFixed(3)}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(asset);
    });

    return Object.values(groups);
  }, [assets]);

  // 2. Mock Map Implementation (Skeuomorphic Visualization)
  // In a real implementation, we'd use Leaflet or Mapbox.
  // For this tactile UI, we'll create a stylized "Radar/Grid" map.
  return (
    <SkeuomorphicContainer className={clsx("relative h-[400px] w-full overflow-hidden p-0", className)}>
      {/* Grid Background */}
      <div className="absolute inset-0 bg-[#f4f7f6] opacity-50"
           style={{ backgroundImage: 'radial-gradient(circle, #ced4da 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

      {/* Map Content Overlay */}
      <div className="absolute inset-0 p-8 flex flex-col justify-between pointer-events-none">
        <header className="flex justify-between items-start">
          <div className="bg-white/80 backdrop-blur px-3 py-1.5 rounded-lg neumorphic-button pointer-events-auto">
            <h3 className="text-[10px] font-bold text-brand-primary uppercase tracking-widest flex items-center gap-2">
              <Shield className="w-3 h-3 text-brand-success" />
              Geographical Asset Distribution
            </h3>
          </div>

          <div className="bg-white/80 backdrop-blur px-3 py-1.5 rounded-lg neumorphic-button pointer-events-auto text-[10px] font-bold text-brand-secondary">
             {assets.filter(a => a.location?.lat).length} Mapped Assets
          </div>
        </header>

        {/* Legend / Info */}
        <footer className="bg-white/80 backdrop-blur p-3 rounded-lg neumorphic-button pointer-events-auto max-w-[200px]">
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-brand-secondary/10">
             <Info className="w-3 h-3 text-brand-accent" />
             <span className="text-[9px] font-bold uppercase text-brand-primary">Legend</span>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-brand-danger" />
              <span className="text-[8px] font-bold text-brand-secondary uppercase">Critical Site</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-brand-success" />
              <span className="text-[8px] font-bold text-brand-secondary uppercase">Secure Site</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Asset Pins & Clusters (Mock Placement for Visualization) */}
      <div className="absolute inset-0 flex items-center justify-center">
        {clusters.length > 0 ? (
          clusters.map((group, idx) => {
            const asset = group[0];
            const isCluster = group.length > 1;
            const hasCritical = group.some(a => a.criticality === 'critical');

            // Convert lat/lng to stylized percentage positions (Simplified for mock)
            const left = ((asset.location.lng + 180) / 360) * 100;
            const top = (1 - (asset.location.lat + 90) / 180) * 100;

            return (
              <div
                key={idx}
                className="absolute transition-all duration-700 hover:scale-110 cursor-pointer group"
                style={{ left: `${left}%`, top: `${top}%` }}
              >
                <div className="relative">
                  <div className="relative flex items-center justify-center">
                    <MapPin className={clsx(
                      "w-7 h-7 drop-shadow-xl",
                      hasCritical ? "text-brand-danger animate-pulse" : "text-brand-accent"
                    )} />
                    {isCluster && (
                      <div className="absolute -top-1 -right-1 bg-brand-primary text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-[#f4f7f6] neumorphic-button">
                        {group.length}
                      </div>
                    )}
                  </div>

                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    <SkeuomorphicContainer className="p-2 min-w-[120px]">
                      <p className="text-[10px] font-black text-brand-primary border-b border-brand-secondary/10 pb-1 mb-1 uppercase tracking-tighter">
                        {isCluster ? `${group.length} Assets at Site` : asset.name}
                      </p>
                      <ul className="space-y-1">
                        {group.slice(0, 3).map(a => (
                          <li key={a.id} className="text-[8px] font-bold text-brand-secondary flex items-center gap-1">
                            <div className={clsx(
                              "w-1.5 h-1.5 rounded-full",
                              a.criticality === 'critical' ? "bg-brand-danger" : "bg-brand-accent"
                            )} />
                            {a.name}
                          </li>
                        ))}
                        {group.length > 3 && (
                          <li className="text-[8px] italic text-brand-secondary/60">+{group.length - 3} more...</li>
                        )}
                      </ul>
                    </SkeuomorphicContainer>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center space-y-3 opacity-30">
            <MapPin className="w-12 h-12 mx-auto text-brand-secondary" />
            <p className="text-[10px] font-bold uppercase tracking-widest">No assets with location data found.</p>
          </div>
        )}
      </div>

      {/* Grid Coordinates (Aesthetic) */}
      <div className="absolute bottom-2 right-4 text-[8px] font-mono text-brand-secondary/40 font-bold uppercase">
        40.7128° N, 74.0060° W
      </div>
    </SkeuomorphicContainer>
  );
};
