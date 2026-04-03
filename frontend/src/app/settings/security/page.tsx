'use client';

import React, { useMemo } from 'react';
import { useFirestoreQuery } from '@/hooks/useFirestoreQuery';
import { where, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { SkeuomorphicContainer } from '@/components/layout/SkeuomorphicContainer';
import { Shield, Key, Globe, Save, CheckCircle2, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';

export default function EnterpriseSecurity() {
  const { tenantId, user } = useAuth();
  const [isSaving, setIsSaving] = React.useState(false);

  // 1. Fetch Tenant Config
  const tenantConstraints = useMemo(() => {
    if (!tenantId) return [];
    return [where('tenantId', '==', tenantId)];
  }, [tenantId]);

  const { data: tenants, loading } = useFirestoreQuery('tenants', tenantConstraints);
  const tenant = tenants[0] as any;

  const [formData, setFormData] = React.useState<any>(null);

  React.useEffect(() => {
    if (tenant && !formData) {
      setFormData(tenant.authConfig || {
        providerType: 'password',
        enforceSso: false,
        domainWhitelist: [],
        attributeMapping: { roleField: 'groups', adminRoleValue: 'resili-admin' }
      });
    }
  }, [tenant, formData]);

  const handleSave = async () => {
    if (!tenantId || !formData) return;
    setIsSaving(true);
    try {
      const tenantRef = doc(db, 'tenants', tenant.id);
      await updateDoc(tenantRef, {
        authConfig: formData,
        updatedAt: serverTimestamp()
      });
      console.log('Security settings updated');
    } catch (err) {
      console.error('Failed to update settings:', err);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || !formData) return null;

  return (
    <div className="min-h-screen bg-[#f4f7f6] p-4 md:p-8">
      <header className="max-w-4xl mx-auto mb-10 flex items-center gap-4">
        <SkeuomorphicContainer className="p-3">
          <Shield className="w-8 h-8 text-brand-accent" />
        </SkeuomorphicContainer>
        <div>
          <h1 className="text-2xl font-bold text-brand-primary tracking-tight">Enterprise Security</h1>
          <p className="text-xs text-brand-secondary font-medium uppercase tracking-widest opacity-60">
            SSO, SAML & Identity Governance
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto space-y-8">
        <SkeuomorphicContainer className="p-8 space-y-8">
          {/* SSO Configuration */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 border-b border-brand-secondary/10 pb-4">
              <Key className="w-5 h-5 text-brand-accent" />
              <h2 className="text-sm font-bold text-brand-primary uppercase tracking-wider">Authentication Provider</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {['password', 'saml', 'oidc'].map((type) => (
                <button
                  key={type}
                  onClick={() => setFormData({ ...formData, providerType: type })}
                  className={clsx(
                    "p-4 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all",
                    formData.providerType === type
                      ? "neumorphic-inset text-brand-accent bg-brand-accent/5"
                      : "neumorphic-button text-brand-secondary"
                  )}
                >
                  {type}
                </button>
              ))}
            </div>

            {formData.providerType !== 'password' && (
              <div className="space-y-4 animate-in slide-in-from-top-2">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-brand-secondary tracking-widest">IdP Single Sign-On URL</label>
                  <input
                    type="url"
                    value={formData.ssoUrl || ''}
                    onChange={(e) => setFormData({ ...formData, ssoUrl: e.target.value })}
                    className="neumorphic-inset w-full bg-transparent p-4 rounded-xl text-sm text-brand-primary focus:outline-none"
                    placeholder="https://identity.yourcorp.com/saml/sso"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-brand-secondary tracking-widest">Entity ID / Audience</label>
                  <input
                    type="text"
                    value={formData.idpEntityId || ''}
                    onChange={(e) => setFormData({ ...formData, idpEntityId: e.target.value })}
                    className="neumorphic-inset w-full bg-transparent p-4 rounded-xl text-sm text-brand-primary focus:outline-none"
                    placeholder="urn:resilipath:tenant-abc"
                  />
                </div>
              </div>
            )}
          </section>

          {/* Governance */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 border-b border-brand-secondary/10 pb-4">
              <Globe className="w-5 h-5 text-brand-success" />
              <h2 className="text-sm font-bold text-brand-primary uppercase tracking-wider">Access Governance</h2>
            </div>

            <div className="flex items-center justify-between p-4 neumorphic-inset rounded-2xl">
               <div>
                 <p className="text-sm font-bold text-brand-primary">Enforce SSO</p>
                 <p className="text-[10px] text-brand-secondary">Prevent password-based logins for all users</p>
               </div>
               <button
                 onClick={() => setFormData({ ...formData, enforceSso: !formData.enforceSso })}
                 className={clsx(
                   "w-12 h-6 rounded-full transition-all relative",
                   formData.enforceSso ? "bg-brand-success shadow-inner" : "bg-brand-secondary/20 neumorphic-inset"
                 )}
               >
                 <div className={clsx(
                   "absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-md",
                   formData.enforceSso ? "left-7" : "left-1"
                 )} />
               </button>
            </div>

            <div className="bg-brand-warning/5 border border-brand-warning/20 p-4 rounded-2xl flex gap-3">
              <AlertCircle className="w-5 h-5 text-brand-warning shrink-0" />
              <p className="text-xs text-brand-secondary leading-relaxed font-medium">
                Enabling **SSO Only** requires a verified IdP configuration. Misconfiguration may result in tenant lockout.
              </p>
            </div>
          </section>

          {/* Footer Save */}
          <div className="pt-8 border-t border-brand-secondary/10 flex justify-end">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="neumorphic-button px-10 py-3 text-xs font-bold text-brand-primary uppercase tracking-widest flex items-center gap-3 disabled:opacity-50"
            >
              {isSaving ? <div className="w-4 h-4 border-2 border-brand-accent border-t-transparent animate-spin rounded-full" /> : <Save className="w-4 h-4 text-brand-accent" />}
              {isSaving ? 'Updating Foundation...' : 'Save Security Settings'}
            </button>
          </div>
        </SkeuomorphicContainer>
      </main>
    </div>
  );
}
