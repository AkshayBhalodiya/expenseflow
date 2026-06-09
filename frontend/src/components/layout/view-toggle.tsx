'use client';

import { User, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useViewStore } from '@/store/viewStore';

interface ViewToggleProps {
  hasHousehold?: boolean;
}

export function ViewToggle({ hasHousehold = true }: ViewToggleProps) {
  const { viewMode, setViewMode } = useViewStore();

  if (!hasHousehold) return null;

  return (
    <div className="flex w-full rounded-xl border bg-muted p-1 gap-1 sm:inline-flex sm:w-auto">
      <button
        type="button"
        onClick={() => setViewMode('personal')}
        className={cn(
          'flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors sm:flex-none sm:py-1.5',
          viewMode === 'personal' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
        )}
      >
        <User className="h-4 w-4 shrink-0" />
        <span className="truncate">My Finances</span>
      </button>
      <button
        type="button"
        onClick={() => setViewMode('household')}
        className={cn(
          'flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors sm:flex-none sm:py-1.5',
          viewMode === 'household' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
        )}
      >
        <Home className="h-4 w-4 shrink-0" />
        <span className="truncate">Home</span>
      </button>
    </div>
  );
}
