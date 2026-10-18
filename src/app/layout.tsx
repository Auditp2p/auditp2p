import type { Metadata } from 'next';
import './globals.css';
import { ToastProvider } from '@/components/Toast';

export const metadata: Metadata = {
  title: 'Binance P2P Pro - Auditoría Fiscal SENIAT & SUDEBAN',
  description: 'Sistema integral de registro, control, auditoría fiscal y conciliación de operaciones de compra y venta P2P de Binance.',
  keywords: ['Binance P2P', 'Auditoría Fiscal', 'SENIAT', 'SUDEBAN', 'Venezuela', 'USDT', 'Bolívares'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <body className="bg-[#12161C] text-[#EAECEF] min-h-screen antialiased selection:bg-binance-yellow selection:text-black">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
