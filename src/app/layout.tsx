import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '700', '900'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'UBS - Sistema de Chamada de Pacientes',
  description:
    'Sistema de chamada de pacientes em tempo real para Unidades Básicas de Saúde.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn('font-sans antialiased', poppins.variable)}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
