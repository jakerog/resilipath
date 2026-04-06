'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  ShieldCheck,
  Activity,
  Database,
  Settings,
  LogOut,
  ChevronRight
} from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '@/hooks/useAuth';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Planning', href: '/plans', icon: BookOpen },
  { name: 'Crisis Hub', href: '/crisis', icon: Activity },
  { name: 'Assets', href: '/assets', icon: Database },
  { name: 'Intelligence', href: '/intelligence', icon: ShieldCheck },
  { name: 'Compliance', href: '/compliance', icon: Activity }, // Using Activity as placeholder for now
  { name: 'Settings', href: '/settings/security', icon: Settings },
];

export const Sidebar = () => {
  const pathname = usePathname();
  const { user, tenantId } = useAuth();

  if (!user) return null;

  return (
    <aside className="w-64 h-screen sticky top-0 bg-[#f4f7f6] border-r border-brand-secondary/10 p-6 flex flex-col gap-8">
      <div className="flex items-center gap-3 px-2">
        <div className="p-2 neumorphic-button rounded-xl">
          <ShieldCheck className="w-6 h-6 text-brand-accent" />
        </div>
        <div>
          <h2 className="font-black text-brand-primary tracking-tight text-lg uppercase">ResiliPath</h2>
          <p className="text-[10px] font-bold text-brand-secondary opacity-40 uppercase tracking-widest leading-none">
            {tenantId || 'Nexus-01'}
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                "group flex items-center justify-between p-3 rounded-2xl transition-all duration-300",
                isActive
                  ? "neumorphic-inset text-brand-accent"
                  : "hover:bg-brand-primary/5 text-brand-secondary"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon className={clsx("w-5 h-5", isActive ? "text-brand-accent" : "text-brand-secondary opacity-60")} />
                <span className="text-sm font-bold tracking-tight">{item.name}</span>
              </div>
              {isActive && <ChevronRight className="w-4 h-4" />}
            </Link>
          );
        })}
      </nav>

      <div className="pt-6 border-t border-brand-secondary/10 space-y-4">
        <div className="px-2">
          <p className="text-[9px] font-black text-brand-secondary opacity-30 uppercase tracking-widest mb-1">Authenticated As</p>
          <p className="text-xs font-bold text-brand-primary truncate">{user.email}</p>
        </div>

        <button
          onClick={() => signOut(auth)}
          className="w-full flex items-center gap-3 p-3 rounded-2xl text-brand-danger hover:bg-brand-danger/5 transition-colors group"
        >
          <LogOut className="w-5 h-5 opacity-60 group-hover:opacity-100" />
          <span className="text-sm font-bold">Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
