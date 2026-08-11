'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/auth-context';
import {
  LayoutDashboard,
  Users,
  Car,
  Wrench,
  RotateCcw,
  Megaphone,
  BarChart3,
  Settings,
  HelpCircle,
  LogOut,
  X,
  Wrench as LogoIcon,
} from 'lucide-react';

interface SidebarProps {
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
}

export function Sidebar({ mobileOpen = false, setMobileOpen }: SidebarProps) {
  const pathname = usePathname();
  const { profile, organization, signOut } = useAuth();

  const mainNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Clientes', href: '/clientes', icon: Users },
    { name: 'Veículos', href: '/veiculos', icon: Car },
    { name: 'Serviços', href: '/servicos', icon: Wrench },
    { name: 'Retornos', href: '/retornos', icon: RotateCcw },
    { name: 'Campanhas', href: '/campanhas', icon: Megaphone },
    { name: 'Relatórios', href: '/relatorios', icon: BarChart3 },
  ];

  const bottomNavigation = [
    { name: 'Configurações', href: '/configuracoes', icon: Settings },
    { name: 'Ajuda', href: '/ajuda', icon: HelpCircle },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200/80 w-64 select-none">
      {/* Top Logo Container */}
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 group focus:outline-none"
          onClick={() => setMobileOpen?.(false)}
        >
          <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-sm group-hover:bg-brand-700 transition-colors">
            <LogoIcon className="w-5.5 h-5.5 transform -rotate-12" />
          </div>
          <div>
            <h1 className="font-extrabold text-slate-900 tracking-tight text-lg leading-none">
              Oficina<span className="text-brand-600">Retorno</span>
            </h1>
            <p className="text-[10px] text-slate-500 font-medium mt-0.5 tracking-tight">
              Seus clientes sempre voltam.
            </p>
          </div>
        </Link>

        {/* Mobile Close Button */}
        {setMobileOpen && (
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Main Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        <div>
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Menu Principal
          </p>
          <nav className="space-y-1">
            {mainNavigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileOpen?.(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                    isActive
                      ? 'bg-brand-50 text-brand-600 font-semibold shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  )}
                >
                  <Icon
                    className={cn(
                      'w-4 h-4 shrink-0',
                      isActive ? 'text-brand-600' : 'text-slate-400 group-hover:text-slate-600'
                    )}
                  />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div>
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Suporte & Ajustes
          </p>
          <nav className="space-y-1">
            {bottomNavigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileOpen?.(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                    isActive
                      ? 'bg-brand-50 text-brand-600 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  )}
                >
                  <Icon
                    className={cn(
                      'w-4 h-4 shrink-0',
                      isActive ? 'text-brand-600' : 'text-slate-400'
                    )}
                  />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer User Profile & Organization */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50">
        <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
              {profile?.name?.charAt(0) || 'O'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">{profile?.name || 'Usuário'}</p>
              <p className="text-[11px] text-slate-500 truncate font-normal">
                {organization?.name || 'Oficina'}
              </p>
            </div>
          </div>

          <button
            onClick={() => signOut()}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 text-xs font-semibold text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-slate-100"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sair do sistema</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Fixo) */}
      <aside className="hidden lg:block fixed top-0 left-0 bottom-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer (Overlay + Sidebar Slide) */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen?.(false)}
          />
          <div className="relative z-10 flex-1 max-w-xs w-full bg-white shadow-xl animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
