'use client';

import React from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Menu, Building2, ShieldCheck, Bell } from 'lucide-react';

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { profile, organization } = useAuth();

  return (
    <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3 transition-all">
      <div className="flex items-center justify-between gap-4">
        {/* Left Side: Mobile Toggle & Tenant Info */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
            aria-label="Abrir menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200/70 py-1.5 px-3 rounded-xl">
            <div className="w-7 h-7 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-900 truncate max-w-[140px] sm:max-w-[220px]">
                  {organization?.name || 'Carregando oficina...'}
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                  <ShieldCheck className="w-3 h-3" />
                  Isolado
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Quick Notifications & User Info */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2">
            <div className="text-right">
              <p className="text-xs font-bold text-slate-900">{profile?.name || 'Usuário'}</p>
              <p className="text-[10px] text-slate-500 font-medium capitalize">
                {profile?.role === 'owner' ? 'Proprietário' : profile?.role || 'Membro'}
              </p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center text-xs shadow-xs">
              {profile?.name?.charAt(0) || 'U'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
