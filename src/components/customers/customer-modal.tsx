'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button, PrimaryButton } from '@/components/ui/button';
import { Customer } from '@/types';
import { User, Phone, MessageSquare, Mail, CreditCard, Calendar, FileText, CheckCircle2 } from 'lucide-react';
import { formatPhone, formatCpfCnpj } from '@/lib/formatters';

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Customer>) => Promise<void>;
  customer?: Customer | null;
}

export function CustomerModal({ isOpen, onClose, onSave, customer }: CustomerModalProps) {
  const isEditing = Boolean(customer);

  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [cpfCnpj, setCpfCnpj] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (customer) {
      setName(customer.name || '');
      setWhatsapp(customer.whatsapp || '');
      setPhone(customer.phone || '');
      setEmail(customer.email || '');
      setCpfCnpj(customer.cpf_cnpj || '');
      setBirthDate(customer.birth_date ? customer.birth_date.split('T')[0] : '');
      setNotes(customer.notes || '');
      setStatus(customer.status || 'active');
    } else {
      setName('');
      setWhatsapp('');
      setPhone('');
      setEmail('');
      setCpfCnpj('');
      setBirthDate('');
      setNotes('');
      setStatus('active');
    }
    setErrorMessage('');
  }, [customer, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim()) {
      setErrorMessage('O nome do cliente é obrigatório.');
      return;
    }

    setIsLoading(true);
    try {
      await onSave({
        id: customer?.id,
        name: name.trim(),
        whatsapp: whatsapp.trim() || undefined,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        cpf_cnpj: cpfCnpj.trim() || undefined,
        birth_date: birthDate || undefined,
        notes: notes.trim() || undefined,
        status,
      });
      onClose();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Erro ao salvar cliente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Cliente' : '+ Novo Cliente'}
      footer={
        <>
          <Button onClick={onClose} variant="outline" disabled={isLoading}>
            Cancelar
          </Button>
          <PrimaryButton onClick={handleSubmit} isLoading={isLoading} className="font-bold">
            Salvar cliente
          </PrimaryButton>
        </>
      }
    >
      {errorMessage && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nome completo *"
          placeholder="Ex: João da Silva"
          value={name}
          onChange={(e) => setName(e.target.value)}
          icon={<User className="w-4 h-4" />}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="WhatsApp (preferencial)"
            placeholder="(81) 99999-9999"
            value={whatsapp}
            onChange={(e) => setWhatsapp(formatPhone(e.target.value))}
            icon={<MessageSquare className="w-4 h-4 text-emerald-600" />}
          />

          <Input
            label="Telefone adicional"
            placeholder="(81) 3456-7890"
            value={phone}
            onChange={(e) => setPhone(formatPhone(e.target.value))}
            icon={<Phone className="w-4 h-4" />}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="E-mail"
            type="email"
            placeholder="cliente@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail className="w-4 h-4" />}
          />

          <Input
            label="CPF ou CNPJ"
            placeholder="000.000.000-00"
            value={cpfCnpj}
            onChange={(e) => setCpfCnpj(formatCpfCnpj(e.target.value))}
            icon={<CreditCard className="w-4 h-4" />}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Data de nascimento"
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            icon={<Calendar className="w-4 h-4" />}
          />

          <Select
            label="Status do cliente"
            value={status}
            onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')}
            options={[
              { value: 'active', label: 'Ativo' },
              { value: 'inactive', label: 'Inativo' },
            ]}
            icon={<CheckCircle2 className="w-4 h-4" />}
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
            Observações gerais
          </label>
          <div className="relative">
            <textarea
              rows={3}
              placeholder="Preferências, histórico de contatos ou avisos especiais..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent"
            />
          </div>
        </div>
      </form>
    </Modal>
  );
}
