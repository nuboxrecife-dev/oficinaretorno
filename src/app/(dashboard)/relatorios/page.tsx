'use client';

import React from 'react';
import { ModulePlaceholder } from '@/components/ui/module-placeholder';
import { BarChart3 } from 'lucide-react';

export default function RelatoriosPage() {
  return (
    <ModulePlaceholder
      title="Relatórios & Desempenho"
      description="Métricas consolidadas de taxa de retorno, faturamento recuperado por período e eficácia de atendimento."
      icon={<BarChart3 className="w-10 h-10" />}
    />
  );
}
