'use client';

import React, { useMemo } from 'react';
import { useFirestoreQuery } from '@/hooks/useFirestoreQuery';
import { where, orderBy, limit } from 'firebase/firestore';
import { functions } from '@/lib/firebase';
import { httpsCallable } from 'firebase/functions';
import { useAuth } from '@/hooks/useAuth';
import { SkeuomorphicContainer } from '@/components/layout/SkeuomorphicContainer';
import { Smartphone, Mail, Phone, AlertTriangle, Send, CheckCircle2, Loader2, Users } from 'lucide-react';
import { clsx } from 'clsx';

export default function CrisisCommand() {
  const { tenantId } = useAuth();
  const [message, setMessage] = React.useState('');
  const [isTriggering, setIsTriggering] = React.useState(false);
  const [status, setStatus] = React.useState<{ success?: boolean; error?: string } | null>(null);

  // 1. Recent Notifications for tracking
  const logConstraints = useMemo(() => {
    if (!tenantId) return [];
    return [
      where('tenantId', '==', tenantId),
      where('what', '==', 'CRISIS_PANIC_BUTTON_TRIGGERED'),
      orderBy('when', 'desc'),
      limit(5)
    ];
  }, [tenantId]);

  const { data: auditLogs } = useFirestoreQuery('audit_logs', logConstraints);

  // 2. Crisis Contacts for visibility
  const contactConstraints = useMemo(() => {
    if (!tenantId) return [];
    return [where('tenantId', '==', tenantId), where('active', '==', true)];
  }, [tenantId]);

  const { data: contacts } = useFirestoreQuery('crisis_contacts', contactConstraints);

  const handleTrigger = async () => {
    if (!message || isTriggering) return;
    setIsTriggering(true);
    setStatus(null);

    try {
      const panicFunc = httpsCallable(functions, 'triggerPanicButton');
      const result = await panicFunc({ message }) as any;
      setStatus({ success: true });
      setMessage('');
      console.log('Crisis triggered:', result.data);
    } catch (err: any) {
      console.error('Panic button failed:', err);
      setStatus({ error: err.message || 'Failed to trigger alert' });
    } finally {
      setIsTriggering(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7f6] p-4 md:p-8">
      <header className="max-w-6xl mx-auto mb-10 flex items-center gap-4">
        <SkeuomorphicContainer className="p-3">
          <AlertTriangle className="w-8 h-8 text-brand-danger animate-pulse" />
        </SkeuomorphicContainer>
        <div>
          <h1 className="text-3xl font-black text-brand-primary uppercase tracking-tighter">Crisis Command Center</h1>
          <p className="text-xs text-brand-secondary font-bold uppercase tracking-widest opacity-60">
            Emergency Mass Notification & Situational Awareness
          </p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto grid lg:grid-cols-12 gap-8 items-start">
        {/* LEFT: Trigger Area */}
        <section className="lg:col-span-7 space-y-8">
          <SkeuomorphicContainer className="p-8 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-brand-primary uppercase tracking-widest flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-brand-danger" />
                Active Crisis Trigger
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-danger/10 text-brand-danger uppercase">
                Critical Priority
              </span>
            </div>

            <p className="text-xs text-brand-secondary leading-relaxed">
              Enter your emergency message below. This will be dispatched via **Email**, **SMS**, and **Automated Voice Call** to all active crisis contacts.
            </p>

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g. Regional Data Center outage detected. Initializing Resilience Plan Bravo. Please stand by for check-in."
              className="neumorphic-inset w-full bg-transparent p-6 rounded-2xl text-brand-primary text-sm min-h-[160px] focus:outline-none placeholder:text-brand-secondary/30 font-medium"
            />

            <div className="flex flex-col gap-4">
               <button
                onClick={handleTrigger}
                disabled={!message || isTriggering}
                className={clsx(
                  "w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-3",
                  !message || isTriggering
                    ? "neumorphic-inset text-brand-secondary opacity-50 cursor-not-allowed"
                    : "neumorphic-button text-white bg-brand-danger hover:scale-[1.01]"
                )}
              >
                {isTriggering ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
                {isTriggering ? 'Dispatching Mass Alerts...' : 'Trigger Panic Button'}
              </button>

              {status?.success && (
                 <div className="flex items-center gap-2 text-brand-success text-xs font-bold uppercase justify-center animate-in slide-in-from-top-2">
                   <CheckCircle2 className="w-4 h-4" /> Alerts Dispatched Successfully
                 </div>
              )}
              {status?.error && (
                 <div className="flex items-center gap-2 text-brand-danger text-xs font-bold uppercase justify-center animate-in slide-in-from-top-2">
                   <AlertTriangle className="w-4 h-4" /> {status.error}
                 </div>
              )}
            </div>
          </SkeuomorphicContainer>

          <SkeuomorphicContainer className="p-6 space-y-4">
            <h3 className="text-xs font-bold text-brand-primary uppercase tracking-widest">Active Channels</h3>
            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: Mail, label: 'Email', color: 'text-brand-accent' },
                { icon: Smartphone, label: 'SMS', color: 'text-brand-warning' },
                { icon: Phone, label: 'Voice', color: 'text-brand-success' }
              ].map(item => (
                <SkeuomorphicContainer key={item.label} inset className="p-4 flex flex-col items-center gap-2">
                  <item.icon className={clsx("w-5 h-5", item.color)} />
                  <span className="text-[10px] font-black text-brand-primary uppercase">{item.label}</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-success" />
                </SkeuomorphicContainer>
              ))}
            </div>
          </SkeuomorphicContainer>
        </section>

        {/* RIGHT: Status & Contacts */}
        <aside className="lg:col-span-5 space-y-8">
           <SkeuomorphicContainer className="p-6 space-y-6">
            <h2 className="text-sm font-bold text-brand-primary uppercase tracking-widest flex items-center gap-2">
              <Users className="w-4 h-4 text-brand-accent" />
              Crisis Contacts ({contacts.length})
            </h2>
            <div className="space-y-3">
              {contacts.map((contact: any) => (
                <div key={contact.id} className="flex items-center justify-between p-3 neumorphic-inset rounded-xl">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-brand-primary">{contact.name}</span>
                    <span className="text-[9px] text-brand-secondary font-medium opacity-60 uppercase">{contact.phone}</span>
                  </div>
                  <div className="flex gap-2">
                     <div className="p-1.5 rounded-lg bg-brand-primary/5 text-brand-secondary">
                        <Smartphone className="w-3 h-3" />
                     </div>
                     <div className="p-1.5 rounded-lg bg-brand-primary/5 text-brand-secondary">
                        <Phone className="w-3 h-3" />
                     </div>
                  </div>
                </div>
              ))}
              {contacts.length === 0 && (
                <p className="text-xs italic text-brand-secondary text-center py-4 opacity-40">No active crisis contacts registered.</p>
              )}
            </div>
          </SkeuomorphicContainer>

          <SkeuomorphicContainer className="p-6 space-y-6">
             <h2 className="text-sm font-bold text-brand-primary uppercase tracking-widest flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-brand-success" />
              Recent Alert Logs
            </h2>
            <div className="space-y-4">
              {auditLogs.map((log: any) => (
                <div key={log.id} className="space-y-2 border-b border-brand-secondary/10 pb-4 last:border-0 last:pb-0">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold text-brand-primary uppercase">{new Date(log.when.toDate()).toLocaleString()}</span>
                    <span className="text-[9px] font-bold text-brand-accent uppercase">v{log.metadata?.notificationCount} Alerts</span>
                  </div>
                  <p className="text-[10px] text-brand-secondary italic line-clamp-2">"{log.metadata?.message}"</p>
                </div>
              ))}
              {auditLogs.length === 0 && (
                <p className="text-xs italic text-brand-secondary text-center py-4 opacity-40">No recent alerts triggered.</p>
              )}
            </div>
          </SkeuomorphicContainer>
        </aside>
      </main>
    </div>
  );
}
