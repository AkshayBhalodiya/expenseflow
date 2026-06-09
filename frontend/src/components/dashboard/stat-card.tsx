import { cn, formatCurrency } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  subtitle?: string;
  trend?: string;
  className?: string;
  currency?: string;
  format?: 'currency' | 'percent';
}

export function StatCard({
  title,
  value,
  icon: Icon,
  subtitle,
  trend,
  className,
  currency = 'INR',
  format = 'currency',
}: StatCardProps) {
  const displayValue =
    format === 'percent' ? `${value}%` : formatCurrency(value, currency);

  return (
    <div className={cn('rounded-xl border bg-card p-4 shadow-sm sm:p-6', className)}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-muted-foreground sm:text-sm">{title}</p>
        <div className="rounded-full bg-primary/10 p-1.5 sm:p-2">
          <Icon className="h-3.5 w-3.5 text-primary sm:h-4 sm:w-4" />
        </div>
      </div>
      <p className="mt-1.5 text-xl font-bold sm:mt-2 sm:text-2xl">{displayValue}</p>
      {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
      {trend && <p className="mt-1 text-xs text-muted-foreground">{trend}</p>}
    </div>
  );
}
