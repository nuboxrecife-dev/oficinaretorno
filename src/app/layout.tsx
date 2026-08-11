import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/auth-context';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'OficinaRetorno — Seus clientes sempre voltam.',
  description: 'SaaS de gestão de retornos e recuperação de clientes para oficinas mecânicas e centros automotivos.',
  keywords: ['oficina mecanica', 'centro automotivo', 'retencao de clientes', 'saas automotivo', 'retorno de clientes'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable}`}>
      <body className="font-sans bg-slate-50 text-slate-900 antialiased selection:bg-brand-600 selection:text-white">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
