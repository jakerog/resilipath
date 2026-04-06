'use client';

import React, { useMemo } from 'react';
import { useFirestoreQuery } from '@/hooks/useFirestoreQuery';
import { orderBy, where, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase';
import { SkeuomorphicContainer } from '@/components/layout/SkeuomorphicContainer';
import { Database, ShieldCheck, Tag, User, Clock, CheckCircle2, MapPin, X, Save, Plus } from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';

export default function AssetRegistry() {
  const { tenantId, user, loading: authLoading } = useAuth();
  const [isAdding, setIsAdding] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [editingAsset, setEditingAsset] = React.useState<any>(null);
  const [locationForm, setLocationForm] = React.useState({ lat: 0, lng: 0 });
  const [newAsset, setNewAsset] = React.useState({
    name: '',
    type: 'system',
    criticality: 'medium',
    bia: { rto: 240, rpo: 60 },
    location: { lat: 0, lng: 0 }
  });

  const constraints = useMemo(() => {
    if (!tenantId) return [];
    return [
      where('tenantId', '==', tenantId),
      orderBy('name', 'asc')
    ];
  }, [tenantId]);

  const { data: assets, loading: queryLoading } = useFirestoreQuery('assets', constraints, {
    enabled: !!tenantId && tenantId !== 'pending'
  });

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
        <button
          onClick={() => setIsAdding(true)}
          className="neumorphic-button px-6 py-2 text-xs font-bold text-brand-accent uppercase tracking-widest flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add New Asset
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

      {/* Add New Asset Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in zoom-in-95 duration-200">
          <SkeuomorphicContainer className="w-full max-w-lg p-8 space-y-6 relative">
            <button
              onClick={() => setIsAdding(false)}
              className="absolute top-6 right-6 text-brand-secondary hover:text-brand-primary"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h2 className="text-xl font-bold text-brand-primary">Register New Asset</h2>
              <p className="text-[10px] text-brand-secondary uppercase tracking-widest font-bold opacity-60">
                Asset Registry Entry
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-brand-secondary tracking-widest">Asset Name</label>
                  <input
                    type="text"
                    required
                    value={newAsset.name}
                    onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                    className="neumorphic-inset w-full bg-transparent p-4 rounded-xl text-sm text-brand-primary focus:outline-none"
                    placeholder="e.g. Primary DB Cluster"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-brand-secondary tracking-widest">Type</label>
                  <select
                    value={newAsset.type}
                    onChange={(e) => setNewAsset({ ...newAsset, type: e.target.value })}
                    className="neumorphic-inset w-full bg-transparent p-4 rounded-xl text-sm text-brand-primary focus:outline-none appearance-none"
                  >
                    <option value="system">System</option>
                    <option value="service">Service</option>
                    <option value="infrastructure">Infrastructure</option>
                    <option value="personnel">Personnel</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-brand-secondary tracking-widest">Criticality</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['low', 'medium', 'high', 'critical'].slice(1).map((level) => (
                      <button
                        key={level}
                        onClick={() => setNewAsset({ ...newAsset, criticality: level as any })}
                        className={clsx(
                          "p-2 rounded-lg text-[9px] font-bold uppercase tracking-tighter transition-all",
                          newAsset.criticality === level
                            ? "neumorphic-inset text-brand-accent bg-brand-accent/5"
                            : "neumorphic-button text-brand-secondary"
                        )}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-brand-secondary tracking-widest">RTO (min)</label>
                    <input
                      type="number"
                      value={newAsset.bia.rto}
                      onChange={(e) => setNewAsset({ ...newAsset, bia: { ...newAsset.bia, rto: parseInt(e.target.value) }})}
                      className="neumorphic-inset w-full bg-transparent p-4 rounded-xl text-sm text-brand-primary focus:outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-brand-secondary tracking-widest">RPO (min)</label>
                    <input
                      type="number"
                      value={newAsset.bia.rpo}
                      onChange={(e) => setNewAsset({ ...newAsset, bia: { ...newAsset.bia, rpo: parseInt(e.target.value) }})}
                      className="neumorphic-inset w-full bg-transparent p-4 rounded-xl text-sm text-brand-primary focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-4">
               <button
                onClick={() => setIsAdding(false)}
                className="px-6 py-3 text-[10px] font-bold text-brand-secondary uppercase tracking-widest"
              >
                Cancel
              </button>
              <button
                disabled={!newAsset.name || isSaving}
                onClick={async () => {
                  setIsSaving(true);
                  try {
                    await addDoc(collection(db, 'assets'), {
                      ...newAsset,
                      tenantId,
                      ownerUid: user?.uid,
                      lastReviewedAt: serverTimestamp(),
                      updatedAt: serverTimestamp(),
                      status: 'active'
                    });
                    setIsAdding(false);
                    setNewAsset({
                      name: '',
                      type: 'system',
                      criticality: 'medium',
                      bia: { rto: 240, rpo: 60 },
                      location: { lat: 0, lng: 0 }
                    });
                  } catch (err) {
                    console.error('Failed to add asset:', err);
                  } finally {
                    setIsSaving(false);
                  }
                }}
                className="neumorphic-button px-10 py-3 text-[10px] font-bold text-brand-primary uppercase tracking-widest flex items-center gap-2"
              >
                {isSaving ? <div className="w-3 h-3 border-2 border-brand-accent border-t-transparent animate-spin rounded-full" /> : <Save className="w-3 h-3 text-brand-accent" />}
                Add Asset
              </button>
            </div>
          </SkeuomorphicContainer>
        </div>
      )}

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
