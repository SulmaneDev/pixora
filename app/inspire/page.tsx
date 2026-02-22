import InspireClient from '@/components/inspire/inspire-client';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Inspiration Hub | Community AI Showcase',
    description: 'Explore the high-fidelity AI image gallery on Pixora. See what our community is creating with professional-grade neural engines and copy prompts for your own creations.',
    keywords: ['AI Art Gallery', 'Pixora Showcase', 'AI Image Prompts', 'Community AI Art', 'Neural Engine Gallery'],
    openGraph: {
        title: 'Inspiration Hub | Pixora AI Showcase',
        description: 'Elite AI-generated visuals from the Pixora community.',
        type: 'website',
    },
};

export default function InspirePage() {
    return <InspireClient />;
}
