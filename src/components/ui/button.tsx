import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]';

    const variants = {
      primary:
        'bg-brand-600 hover:bg-brand-700 text-white shadow-sm focus:ring-brand-600 hover:shadow',
      secondary:
        'bg-slate-100 hover:bg-slate-200 text-slate-800 focus:ring-slate-400',
      outline:
        'border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 focus:ring-brand-500 shadow-xs',
      ghost:
        'bg-transparent hover:bg-slate-100 text-slate-700 focus:ring-slate-300',
      danger:
        'bg-red-600 hover:bg-red-700 text-white shadow-sm focus:ring-red-600',
    };

    const sizes = {
      sm: 'h-9 px-3 text-xs gap-1.5',
      md: 'h-11 px-4 text-sm gap-2',
      lg: 'h-12 px-6 text-base gap-2.5',
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            {leftIcon}
            <span>{children}</span>
            {rightIcon}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export const PrimaryButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => <Button ref={ref} variant="primary" {...props} />
);
PrimaryButton.displayName = 'PrimaryButton';

export const SecondaryButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => <Button ref={ref} variant="secondary" {...props} />
);
SecondaryButton.displayName = 'SecondaryButton';
