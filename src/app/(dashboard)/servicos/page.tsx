'use client';

import React from 'react';
import { ModulePlaceholder } from '@/components/ui/module-placeholder';
import { Wrench } from 'lucide-react';

export default function ServicosPage() {
  return (
    <ModulePlaceholder
      title="Catálogo de Serviços"
      description="Cadastro de serviços prestados, tempo estimado de retorno (meses/km) e valores de tabela."
      icon={<Wrench className="w-10 h-10" />}
    />
  );
}
