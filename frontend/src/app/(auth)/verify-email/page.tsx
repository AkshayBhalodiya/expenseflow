'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, XCircle, Loader2, Mail } from 'lucide-react';
import { AuthCard } from '@/components/auth/auth-card';
import { Button } from '@/components/ui/button';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Verification token is missing. Please check your email link.');
      return;
    }

    fetch(`${API_URL}/auth/verify-email?token=${token}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStatus('success');
          setMessage(data.message || 'Your email has been verified successfully.');
        } else {
          setStatus('error');
          setMessage(data.message || 'Verification failed. The link may have expired.');
        }
      })
      .catch(() => {
        setStatus('error');
        setMessage('Could not verify email. Please try again later.');
      });
  }, [token]);

  const icon =
    status === 'success' ? (
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500/10">
        <CheckCircle2 className="h-8 w-8 text-green-600" />
      </span>
    ) : status === 'error' ? (
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
        <XCircle className="h-8 w-8 text-destructive" />
      </span>
    ) : (
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
        <Mail className="h-8 w-8 text-primary animate-pulse" />
      </span>
    );

  const title =
    status === 'loading'
      ? 'Verifying your email...'
      : status === 'success'
        ? 'Email verified!'
        : 'Verification failed';

  return (
    <AuthCard title={title} description={message} icon={icon}>
      {status === 'loading' ? (
        <div className="flex justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <Link href="/login" className="block">
          <Button className="h-11 w-full text-base">Continue to sign in</Button>
        </Link>
      )}
    </AuthCard>
  );
}

function VerifyLoading() {
  return (
    <div className="flex justify-center py-12">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerifyLoading />}>
      <VerifyEmailContent />
    </Suspense>
  );
}
