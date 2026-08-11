'use client';

import React from 'react';
import { ModulePlaceholder } from '@/components/ui/module-placeholder';
import { RotateCcw } from 'lucide-react';

export default function RetornosPage() {
  return (
    <ModulePlaceholder
      title="Central de Retornos"
      description="Fila completa de clientes a contatar, datas de vencimento de revisões e histórico de abordagens."
      icon={<RotateCcw className="w-10 h-10" />}
    />
  );
}
