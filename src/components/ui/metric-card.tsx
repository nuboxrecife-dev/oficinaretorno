import React from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, ArrowUpRight } from 'lucide-react';
import { Button } from './button';

interface MetricCardProps {
  title: string;
  value: string;
  indicator?: string;
  indicatorPositive?: boolean;
  icon?: React.ReactNode;
  isPriority?: boolean;
  ctaText?: string;
  onCtaClick?: () => void;
  className?: string;
}

export function MetricCard({
  title,
  value,
  indicator,
  indicatorPositive = true,
  icon,
  isPriority = false,
  ctaText,
  onCtaClick,
  className,
}: MetricCardProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl p-5 border transition-all duration-200',
        isPriority
          ? 'bg-gradient-to-br from-brand-950 via-brand-900 to-slate-900 text-white border-brand-800 shadow-float'
          : 'bg-white text-slate-900 border-slate-200/80 shadow-subtle hover:border-slate-300 hover:shadow-card',
        className
      )}
    >
      {/* Elemento decorativo de brilho em cards de prioridade */}
      {isPriority && (
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-brand-600/20 rounded-full blur-2xl pointer-events-none" />
      )}

      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p
            className={cn(
              'text-xs font-semibold uppercase tracking-wider',
              isPriority ? 'text-brand-300' : 'text-slate-500'
            )}
          >
            {title}
          </p>
          <h3
            className={cn(
              'text-2xl sm:text-3xl font-bold tracking-tight',
              isPriority ? 'text-white' : 'text-slate-900'
            )}
          >
            {value}
          </h3>
        </div>

        {icon && (
          <div
            className={cn(
              'p-2.5 rounded-xl flex items-center justify-center shrink-0',
              isPriority
                ? 'bg-brand-800/80 text-brand-200 border border-brand-700/50'
                : 'bg-slate-100 text-slate-600'
            )}
          >
            {icon}
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between gap-2">
        {indicator && (
          <div className="flex items-center gap-1.5 text-xs font-medium">
            <span
              className={cn(
                'inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md font-semibold',
                isPriority
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : indicatorPositive
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-red-50 text-red-700'
              )}
            >
              <TrendingUp className="w-3 h-3" />
              {indicator}
            </span>
          </div>
        )}

        {ctaText && (
          <Button
            size="sm"
            variant={isPriority ? 'primary' : 'outline'}
            onClick={onCtaClick}
            rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}
            className={cn(
              isPriority && 'bg-brand-500 hover:bg-brand-400 text-white border-0 shadow-md'
            )}
          >
            {ctaText}
          </Button>
        )}
      </div>
    </div>
  );
}
