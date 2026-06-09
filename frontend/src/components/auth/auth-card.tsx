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
    <div className={cn('rounded-2xl border bg-card p-6 shadow-lg shadow-black/5 sm:p-8', className)}>
      <div className="mb-6 space-y-2 text-center sm:text-left">
        {icon && <div className="mb-3 flex justify-center sm:justify-start">{icon}</div>}
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {children}
      {footer && <div className="mt-6 border-t pt-6">{footer}</div>}
    </div>
  );
}
