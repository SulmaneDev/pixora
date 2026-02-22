import LandingClient from '@/components/landing/landing-client';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pixora | Professional AI Image Generation Studio',
  description: 'Experience the next generation of AI image generation. Pixora provides high-fidelity, professional-grade visual creation tools with hyper-speed neural engines.',
  openGraph: {
    title: 'Pixora | Professional AI Image Generation Studio',
    description: 'Create stunning visuals in seconds with our Next-Gen Neural Engine.',
    images: [
      {
        url: '/og-image.png', // You should create this or I can generate a prompt for it
        width: 1200,
        height: 630,
        alt: 'Pixora AI Image Generator',
      },
    ],
  },
};

export default function LandingPage() {
  return <LandingClient />;
}
