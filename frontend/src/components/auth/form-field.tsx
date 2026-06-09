import { ReactNode } from 'react';
import { Label } from '@/components/ui/label';
import { AUTH_HINT_CLASS, AUTH_LABEL_CLASS } from './auth-styles';

interface FormFieldProps {
  label: string;
  htmlFor: string;
  children: ReactNode;
  hint?: string;
}

export function FormField({ label, htmlFor, children, hint }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor} className={AUTH_LABEL_CLASS}>
        {label}
      </Label>
      {children}
      {hint && <p className={AUTH_HINT_CLASS}>{hint}</p>}
    </div>
  );
}
