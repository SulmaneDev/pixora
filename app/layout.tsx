import { Inter } from 'next/font/google';
import './globals.css';
import { ClientProviders } from '@/components/providers/client-providers';
import type { Metadata, Viewport } from 'next';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: 'Pixora - Professional AI Image Generation Studio',
    template: '%s | Pixora AI'
  },
  description: 'Generate high-fidelity AI images with professional-grade neural engines. Pixora Studio offers hyper-speed generations, parallel processing, and elite creative tools.',
  keywords: ['AI Image Generator', 'Professional AI Art', 'Pixora Engine', 'Neural Image Generation', 'Creative AI Tools', 'Text to Image AI'],
  authors: [{ name: 'Pixora Team', url: 'https://pixora.ai' }],
  creator: 'Pixora AI',
  publisher: 'Pixora AI',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://pixora.vercel.app'), // Replace with actual domain if known
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Pixora - Professional AI Image Generation Studio',
    description: 'Create stunning visuals in seconds with our Next-Gen Neural Engine.',
    url: 'https://pixora.vercel.app',
    siteName: 'Pixora AI',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pixora - Professional AI Image Generation Studio',
    description: 'Create stunning visuals in seconds with our Next-Gen Neural Engine.',
    creator: '@pixora_ai',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className={`${inter.className} bg-background text-foreground min-h-screen antialiased`}>
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
