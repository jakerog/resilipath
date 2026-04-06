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
  Webhook,
  Plus,
  Trash2,
  Activity,
  Save,
  X,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import clsx from 'clsx';

export default function WebhookSettings() {
  const { tenantId } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newWebhook, setNewWebhook] = useState({
    type: 'outbound',
    url: '',
    secret: '',
    events: ['task.failed'],
    active: true
  });

  // 1. Fetch Webhook Configs
  const webhookConstraints = useMemo(() => {
    if (!tenantId || tenantId === 'pending') return [];
    return [where('tenantId', '==', tenantId)];
  }, [tenantId]);

  const { data: webhooks, loading } = useFirestoreQuery('webhook_configs', webhookConstraints, {
    enabled: !!tenantId && tenantId !== 'pending'
  });

  const handleCreate = async () => {
    if (!tenantId || (newWebhook.type === 'outbound' && !newWebhook.url)) return;
    setIsSaving(true);
    try {
      await addDoc(collection(db, 'webhook_configs'), {
        ...newWebhook,
        tenantId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      setIsModalOpen(false);
      setNewWebhook({
        type: 'outbound',
        url: '',
        secret: '',
        events: ['task.failed'],
        active: true
      });
    } catch (err) {
      console.error('Failed to create webhook:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this webhook?')) return;
    try {
      await deleteDoc(doc(db, 'webhook_configs', id));
    } catch (err) {
      console.error('Failed to delete webhook:', err);
    }
  };

  const toggleWebhookStatus = async (webhook: any) => {
    try {
      await updateDoc(doc(db, 'webhook_configs', webhook.id), {
        active: !webhook.active,
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-[#f4f7f6] p-4 md:p-8">
      <header className="max-w-4xl mx-auto mb-10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SkeuomorphicContainer className="p-3">
            <Webhook className="w-8 h-8 text-brand-accent" />
          </SkeuomorphicContainer>
          <div>
            <h1 className="text-2xl font-bold text-brand-primary tracking-tight">Webhook Engine</h1>
            <p className="text-xs text-brand-secondary font-medium uppercase tracking-widest opacity-60">
              Integrations & External Orchestration
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
        {webhooks.length === 0 ? (
          <SkeuomorphicContainer className="p-12 text-center space-y-4">
            <div className="mx-auto w-16 h-16 neumorphic-inset rounded-full flex items-center justify-center">
              <Activity className="w-8 h-8 text-brand-secondary opacity-30" />
            </div>
            <p className="text-sm text-brand-secondary font-medium">No webhooks configured yet.</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-xs font-bold text-brand-accent uppercase tracking-widest"
            >
              Add your first integration
            </button>
          </SkeuomorphicContainer>
        ) : (
          <div className="grid gap-6">
            {webhooks.map((webhook: any) => (
              <SkeuomorphicContainer key={webhook.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3">
                      <span className={clsx(
                        "text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md",
                        webhook.type === 'inbound' ? "bg-brand-success/10 text-brand-success" : "bg-brand-accent/10 text-brand-accent"
                      )}>
                        {webhook.type}
                      </span>
                      <h3 className="text-sm font-bold text-brand-primary truncate max-w-md">
                        {webhook.type === 'inbound' ? `Inbound Endpoint (ID: ${webhook.id})` : webhook.url}
                      </h3>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <Activity className="w-3.5 h-3.5 text-brand-secondary" />
                        <span className="text-xs text-brand-secondary">
                          {webhook.events?.join(', ') || 'All Events'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-3.5 h-3.5 text-brand-secondary" />
                        <span className="text-xs text-brand-secondary font-mono">
                          Secret: ••••••••
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleWebhookStatus(webhook)}
                      className={clsx(
                        "w-12 h-6 rounded-full transition-all relative",
                        webhook.active ? "bg-brand-success shadow-inner" : "bg-brand-secondary/20 neumorphic-inset"
                      )}
                    >
                      <div className={clsx(
                        "absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-md",
                        webhook.active ? "left-7" : "left-1"
                      )} />
                    </button>
                    <button
                      onClick={() => handleDelete(webhook.id)}
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

        <div className="bg-brand-accent/5 border border-brand-accent/20 p-4 rounded-2xl flex gap-3">
          <AlertCircle className="w-5 h-5 text-brand-accent shrink-0" />
          <div className="space-y-1">
            <p className="text-xs text-brand-primary font-bold">Integration Tip</p>
            <p className="text-[10px] text-brand-secondary leading-relaxed">
              Inbound webhooks allow external tools to trigger tasks. Use the endpoint URL:
              <code className="mx-1 p-1 bg-white rounded">https://[region]-[project].cloudfunctions.net/processInboundWebhook</code>
              with your Webhook ID and Secret in the payload.
            </p>
          </div>
        </div>
      </main>

      {/* New Webhook Modal */}
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
              <h2 className="text-xl font-bold text-brand-primary">Configure Webhook</h2>
              <p className="text-[10px] text-brand-secondary uppercase tracking-widest font-bold opacity-60">
                Register a new external integration
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {['outbound', 'inbound'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setNewWebhook({ ...newWebhook, type: type as any })}
                    className={clsx(
                      "p-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                      newWebhook.type === type
                        ? "neumorphic-inset text-brand-accent bg-brand-accent/5"
                        : "neumorphic-button text-brand-secondary"
                    )}
                  >
                    {type}
                  </button>
                ))}
              </div>

              {newWebhook.type === 'outbound' && (
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-brand-secondary tracking-widest">Target URL</label>
                  <input
                    type="url"
                    required
                    value={newWebhook.url}
                    onChange={(e) => setNewWebhook({ ...newWebhook, url: e.target.value })}
                    className="neumorphic-inset w-full bg-transparent p-4 rounded-xl text-sm text-brand-primary focus:outline-none"
                    placeholder="https://hooks.slack.com/services/..."
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-brand-secondary tracking-widest">Secret Token</label>
                <input
                  type="text"
                  required
                  value={newWebhook.secret}
                  onChange={(e) => setNewWebhook({ ...newWebhook, secret: e.target.value })}
                  className="neumorphic-inset w-full bg-transparent p-4 rounded-xl text-sm text-brand-primary focus:outline-none"
                  placeholder="Shared secret for validation"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-brand-secondary tracking-widest">Events</label>
                <div className="flex flex-wrap gap-2">
                  {['task.failed', 'exercise.completed', 'plan.approved'].map((event) => (
                    <button
                      key={event}
                      onClick={() => {
                        const events = newWebhook.events.includes(event)
                          ? newWebhook.events.filter(e => e !== event)
                          : [...newWebhook.events, event];
                        setNewWebhook({ ...newWebhook, events });
                      }}
                      className={clsx(
                        "px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border",
                        newWebhook.events.includes(event)
                          ? "bg-brand-accent border-brand-accent text-white"
                          : "border-brand-secondary/20 text-brand-secondary hover:border-brand-accent"
                      )}
                    >
                      {event}
                    </button>
                  ))}
                </div>
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
                disabled={isSaving || (newWebhook.type === 'outbound' && !newWebhook.url) || !newWebhook.secret}
                className="neumorphic-button px-8 py-3 text-[10px] font-bold text-brand-primary uppercase tracking-widest flex items-center gap-2 disabled:opacity-50"
              >
                {isSaving ? (
                  <div className="w-3 h-3 border-2 border-brand-accent border-t-transparent animate-spin rounded-full" />
                ) : (
                  <Save className="w-3 h-3 text-brand-accent" />
                )}
                Register Webhook
              </button>
            </div>
          </SkeuomorphicContainer>
        </div>
      )}
    </div>
  );
}
