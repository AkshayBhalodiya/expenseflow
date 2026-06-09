'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogIn, Mail, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AuthCard } from '@/components/auth/auth-card';
import { AuthInput } from '@/components/auth/auth-input';
import {
  AUTH_FOOTER_CLASS,
  AUTH_ICON_CLASS,
  AUTH_ICON_WRAP_CLASS,
  AUTH_LINK_CLASS,
} from '@/components/auth/auth-styles';
import { FormField } from '@/components/auth/form-field';
import { PasswordInput } from '@/components/auth/password-input';
import { useAuthStore } from '@/store/authStore';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  return (
    <AuthCard
      title="Welcome back"
      description="Sign in to continue managing your finances"
      icon={
        <span className={AUTH_ICON_WRAP_CLASS}>
          <LogIn className={AUTH_ICON_CLASS} />
        </span>
      }
      footer={
        <p className={AUTH_FOOTER_CLASS}>
          Don&apos;t have an account?{' '}
          <Link href="/register" className={AUTH_LINK_CLASS}>
            Create account
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <FormField label="Email address" htmlFor="email">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <AuthInput
              id="email"
              type="email"
              placeholder="you@example.com"
              className="h-11 pl-10"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>
        </FormField>

        <FormField label="Password" htmlFor="password">
          <PasswordInput
            id="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </FormField>

        <div className="flex justify-end">
          <Link href="/forgot-password" className={AUTH_LINK_CLASS}>
            Forgot password?
          </Link>
        </div>

        <Button type="submit" className="h-11 w-full text-base" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            'Sign in'
          )}
        </Button>
      </form>
    </AuthCard>
  );
}
