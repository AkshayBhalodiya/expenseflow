'use client';

import { useState } from 'react';
import Link from 'next/link';
import { KeyRound, Mail, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AuthCard } from '@/components/auth/auth-card';
import { AuthInput } from '@/components/auth/auth-input';
import { AUTH_ICON_CLASS, AUTH_ICON_WRAP_CLASS, AUTH_LINK_CLASS } from '@/components/auth/auth-styles';
import { FormField } from '@/components/auth/form-field';
import { api } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [devResetUrl, setDevResetUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setIsSuccess(false);
    setPreviewUrl('');
    setDevResetUrl('');
    try {
      const res = await api.forgotPassword(email);
      setMessage(res.message || 'If this email exists, a reset link has been sent.');
      setPreviewUrl(res.previewUrl || '');
      setDevResetUrl(res.devResetUrl || '');
      setIsSuccess(true);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to send reset link');
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title="Forgot password?"
      description="No worries — enter your email and we'll send you a reset link"
      icon={
        <span className={AUTH_ICON_WRAP_CLASS}>
          <KeyRound className={AUTH_ICON_CLASS} />
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
          <div
            className={`flex gap-3 rounded-lg border px-4 py-3 text-sm ${
              isSuccess
                ? 'border-green-200 bg-green-50 text-green-700'
                : 'border-red-200 bg-red-50 text-red-600'
            }`}
          >
            {isSuccess && <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />}
            <span>{message}</span>
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

        <Button type="submit" className="h-11 w-full text-base" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            'Send reset link'
          )}
        </Button>

        {isSuccess && previewUrl && (
          <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-4 text-sm">
            <p className="mb-2 font-medium text-blue-700">Dev: Email sent (test inbox)</p>
            <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="break-all text-blue-600 underline">
              Open email preview
            </a>
          </div>
        )}

        {isSuccess && devResetUrl && !previewUrl && (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm">
            <p className="mb-2 font-medium text-amber-700">Dev: SMTP not configured — use this link:</p>
            <a href={devResetUrl} className="break-all text-xs text-blue-600 underline">
              {devResetUrl}
            </a>
          </div>
        )}
      </form>
    </AuthCard>
  );
}
