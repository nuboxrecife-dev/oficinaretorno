'use client';

import React from 'react';
import { ModulePlaceholder } from '@/components/ui/module-placeholder';
import { Megaphone } from 'lucide-react';

export default function CampanhasPage() {
  return (
    <ModulePlaceholder
      title="Campanhas de Notificação"
      description="Criação e agendamento de avisos de manutenção, ofertas sazonais e lembretes via WhatsApp."
      icon={<Megaphone className="w-10 h-10" />}
    />
  );
}
