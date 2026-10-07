import type { Metadata } from 'next';
import { Archivo } from 'next/font/google';
import '@campus360/ui/fontawesome';
import '@campus360/ui/styles.css';

const archivo = Archivo({
  subsets: ['latin'],
  variable: '--font-archivo',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Campus 360 Newsroom',
  description: 'Editorial operating system for Campus 360.',
  icons: {
    icon: [{ url: '/brand/icon.png', type: 'image/png' }],
    apple: [{ url: '/brand/icon.png' }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={archivo.variable}>{children}</body>
    </html>
  );
}
