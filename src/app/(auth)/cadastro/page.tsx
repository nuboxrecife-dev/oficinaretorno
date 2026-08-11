'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Input } from '@/components/ui/input';
import { PrimaryButton } from '@/components/ui/button';
import { User, Building2, Phone, Mail, Lock, UserPlus, AlertCircle } from 'lucide-react';

export default function CadastroPage() {
  const router = useRouter();
  const { signUp } = useAuth();

  const [userName, setUserName] = useState('');
  const [orgName, setOrgName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!userName || !orgName || !email || !password) {
      setErrorMessage('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('As senhas não coincidem. Digite novamente.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('A senha deve possuir pelo menos 6 caracteres.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await signUp({
        userName,
        orgName,
        phone,
        email,
        password,
      });

      if (res.success) {
        router.push('/dashboard');
      } else {
        setErrorMessage(res.error || 'Erro ao realizar cadastro. Tente novamente.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Ocorreu um erro ao criar a conta.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          Cadastre sua oficina
        </h2>
        <p className="text-sm text-slate-500 font-normal">
          Crie seu ambiente exclusivo e comece a recuperar clientes.
        </p>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200/80 text-red-700 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <Input
          label="Nome do responsável"
          placeholder="Ex: Roberto Oliveira"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          icon={<User className="w-4 h-4" />}
          required
        />

        <Input
          label="Nome da oficina / Centro automotivo"
          placeholder="Ex: Oficina Mecânica Express"
          value={orgName}
          onChange={(e) => setOrgName(e.target.value)}
          icon={<Building2 className="w-4 h-4" />}
          required
        />

        <Input
          label="WhatsApp de contato"
          type="tel"
          placeholder="(11) 99999-8888"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          icon={<Phone className="w-4 h-4" />}
        />

        <Input
          label="E-mail profissional"
          type="email"
          placeholder="seuemail@oficina.com.br"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={<Mail className="w-4 h-4" />}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Senha"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock className="w-4 h-4" />}
            required
          />

          <Input
            label="Confirmar senha"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            icon={<Lock className="w-4 h-4" />}
            required
          />
        </div>

        <PrimaryButton
          type="submit"
          isLoading={isLoading}
          leftIcon={<UserPlus className="w-4 h-4" />}
          className="w-full h-12 text-sm font-bold mt-2"
        >
          Criar minha conta
        </PrimaryButton>
      </form>

      <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500 font-medium">
        Já possui uma conta?{' '}
        <Link
          href="/login"
          className="font-bold text-brand-600 hover:text-brand-700 hover:underline transition-colors"
        >
          Fazer Login
        </Link>
      </div>
    </div>
  );
}
