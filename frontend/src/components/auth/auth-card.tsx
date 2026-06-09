import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface AuthCardProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function AuthCard({ title, description, icon, children, footer, className }: AuthCardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-8',
        className
      )}
    >
      <div className="mb-6 space-y-2 text-center sm:text-left">
        {icon && <div className="mb-3 flex justify-center sm:justify-start">{icon}</div>}
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h2>
        {description && <p className="text-sm text-slate-500">{description}</p>}
      </div>
      {children}
      {footer && <div className="mt-6 border-t border-slate-100 pt-6">{footer}</div>}
    </div>
  );
}
