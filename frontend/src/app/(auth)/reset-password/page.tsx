'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AuthCard } from '@/components/auth/auth-card';
import { AUTH_ICON_CLASS, AUTH_ICON_WRAP_CLASS, AUTH_LINK_CLASS } from '@/components/auth/auth-styles';
import { FormField } from '@/components/auth/form-field';
import { PasswordInput } from '@/components/auth/password-input';
import { api } from '@/lib/api';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.resetPassword(token, password);
      setMessage('Password reset successful! Redirecting to login...');
      setTimeout(() => router.push('/login'), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title="Set new password"
      description={token ? 'Choose a strong password for your account' : 'Invalid or missing reset link'}
      icon={
        <span className={AUTH_ICON_WRAP_CLASS}>
          <ShieldCheck className={AUTH_ICON_CLASS} />
        </span>
      }
      footer={
        <Link
          href="/login"
          className={`flex items-center justify-center gap-2 ${AUTH_LINK_CLASS}`}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to sign in
        </Link>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {message && (
          <div className="flex gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            {message}
          </div>
        )}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}
        {!token && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            Please use the link from your email to reset your password.
          </div>
        )}

        <FormField label="New password" htmlFor="password" hint="Minimum 8 characters">
          <PasswordInput
            id="password"
            placeholder="Enter new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            autoComplete="new-password"
            required
            disabled={!token}
          />
        </FormField>

        <Button type="submit" className="h-11 w-full text-base" disabled={loading || !token}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Resetting...
            </>
          ) : (
            'Reset password'
          )}
        </Button>
      </form>
    </AuthCard>
  );
}

function ResetLoading() {
  return (
    <div className="flex justify-center py-12">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetLoading />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
