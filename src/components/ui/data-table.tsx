import React from 'react';
import { ReturnCustomerItem } from '@/types';
import { StatusBadge } from './status-badge';
import { Button } from './button';
import { MessageSquare, User, Car, Wrench, Calendar } from 'lucide-react';

interface DataTableProps {
  data: ReturnCustomerItem[];
  onActionClick?: (item: ReturnCustomerItem) => void;
}

export function DataTable({ data, onActionClick }: DataTableProps) {
  return (
    <div className="w-full bg-white border border-slate-200/80 rounded-2xl shadow-subtle overflow-hidden">
      {/* Desktop Table View (sm e acima) */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <th className="px-6 py-3.5">Cliente</th>
              <th className="px-6 py-3.5">Veículo</th>
              <th className="px-6 py-3.5">Serviço</th>
              <th className="px-6 py-3.5">Próximo retorno</th>
              <th className="px-6 py-3.5">Status</th>
              <th className="px-6 py-3.5 text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
            {data.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center text-xs font-bold shrink-0">
                      {item.clientName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{item.clientName}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-700">
                  <div className="flex items-center gap-2">
                    <Car className="w-4 h-4 text-slate-400" />
                    <span>{item.vehicle}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-700">
                  <div className="flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-slate-400" />
                    <span>{item.service}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-700">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>{item.nextReturnDate}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={item.status} label={item.statusLabel} />
                </td>
                <td className="px-6 py-4 text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    leftIcon={<MessageSquare className="w-3.5 h-3.5 text-emerald-600" />}
                    onClick={() => onActionClick?.(item)}
                    className="hover:border-emerald-300 hover:bg-emerald-50/50 hover:text-emerald-800"
                  >
                    Contatar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List View (abaixo de sm) */}
      <div className="block sm:hidden divide-y divide-slate-100">
        {data.map((item) => (
          <div key={item.id} className="p-4 space-y-3 bg-white">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center text-sm font-bold">
                  {item.clientName.charAt(0)}
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm">{item.clientName}</h4>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <Car className="w-3 h-3 text-slate-400" />
                    {item.vehicle}
                  </p>
                </div>
              </div>
              <StatusBadge status={item.status} label={item.statusLabel} />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-1 border-t border-slate-50">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Serviço</span>
                <span className="font-medium text-slate-800">{item.service}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Próximo Retorno</span>
                <span className="font-medium text-slate-800">{item.nextReturnDate}</span>
              </div>
            </div>

            <div className="pt-1">
              <Button
                size="sm"
                variant="outline"
                leftIcon={<MessageSquare className="w-3.5 h-3.5 text-emerald-600" />}
                onClick={() => onActionClick?.(item)}
                className="w-full justify-center hover:border-emerald-300 hover:bg-emerald-50/50"
              >
                Contatar Cliente
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
