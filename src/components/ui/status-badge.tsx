import React from 'react';
import { cn } from '@/lib/utils';
import { Clock, AlertCircle, Calendar } from 'lucide-react';

export type StatusType = 'hoje' | 'em_3_dias' | 'em_4_dias' | 'em_7_dias' | 'atrasado' | string;

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  className?: string;
}

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  let styles = 'bg-slate-100 text-slate-700 border-slate-200';
  let Icon = Calendar;
  let text = label;

  switch (status) {
    case 'hoje':
      styles = 'bg-amber-50 text-amber-700 border-amber-200/60 font-semibold';
      Icon = AlertCircle;
      text = label || 'Hoje';
      break;
    case 'em_3_dias':
      styles = 'bg-blue-50 text-blue-700 border-blue-200/60';
      Icon = Clock;
      text = label || 'Em 3 dias';
      break;
    case 'em_4_dias':
      styles = 'bg-sky-50 text-sky-700 border-sky-200/60';
      Icon = Clock;
      text = label || 'Em 4 dias';
      break;
    case 'em_7_dias':
      styles = 'bg-slate-100 text-slate-700 border-slate-200';
      Icon = Calendar;
      text = label || 'Em 7 dias';
      break;
    case 'atrasado':
      styles = 'bg-red-50 text-red-700 border-red-200/60 font-semibold';
      Icon = AlertCircle;
      text = label || 'Atrasado';
      break;
    default:
      text = label || status;
      break;
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border shadow-2xs',
        styles,
        className
      )}
    >
      <Icon className="w-3.5 h-3.5" />
      <span>{text}</span>
    </span>
  );
}
