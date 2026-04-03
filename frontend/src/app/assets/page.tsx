'use client';

import React, { useMemo } from 'react';
import { useFirestoreQuery } from '@/hooks/useFirestoreQuery';
import { orderBy, where, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase';
import { SkeuomorphicContainer } from '@/components/layout/SkeuomorphicContainer';
import { Database, ShieldCheck, Tag, User, Clock, CheckCircle2, MapPin, X, Save } from 'lucide-react';

export default function AssetRegistry() {
  const { tenantId, loading: authLoading } = useAuth();
  const [editingAsset, setEditingAsset] = React.useState<any>(null);
  const [locationForm, setLocationForm] = React.useState({ lat: 0, lng: 0 });

  const constraints = useMemo(() => {
    if (!tenantId) return [];
    return [
      where('tenantId', '==', tenantId),
      orderBy('name', 'asc')
    ];
  }, [tenantId]);

  const { data: assets, loading: queryLoading } = useFirestoreQuery('assets', constraints);

  const handleMarkReviewed = async (assetId: string) => {
    try {
      const assetRef = doc(db, 'assets', assetId);
      await updateDoc(assetRef, {
        lastReviewedAt: serverTimestamp()
      });
    } catch (err) {
      console.error('Failed to update review status:', err);
    }
  };

  const loading = authLoading || queryLoading;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f7f6]">
        <div className="flex flex-col items-center gap-4">
          <Database className="w-10 h-10 text-brand-accent animate-pulse" />
          <p className="text-sm font-bold text-brand-primary uppercase tracking-widest">
            Loading Asset Inventory...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f7f6] p-4 md:p-8">
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-4">
          <SkeuomorphicContainer className="p-3">
            <Database className="w-6 h-6 text-brand-accent" />
          </SkeuomorphicContainer>
          <div>
            <h1 className="text-2xl font-bold text-brand-primary">Asset Registry</h1>
            <p className="text-xs text-brand-secondary font-medium uppercase tracking-widest opacity-60">
              Critical Systems & Infrastructure Inventory
            </p>
          </div>
        </div>
        <button className="neumorphic-button px-6 py-2 text-xs font-bold text-brand-primary uppercase tracking-wider">
          Add New Asset
        </button>
      </header>

      <main className="max-w-7xl mx-auto">
        <SkeuomorphicContainer className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-brand-primary/5 text-[10px] uppercase tracking-widest text-brand-secondary font-bold">
                  <th className="px-6 py-4">Asset Name</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Criticality</th>
                  <th className="px-6 py-4">RTO / RPO</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Last Reviewed</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-secondary/10">
                {assets.map((asset: any) => (
                  <tr key={asset.id} className="hover:bg-brand-accent/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg neumorphic-inset text-brand-secondary group-hover:text-brand-accent transition-colors">
                          <Tag className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-brand-primary">{asset.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-medium text-brand-secondary uppercase">{asset.type}</span>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          asset.criticality === 'critical' ? 'bg-brand-danger animate-pulse' :
                          asset.criticality === 'high' ? 'bg-brand-warning' : 'bg-brand-success'
                        }`} />
                        <span className="text-xs font-bold text-brand-primary capitalize">{asset.criticality}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col text-[10px] font-bold uppercase text-brand-secondary">
                        <span>RTO: {asset.bia?.rto}m</span>
                        <span>RPO: {asset.bia?.rpo}m</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col text-[10px] font-bold text-brand-secondary opacity-60">
                        <span>{asset.location?.lat ? `${asset.location.lat.toFixed(4)}° N` : 'No Lat'}</span>
                        <span>{asset.location?.lng ? `${asset.location.lng.toFixed(4)}° W` : 'No Lng'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-brand-secondary">
                      {asset.lastReviewedAt?.toDate?.().toLocaleDateString() || 'Pending Review'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingAsset(asset);
                            setLocationForm({
                              lat: asset.location?.lat || 0,
                              lng: asset.location?.lng || 0
                            });
                          }}
                          className="neumorphic-button p-2 text-brand-accent hover:scale-110 transition-transform"
                          title="Edit Location"
                        >
                          <MapPin className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleMarkReviewed(asset.id)}
                          className="neumorphic-button p-2 text-brand-success hover:scale-110 transition-transform"
                          title="Mark as Reviewed"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {assets.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-2 opacity-40">
                        <ShieldCheck className="w-8 h-8" />
                        <p className="text-sm italic">No assets registered in this tenant.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </SkeuomorphicContainer>
      </main>

      {/* Location Edit Modal */}
      {editingAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in duration-300">
          <SkeuomorphicContainer className="w-full max-w-md space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-brand-primary">Update Location</h2>
              <button onClick={() => setEditingAsset(null)} className="neumorphic-button p-2">
                <X className="w-4 h-4 text-brand-secondary" />
              </button>
            </div>

            <p className="text-xs text-brand-secondary font-medium">
              Updating coordinates for <span className="text-brand-primary font-bold">{editingAsset.name}</span>.
            </p>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-brand-secondary tracking-widest">Latitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={locationForm.lat}
                  onChange={(e) => setLocationForm({ ...locationForm, lat: parseFloat(e.target.value) })}
                  className="neumorphic-inset w-full bg-transparent p-3 rounded-xl text-sm text-brand-primary focus:outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-brand-secondary tracking-widest">Longitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={locationForm.lng}
                  onChange={(e) => setLocationForm({ ...locationForm, lng: parseFloat(e.target.value) })}
                  className="neumorphic-inset w-full bg-transparent p-3 rounded-xl text-sm text-brand-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-4 flex gap-3">
               <button
                onClick={() => setEditingAsset(null)}
                className="flex-1 neumorphic-button py-2.5 text-xs font-bold text-brand-secondary uppercase tracking-widest"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    const assetRef = doc(db, 'assets', editingAsset.id);
                    await updateDoc(assetRef, {
                      location: locationForm,
                      updatedAt: serverTimestamp()
                    });
                    setEditingAsset(null);
                  } catch (err) {
                    console.error('Failed to update location:', err);
                  }
                }}
                className="flex-1 neumorphic-button py-2.5 text-xs font-bold text-brand-primary uppercase tracking-widest flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4 text-brand-accent" />
                Save Changes
              </button>
            </div>
          </SkeuomorphicContainer>
        </div>
      )}
    </div>
  );
}
