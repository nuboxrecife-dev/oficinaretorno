'use client';

import React from 'react';
import { ModulePlaceholder } from '@/components/ui/module-placeholder';
import { HelpCircle } from 'lucide-react';

export default function AjudaPage() {
  return (
    <ModulePlaceholder
      title="Central de Ajuda & Suporte"
      description="Manuais de boas práticas para contato com clientes, perguntas frequentes e canal direto com nosso suporte."
      icon={<HelpCircle className="w-10 h-10" />}
    />
  );
}
