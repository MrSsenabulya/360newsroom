import type { Metadata } from 'next';
import { Archivo, Source_Serif_4 } from 'next/font/google';
import '@campus360/ui/styles.css';

const archivo = Archivo({
  subsets: ['latin'],
  variable: '--font-archivo',
  display: 'swap',
});

const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  variable: '--font-source-serif',
  display: 'swap',
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Campus 360',
    template: '%s · Campus 360',
  },
  description: 'The youth-first information and culture network for campus life.',
  icons: {
    icon: [{ url: '/brand/icon.png', type: 'image/png' }],
    apple: [{ url: '/brand/icon.png' }],
  },
  openGraph: {
    type: 'website',
    siteName: 'Campus 360',
    title: 'Campus 360',
    description: 'Know what matters. Move with campus.',
    images: [{ url: '/brand/logo.png', alt: 'Campus 360' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Campus 360',
    description: 'Know what matters. Move with campus.',
    images: ['/brand/logo.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${archivo.variable} ${sourceSerif.variable}`}>{children}</body>
    </html>
  );
}
