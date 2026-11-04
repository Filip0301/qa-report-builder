import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Doc Builder — Documentación analítica',
  description:
    'Crea, guarda y exporta documentación analítica estandarizada: auditorías QA, DataLayer, planes de marcaje, auditorías GTM y CM360.',
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: '#020617',
  colorScheme: 'dark',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="dark">
      <body className={`${inter.className} bg-slate-950 text-white antialiased`}>
        {children}
        <Toaster theme="dark" position="bottom-right" richColors closeButton />
      </body>
    </html>
  );
}
