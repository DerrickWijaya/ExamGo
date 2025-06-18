import './globals.css';
import type { Metadata } from 'next';
import { Maven_Pro } from 'next/font/google';

const mavenPro = Maven_Pro({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700']
});

export const metadata: Metadata = {
  title: 'Daftar Sekarang - GRATIS!',
  description: 'Platform pembelajaran online terbaik',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className={mavenPro.className}>{children}</body>
    </html>
  );
}