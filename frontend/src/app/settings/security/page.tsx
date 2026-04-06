'use client';

import React, { useMemo, useEffect, useState } from 'react';
import { doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { SkeuomorphicContainer } from '@/components/layout/SkeuomorphicContainer';
import { Shield, Key, Globe, Save, CheckCircle2, AlertCircle } from 'lucide-react';
import clsx from 'clsx';

export default function EnterpriseSecurity() {
  const { tenantId, user, refreshClaims } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tenant, setTenant] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>(null);

  // 1. Fetch Tenant Config via direct doc reference (more reliable for permissions)
  useEffect(() => {
    async function fetchTenant() {
      if (!tenantId || tenantId === 'pending') {
        setLoading(false);
        return;
      }

      try {
        const docRef = doc(db, 'tenants', tenantId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setTenant({ id: docSnap.id, ...data });
          setFormData(data.authConfig || {
            providerType: 'password',
            enforceSso: false,
            domainWhitelist: [],
            attributeMapping: { roleField: 'groups', adminRoleValue: 'resili-admin' }
          });
        } else {
          setError('Tenant record not found.');
        }
      } catch (err: any) {
        console.error('Error fetching tenant:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchTenant();
  }, [tenantId]);

  useEffect(() => {
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f7f6]">
        <div className="flex flex-col items-center gap-4 animate-pulse text-brand-secondary">
          <Shield className="w-10 h-10" />
          <p className="text-xs font-bold uppercase tracking-widest">Identifying Infrastructure...</p>
        </div>
      </div>
    );
  }

  if (error || (tenantId !== 'pending' && !tenant) || tenantId === 'pending') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f7f6]">
        <SkeuomorphicContainer className="text-center p-12 max-w-md space-y-6">
          <div className="mx-auto w-16 h-16 neumorphic-inset rounded-full flex items-center justify-center text-brand-warning">
            <Shield className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-brand-primary uppercase tracking-tight">Provisioning Required</h2>
            <p className="text-xs text-brand-secondary opacity-60 leading-relaxed">
              To manage enterprise security settings, your account must first be provisioned and assigned to a verified tenant.
            </p>
          </div>
          <button
            onClick={async () => {
              if (!user) return;
              setIsRefreshing(true);
              await refreshClaims?.(user);
              setIsRefreshing(false);
            }}
            disabled={isRefreshing}
            className="neumorphic-button px-8 py-3 text-[10px] font-bold text-brand-accent uppercase tracking-widest flex items-center gap-2 mx-auto"
          >
            {isRefreshing ? <div className="w-3 h-3 border-2 border-brand-accent border-t-transparent animate-spin rounded-full" /> : null}
            Refresh Authorization
          </button>
        </SkeuomorphicContainer>
      </div>
    );
  }

  if (!formData) return null;

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
