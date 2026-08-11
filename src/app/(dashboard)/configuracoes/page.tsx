'use client';

import React from 'react';
import { ModulePlaceholder } from '@/components/ui/module-placeholder';
import { Settings } from 'lucide-react';

export default function ConfiguracoesPage() {
  return (
    <ModulePlaceholder
      title="Configurações da Oficina"
      description="Dados da empresa, logotipo, gestão de membros da equipe e preferências de notificação."
      icon={<Settings className="w-10 h-10" />}
    />
  );
}
