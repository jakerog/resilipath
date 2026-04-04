'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { auth, functions } from '@/lib/firebase';
import { signInWithEmailAndPassword, OAuthProvider, signInWithPopup } from 'firebase/auth';
import { httpsCallable } from 'firebase/functions';
import { SkeuomorphicContainer } from '@/components/layout/SkeuomorphicContainer';
import { Lock, Mail, ArrowRight, ShieldCheck, Key, AlertCircle, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [idpConfig, setIdpConfig] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [discovering, setDiscovering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Domain-based discovery (Task 4)
  const handleDiscovery = useCallback(async (val: string) => {
    if (val.includes('@') && val.split('@')[1].length > 3) {
      setDiscovering(true);
      try {
        const discoverFunc = httpsCallable(functions, 'discoverIdentityProvider');
        const result = await discoverFunc({ email: val }) as any;
        setIdpConfig(result.data);
      } catch (err) {
        console.error('Discovery failed:', err);
      } finally {
        setDiscovering(false);
      }
    } else {
      setIdpConfig(null);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (email) handleDiscovery(email);
    }, 500);
    return () => clearTimeout(timer);
  }, [email, handleDiscovery]);

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (idpConfig?.enforceSso) {
      setError("SSO is enforced for this domain. Please use your corporate login.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSsoLogin = async () => {
    if (!idpConfig) return;
    setLoading(true);
    try {
      /**
       * SSO FLOW (ALPHA):
       * 1. Identity discovery detected a SAML/OIDC provider for this domain.
       * 2. We use the 'saml.resilipath' provider ID (configured in GCIP).
       * 3. GCIP handles the redirect to the tenant's specific IdP (ssoUrl).
       *
       * Note: End-to-end IdP handshake requires a verified enterprise domain
       * and GCIP project configuration. This remains in Alpha.
       */
      const provider = new OAuthProvider('saml.resilipath');
      await signInWithPopup(auth, provider);
      router.push('/dashboard');
    } catch (err: any) {
      console.error('SSO Error:', err);
      setError("Corporate login failed. Please contact your IT Resilience team.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7f6] flex items-center justify-center p-6">
      <div className="w-full max-w-[440px] space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 neumorphic-button rounded-2xl mb-4">
             <ShieldCheck className="w-8 h-8 text-brand-accent" />
          </div>
          <h1 className="text-3xl font-black text-brand-primary tracking-tighter uppercase">ResiliPath</h1>
          <p className="text-[10px] font-bold text-brand-secondary uppercase tracking-widest opacity-60">
            Enterprise Resilience Access Portal
          </p>
        </div>

        <SkeuomorphicContainer className="p-10 space-y-8">
          <form onSubmit={handlePasswordLogin} className="space-y-6">
            <div className="space-y-2 relative">
              <label className="text-[10px] font-bold uppercase text-brand-secondary tracking-widest flex items-center justify-between">
                <span>Identity / Email</span>
                {discovering && <Loader2 className="w-3 h-3 animate-spin text-brand-accent" />}
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-secondary/40" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  className="neumorphic-inset w-full bg-transparent pl-12 pr-4 py-4 rounded-2xl text-brand-primary text-sm focus:outline-none placeholder:text-brand-secondary/20"
                />
              </div>
            </div>

            {/* SSO Discovery Hint */}
            {idpConfig && idpConfig.providerType !== 'password' && (
               <div className="p-4 bg-brand-accent/5 border border-brand-accent/20 rounded-2xl animate-in zoom-in-95 duration-300">
                 <div className="flex items-center gap-3 mb-3">
                   <Key className="w-4 h-4 text-brand-accent" />
                   <span className="text-xs font-bold text-brand-primary">Detected: {idpConfig.name || 'Enterprise SSO'}</span>
                 </div>
                 <button
                  type="button"
                  onClick={handleSsoLogin}
                  disabled={loading}
                  className="w-full neumorphic-button py-3 text-[10px] font-black uppercase text-brand-accent tracking-widest flex items-center justify-center gap-2"
                 >
                   Continue with SSO <ArrowRight className="w-3 h-3" />
                 </button>
               </div>
            )}

            {(!idpConfig?.enforceSso) && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-brand-secondary tracking-widest">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-secondary/40" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required={!idpConfig?.enforceSso}
                      className="neumorphic-inset w-full bg-transparent pl-12 pr-4 py-4 rounded-2xl text-brand-primary text-sm focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full neumorphic-button py-4 font-black text-xs uppercase tracking-widest text-brand-primary flex items-center justify-center gap-3 hover:text-brand-accent transition-colors"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                  Sign In to Platform
                </button>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-3 p-4 bg-brand-danger/5 border border-brand-danger/20 rounded-2xl text-brand-danger text-[10px] font-bold uppercase animate-in shake duration-300">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}
          </form>
        </SkeuomorphicContainer>

        <footer className="text-center opacity-40">
           <p className="text-[9px] font-bold text-brand-secondary uppercase tracking-widest">
             Isolated Node: {idpConfig?.tenantId || 'GLOBAL-01'}
           </p>
        </footer>
      </div>
    </div>
  );
}
