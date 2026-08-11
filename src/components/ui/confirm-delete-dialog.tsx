import React from 'react';
import { Modal } from './modal';
import { Button, PrimaryButton } from './button';
import { AlertTriangle, ShieldAlert } from 'lucide-react';

interface ConfirmDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  isBlocked?: boolean;
  blockReason?: string;
  isLoading?: boolean;
  loading?: boolean;
}

export function ConfirmDeleteDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  isBlocked = false,
  blockReason,
  isLoading = false,
  loading = false,
}: ConfirmDeleteDialogProps) {
  const activeLoading = isLoading || loading;
  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={
        isBlocked ? (
          <Button onClick={onClose} variant="primary">
            Entendido
          </Button>
        ) : (
          <>
            <Button onClick={onClose} variant="outline" disabled={activeLoading}>
              Cancelar
            </Button>
            <Button
              onClick={onConfirm}
              variant="danger"
              isLoading={activeLoading}
              className="font-bold"
            >
              Sim, excluir
            </Button>
          </>
        )
      }
    >
      {isBlocked ? (
        <div className="space-y-3 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
          <div className="flex items-center gap-2 font-bold text-amber-800 text-sm">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
            Exclusão Bloqueada para Segurança dos Dados
          </div>
          <p className="text-xs text-amber-800 leading-relaxed">
            {blockReason || 'Este registro possui dados associados e não pode ser excluído diretamente.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-red-50 text-red-700">
            <AlertTriangle className="w-6 h-6 shrink-0" />
            <p className="text-xs font-semibold">Esta ação não poderá ser desfeita.</p>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">{description}</p>
        </div>
      )}
    </Modal>
  );
}
