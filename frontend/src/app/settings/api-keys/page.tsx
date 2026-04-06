'use client';

import React, { useMemo, useState } from 'react';
import { useFirestoreQuery } from '@/hooks/useFirestoreQuery';
import {
  where,
  doc,
  addDoc,
  deleteDoc,
  updateDoc,
  collection,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { SkeuomorphicContainer } from '@/components/layout/SkeuomorphicContainer';
import {
  Key,
  Plus,
  Trash2,
  Copy,
  Check,
  Save,
  X,
  ShieldCheck,
  Zap,
  AlertTriangle
} from 'lucide-react';
import { clsx } from 'clsx';

export default function APIKeySettings() {
  const { tenantId } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [newKey, setNewKey] = useState({
    name: '',
    description: '',
    active: true
  });

  // 1. Fetch API Keys
  const constraints = useMemo(() => {
    if (!tenantId) return [];
    return [where('tenantId', '==', tenantId)];
  }, [tenantId]);

  const { data: apiKeys, loading } = useFirestoreQuery('api_keys', constraints);

  const handleCreate = async () => {
    if (!tenantId || !newKey.name) return;
    setIsSaving(true);
    try {
      // In a real system, the actual secret would be generated and shown once.
      // Here we use the document ID as the key for simplicity in this prototype.
      await addDoc(collection(db, 'api_keys'), {
        ...newKey,
        tenantId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      setIsModalOpen(false);
      setNewKey({
        name: '',
        description: '',
        active: true
      });
    } catch (err) {
      console.error('Failed to create API key:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this API key? This action is irreversible.')) return;
    try {
      await deleteDoc(doc(db, 'api_keys', id));
    } catch (err) {
      console.error('Failed to delete API key:', err);
    }
  };

  const toggleKeyStatus = async (key: any) => {
    try {
      await updateDoc(doc(db, 'api_keys', key.id), {
        active: !key.active,
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-[#f4f7f6] p-4 md:p-8">
      <header className="max-w-4xl mx-auto mb-10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SkeuomorphicContainer className="p-3">
            <ShieldCheck className="w-8 h-8 text-brand-accent" />
          </SkeuomorphicContainer>
          <div>
            <h1 className="text-2xl font-bold text-brand-primary tracking-tight">Partner API Keys</h1>
            <p className="text-xs text-brand-secondary font-medium uppercase tracking-widest opacity-60">
              Secure Access for External Systems
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="neumorphic-button p-4 rounded-full text-brand-accent"
        >
          <Plus className="w-6 h-6" />
        </button>
      </header>

      <main className="max-w-4xl mx-auto space-y-6">
        {apiKeys.length === 0 ? (
          <SkeuomorphicContainer className="p-12 text-center space-y-4">
            <div className="mx-auto w-16 h-16 neumorphic-inset rounded-full flex items-center justify-center">
              <Key className="w-8 h-8 text-brand-secondary opacity-30" />
            </div>
            <p className="text-sm text-brand-secondary font-medium">No API keys generated yet.</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-xs font-bold text-brand-accent uppercase tracking-widest"
            >
              Generate your first key
            </button>
          </SkeuomorphicContainer>
        ) : (
          <div className="grid gap-6">
            {apiKeys.map((key: any) => (
              <SkeuomorphicContainer key={key.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-sm font-bold text-brand-primary">
                        {key.name}
                      </h3>
                      {!key.active && (
                        <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-brand-danger/10 text-brand-danger">
                          Inactive
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-brand-secondary line-clamp-1">{key.description || 'No description provided.'}</p>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 p-2 px-3 neumorphic-inset rounded-lg bg-white/50 w-fit">
                        <code className="text-[10px] font-mono text-brand-primary opacity-70">
                          {key.id}
                        </code>
                        <button
                          onClick={() => copyToClipboard(key.id, key.id)}
                          className="hover:text-brand-accent transition-colors"
                        >
                          {copiedId === key.id ? <Check className="w-3.5 h-3.5 text-brand-success" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      <span className="text-[10px] text-brand-secondary font-medium uppercase tracking-widest opacity-40">
                        Created: {key.createdAt?.toDate().toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleKeyStatus(key)}
                      className={clsx(
                        "w-12 h-6 rounded-full transition-all relative",
                        key.active ? "bg-brand-success shadow-inner" : "bg-brand-secondary/20 neumorphic-inset"
                      )}
                    >
                      <div className={clsx(
                        "absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-md",
                        key.active ? "left-7" : "left-1"
                      )} />
                    </button>
                    <button
                      onClick={() => handleDelete(key.id)}
                      className="p-2 text-brand-danger opacity-60 hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </SkeuomorphicContainer>
            ))}
          </div>
        )}

        <div className="bg-brand-warning/5 border border-brand-warning/20 p-4 rounded-2xl flex gap-3">
          <AlertTriangle className="w-5 h-5 text-brand-warning shrink-0" />
          <div className="space-y-1">
            <p className="text-xs text-brand-primary font-bold">Security Warning</p>
            <p className="text-[10px] text-brand-secondary leading-relaxed">
              API Keys grant full programmatic access to your tenant's data. Never share them in client-side code or public repositories.
              Rotate keys immediately if you suspect they have been compromised.
            </p>
          </div>
        </div>

        <div className="bg-brand-accent/5 border border-brand-accent/20 p-4 rounded-2xl flex gap-3">
          <Zap className="w-5 h-5 text-brand-accent shrink-0" />
          <div className="space-y-1">
            <p className="text-xs text-brand-primary font-bold">Usage Instructions</p>
            <p className="text-[10px] text-brand-secondary leading-relaxed font-mono">
              curl -H "x-api-key: [YOUR_KEY]" https://resilipath.api/v1/exercises
            </p>
          </div>
        </div>
      </main>

      {/* New API Key Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
          <SkeuomorphicContainer className="w-full max-w-md p-8 space-y-6 relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 text-brand-secondary hover:text-brand-primary"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-brand-primary">Generate API Key</h2>
              <p className="text-[10px] text-brand-secondary uppercase tracking-widest font-bold opacity-60">
                Create new credentials for partner integration
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-brand-secondary tracking-widest">Key Name</label>
                <input
                  type="text"
                  required
                  value={newKey.name}
                  onChange={(e) => setNewKey({ ...newKey, name: e.target.value })}
                  className="neumorphic-inset w-full bg-transparent p-4 rounded-xl text-sm text-brand-primary focus:outline-none"
                  placeholder="e.g. ServiceNow Integration"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-brand-secondary tracking-widest">Description</label>
                <textarea
                  value={newKey.description}
                  onChange={(e) => setNewKey({ ...newKey, description: e.target.value })}
                  className="neumorphic-inset w-full bg-transparent p-4 rounded-xl text-sm text-brand-primary focus:outline-none min-h-[100px]"
                  placeholder="What is this key used for?"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-3 text-[10px] font-bold text-brand-secondary uppercase tracking-widest"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={isSaving || !newKey.name}
                className="neumorphic-button px-8 py-3 text-[10px] font-bold text-brand-primary uppercase tracking-widest flex items-center gap-2 disabled:opacity-50"
              >
                {isSaving ? (
                  <div className="w-3 h-3 border-2 border-brand-accent border-t-transparent animate-spin rounded-full" />
                ) : (
                  <Save className="w-3 h-3 text-brand-accent" />
                )}
                Generate Key
              </button>
            </div>
          </SkeuomorphicContainer>
        </div>
      )}
    </div>
  );
}
