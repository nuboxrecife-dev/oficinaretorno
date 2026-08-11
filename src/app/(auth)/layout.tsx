import React from 'react';
import Link from 'next/link';
import { Wrench, ShieldCheck, TrendingUp, Users } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col lg:flex-row font-sans selection:bg-brand-600 selection:text-white">
      {/* Coluna Esquerda: Branding & Valor do OficinaRetorno */}
      <div className="lg:w-1/2 p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-brand-950 via-slate-900 to-slate-950 border-b lg:border-b-0 lg:border-r border-slate-800/80">
        {/* Glow de fundo */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Branding */}
        <div className="relative z-10">
          <Link href="/login" className="inline-flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-float group-hover:bg-brand-500 transition-colors">
              <Wrench className="w-6 h-6 transform -rotate-12" />
            </div>
            <div>
              <span className="text-2xl font-extrabold tracking-tight text-white">
                Oficina<span className="text-brand-500">Retorno</span>
              </span>
              <p className="text-xs text-brand-300 font-medium tracking-wide">
                Seus clientes sempre voltam.
              </p>
            </div>
          </Link>
        </div>

        {/* Hero Copy */}
        <div className="relative z-10 my-12 space-y-6 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-semibold">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            Plataforma Especializada em Retenção Automotiva
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Aumente o faturamento trazendo seus clientes de volta na hora certa.
          </h1>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed font-normal">
            Organize os retornos da sua oficina mecânica ou centro automotivo com inteligência, simplicidade e alto desempenho.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800/80 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Ambiente Multi-tenant Seguro</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-brand-400 shrink-0" />
              <span>Fácil para sua Equipe</span>
            </div>
          </div>
        </div>

        {/* Rodapé de Auth */}
        <div className="relative z-10 text-xs text-slate-500">
          © {new Date().getFullYear()} OficinaRetorno. Todos os direitos reservados.
        </div>
      </div>

      {/* Coluna Direita: Formulários (Login / Cadastro / Esqueci-senha) */}
      <div className="lg:w-1/2 p-6 sm:p-12 lg:p-16 flex items-center justify-center bg-white text-slate-900">
        <div className="w-full max-w-md space-y-6">
          {children}
        </div>
      </div>
    </div>
  );
}
