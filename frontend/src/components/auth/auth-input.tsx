import { Input, InputProps } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { AUTH_INPUT_CLASS } from './auth-styles';

export function AuthInput({ className, ...props }: InputProps) {
  return <Input className={cn(AUTH_INPUT_CLASS, className)} {...props} />;
}
