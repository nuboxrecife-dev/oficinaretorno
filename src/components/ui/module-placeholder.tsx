import React from 'react';
import { PageHeader } from './page-header';
import { Sparkles, Clock, ShieldCheck } from 'lucide-react';

interface ModulePlaceholderProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

export function ModulePlaceholder({ title, description, icon }: ModulePlaceholderProps) {
  return (
    <div className="space-y-6">
      <PageHeader title={title} subtitle={description} />

      <div className="bg-white border border-slate-200/80 rounded-2xl p-8 sm:p-12 text-center shadow-subtle max-w-3xl mx-auto space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto shadow-inner border border-brand-100/50">
          {icon || <Sparkles className="w-10 h-10" />}
        </div>

        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-brand-700 bg-brand-50 border border-brand-200/60 rounded-full">
            <Clock className="w-3.5 h-3.5" />
            Em Desenvolvimento — Próxima Etapa
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            Este módulo será configurado nas próximas etapas.
          </h2>
          <p className="text-slate-500 text-sm max-w-md mx-auto leading-relaxed">
            Toda a fundação da arquitetura e isolamento multiempresa para este módulo já está pronta e segura.
          </p>
        </div>

        <div className="pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <ShieldCheck className="w-5 h-5 text-brand-600 mb-2" />
            <h4 className="text-xs font-bold uppercase text-slate-700">Multi-tenant RLS</h4>
            <p className="text-xs text-slate-500 mt-1">Dados pré-isolados por organização.</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <Sparkles className="w-5 h-5 text-brand-600 mb-2" />
            <h4 className="text-xs font-bold uppercase text-slate-700">Automações</h4>
            <p className="text-xs text-slate-500 mt-1">Preparo para envios e cálculos de retornos.</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <Clock className="w-5 h-5 text-brand-600 mb-2" />
            <h4 className="text-xs font-bold uppercase text-slate-700">Próximos Passos</h4>
            <p className="text-xs text-slate-500 mt-1">Integração nativa após conclusão da Etapa 1.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
