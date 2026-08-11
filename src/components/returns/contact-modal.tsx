'use client';

import React from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { ReturnCustomerItem } from '@/types';
import { formatDate, formatCurrency } from '@/lib/formatters';
import { MessageSquare, ExternalLink, Calendar, Gauge, Car, User } from 'lucide-react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: ReturnCustomerItem | null;
}

export function ContactModal({ isOpen, onClose, item }: ContactModalProps) {
  if (!item) return null;

  const cleanPhone = (item.whatsapp || item.phone || '').replace(/[^0-9]/g, '');
  const formattedPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;

  const messageText = `Olá ${item.customer.name}! Tudo bem? Identificamos que está chegando o período de revisão do seu ${item.vehicle.brand} ${item.vehicle.model} na OficinaRetorno. Podemos agendar o seu atendimento?`;

  const waLink = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(messageText)}`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Contatar Cliente para Retorno"
      description="Confira os detalhes e inicie a conversa preventiva via WhatsApp."
    >
      <div className="space-y-4">
        {/* Card Informativo do Cliente e Veículo */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-semibold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-100">{item.customer.name}</h4>
              <p className="text-xs text-slate-400">{item.customer.whatsapp || item.customer.phone || 'Sem telefone'}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800/80 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <Car className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                {item.vehicle.brand} {item.vehicle.model} {item.vehicle.plate ? `[${item.vehicle.plate}]` : ''}
              </span>
            </div>

            <div className="flex items-center gap-2 text-slate-300">
              <Gauge className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{item.vehicle.mileage?.toLocaleString('pt-BR')} km atuais</span>
            </div>
          </div>
        </div>

        {/* Detalhes do Serviço & Próximo Retorno */}
        <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl text-xs space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Serviço Realizado:</span>
            <span className="font-semibold text-slate-200">{item.service_name}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-400">Último Atendimento:</span>
            <span className="text-slate-300">
              {formatDate(item.last_service_date)} ({item.last_service_mileage?.toLocaleString('pt-BR')} km)
            </span>
          </div>

          {item.next_return_date && (
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Próxima Data Prevista:</span>
              <span className="font-semibold text-amber-400">{formatDate(item.next_return_date)}</span>
            </div>
          )}

          {item.next_return_mileage && (
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Próxima Quilometragem:</span>
              <span className="font-semibold text-amber-400">
                {item.next_return_mileage.toLocaleString('pt-BR')} km
              </span>
            </div>
          )}

          <div className="flex justify-between items-center pt-2 border-t border-slate-800/60">
            <span className="text-slate-400">Status do Retorno:</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
              {item.status_label}
            </span>
          </div>
        </div>

        {/* Prévia da Mensagem */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1 flex items-center gap-1">
            <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
            Prévia da Mensagem (WhatsApp)
          </label>
          <div className="p-3 bg-emerald-950/20 border border-emerald-500/20 rounded-lg text-xs text-emerald-200 leading-relaxed italic">
            "{messageText}"
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
          <a href={waLink} target="_blank" rel="noopener noreferrer" className="no-underline">
            <Button className="bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              <span>Abrir WhatsApp</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </Button>
          </a>
        </div>
      </div>
    </Modal>
  );
}
