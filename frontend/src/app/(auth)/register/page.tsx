'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserPlus, Mail, User, Loader2 } from 'lucide-react';
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

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await register(name, email, password);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    }
  };

  return (
    <AuthCard
      title="Create your account"
      description="Start tracking your personal & home finances today"
      icon={
        <span className={AUTH_ICON_WRAP_CLASS}>
          <UserPlus className={AUTH_ICON_CLASS} />
        </span>
      }
      footer={
        <p className={AUTH_FOOTER_CLASS}>
          Already have an account?{' '}
          <Link href="/login" className={AUTH_LINK_CLASS}>
            Sign in
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

        <FormField label="Full name" htmlFor="name">
          <div className="relative">
            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <AuthInput
              id="name"
              placeholder="John Doe"
              className="h-11 pl-10"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              required
            />
          </div>
        </FormField>

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

        <FormField label="Password" htmlFor="password" hint="Minimum 8 characters">
          <PasswordInput
            id="password"
            placeholder="Create a strong password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            autoComplete="new-password"
            required
          />
        </FormField>

        <Button type="submit" className="h-11 w-full text-base" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            'Create account'
          )}
        </Button>
      </form>
    </AuthCard>
  );
}
