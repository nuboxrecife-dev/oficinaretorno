'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Input } from '@/components/ui/input';
import { PrimaryButton } from '@/components/ui/button';
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email) {
      setErrorMessage('Por favor, informe seu e-mail.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await signIn(email, password);
      if (res.success) {
        router.push('/dashboard');
      } else {
        setErrorMessage(res.error || 'Credenciais inválidas. Verifique os dados digitados.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Ocorreu um erro ao entrar.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          Acesse sua conta
        </h2>
        <p className="text-sm text-slate-500 font-normal">
          Digite seus dados de acesso para entrar na plataforma.
        </p>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200/80 text-red-700 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="E-mail profissional"
          type="email"
          placeholder="seuemail@oficina.com.br"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={<Mail className="w-4 h-4" />}
          required
        />

        <Input
          label="Senha"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          icon={<Lock className="w-4 h-4" />}
          required
        />

        <div className="flex items-center justify-between text-xs pt-1">
          <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-600 select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 text-brand-600 border-slate-300 rounded focus:ring-brand-600 cursor-pointer"
            />
            <span>Lembrar acesso</span>
          </label>

          <Link
            href="/esqueci-senha"
            className="font-semibold text-brand-600 hover:text-brand-700 hover:underline transition-colors"
          >
            Esqueci minha senha
          </Link>
        </div>

        <PrimaryButton
          type="submit"
          isLoading={isLoading}
          leftIcon={<LogIn className="w-4 h-4" />}
          className="w-full h-12 text-sm font-bold mt-2"
        >
          Entrar no OficinaRetorno
        </PrimaryButton>
      </form>

      <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500 font-medium">
        Ainda não possui uma conta para sua oficina?{' '}
        <Link
          href="/cadastro"
          className="font-bold text-brand-600 hover:text-brand-700 hover:underline transition-colors"
        >
          Criar minha conta
        </Link>
      </div>
    </div>
  );
}
