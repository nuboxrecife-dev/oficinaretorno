'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { PrimaryButton } from '@/components/ui/button';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email) {
      setErrorMessage('Informe seu e-mail cadastrado.');
      return;
    }

    setIsLoading(true);
    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/login`,
        });
        if (error) {
          setErrorMessage(error.message);
          return;
        }
      }
      setSubmitted(true);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Erro ao solicitar recuperação.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          Recuperar senha
        </h2>
        <p className="text-sm text-slate-500 font-normal">
          Enviaremos um link de redefinição para o seu e-mail cadastrado.
        </p>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200/80 text-red-700 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {submitted ? (
        <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
          <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
          <h3 className="text-base font-bold text-emerald-900">Instruções enviadas!</h3>
          <p className="text-xs text-emerald-800 leading-relaxed">
            Se o e-mail <strong>{email}</strong> estiver cadastrado em nossa base, você receberá um link com as instruções para redefinir sua senha.
          </p>
          <div className="pt-2">
            <Link href="/login">
              <PrimaryButton className="w-full">Voltar para o Login</PrimaryButton>
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="E-mail cadastrado"
            type="email"
            placeholder="seuemail@oficina.com.br"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail className="w-4 h-4" />}
            required
          />

          <PrimaryButton type="submit" isLoading={isLoading} className="w-full h-12 text-sm font-bold mt-2">
            Enviar instruções de recuperação
          </PrimaryButton>
        </form>
      )}

      <div className="pt-4 border-t border-slate-100 text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voltar para o Login</span>
        </Link>
      </div>
    </div>
  );
}
