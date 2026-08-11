import React from 'react';
import { Button } from './button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (newPage: number) => void;
}

export function Pagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}: PaginationProps) {
  if (totalItems === 0 || totalPages <= 1) return null;

  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200/80 text-xs text-slate-500">
      <div>
        Exibindo <span className="font-bold text-slate-900">{startItem}</span> a{' '}
        <span className="font-bold text-slate-900">{endItem}</span> de{' '}
        <span className="font-bold text-slate-900">{totalItems}</span> registros
      </div>

      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          leftIcon={<ChevronLeft className="w-4 h-4" />}
        >
          Anterior
        </Button>

        <span className="px-3 py-1 font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg">
          {page} / {totalPages}
        </span>

        <Button
          size="sm"
          variant="outline"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          rightIcon={<ChevronRight className="w-4 h-4" />}
        >
          Próxima
        </Button>
      </div>
    </div>
  );
}
