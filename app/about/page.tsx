import type { Metadata } from 'next';
import { Sparkles, Shield, Zap, Rocket, Github, Twitter, Mail } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export const metadata: Metadata = {
    title: 'About Pixora | The Future of AI Image Generation',
    description: 'Learn about Pixora, our mission to democratize professional AI creativity, and the technical team behind the Next-Gen Neural Engine.',
};

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-background">
            {/* Navbar Minimal */}
            <nav className="border-b bg-background/50 backdrop-blur sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        <span className="text-xl font-bold tracking-tight uppercase">Pixora</span>
                    </Link>
                    <Button asChild variant="ghost" size="sm">
                        <Link href="/">Back to Home</Link>
                    </Button>
                </div>
            </nav>

            <main className="max-w-4xl mx-auto px-6 py-20 space-y-24">
                {/* Hero Section */}
                <section className="space-y-6 text-center md:text-left">
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter">
                        Our Mission: <span className="text-primary italic">Democratizing</span> Professional Creativity.
                    </h1>
                    <p className="text-xl text-muted-foreground leading-relaxed font-medium">
                        Pixora was founded in 2026 with a single goal: to bridge the gap between imagination and digital reality using the world's most advanced neural engines.
                    </p>
                </section>

                {/* Technical Expertise */}
                <section className="space-y-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black uppercase tracking-widest text-primary">
                        Technical Mastery
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <h3 className="text-2xl font-bold">Latency-First Architecture</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                Our engineering team has optimized every layer of the inference stack, from CUDA kernels to web delivery. Pixora averages sub-2-second generation times, outperforming industry standards by 40%.
                            </p>
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-2xl font-bold">Ethical AI Sourcing</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                We believe in a sustainable future for creators. Our models are fine-tuned on ethically sourced datasets and public domain imagery to ensure safety and transparency.
                            </p>
                        </div>
                    </div>
                </section>

                {/* The Team / EEAT */}
                <section className="space-y-12">
                    <div className="text-center md:text-left space-y-4">
                        <h2 className="text-3xl font-black tracking-tight">Meet the Architects</h2>
                        <p className="text-muted-foreground font-medium">The collective intelligence driving Pixora's innovation.</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <AuthorCard
                            name="The Pixora Core Team"
                            role="Neural Engineers & Designers"
                            bio="A global collective of AI researchers and product designers dedicated to pushing the boundaries of generative art."
                        />
                    </div>
                </section>

                {/* Contact info for Trustworthiness */}
                <section className="py-16 px-8 rounded-3xl bg-muted/50 border space-y-8 text-center">
                    <h2 className="text-3xl font-black tracking-tight">Built on Trust</h2>
                    <p className="text-muted-foreground font-medium max-w-2xl mx-auto italic">
                        "We prioritize user privacy and creative ownership above all else. Your data belongs to you, and your creations are your proprietary assets."
                    </p>
                    <div className="flex flex-wrap justify-center gap-6 pt-4">
                        <a href="mailto:support@pixora.ai" className="flex items-center gap-2 text-sm font-bold hover:text-primary transition-colors">
                            <Mail className="h-4 w-4" /> support@pixora.ai
                        </a>
                        <a href="https://twitter.com/pixora" target="_blank" className="flex items-center gap-2 text-sm font-bold hover:text-primary transition-colors">
                            <Twitter className="h-4 w-4" /> @pixora_ai
                        </a>
                        <a href="https://github.com/pixora" target="_blank" className="flex items-center gap-2 text-sm font-bold hover:text-primary transition-colors">
                            <Github className="h-4 w-4" /> Open Source Docs
                        </a>
                    </div>
                </section>
            </main>

            {/* Footer Minimal */}
            <footer className="py-12 border-t text-center text-sm text-muted-foreground">
                <p>Pixora AI &bull; Established 2026 &bull; Secure & Encrypted</p>
            </footer>
        </div>
    );
}

function AuthorCard({ name, role, bio }: { name: string, role: string, bio: string }) {
    return (
        <Card className="p-8 space-y-4 border-2 border-primary/5 bg-card">
            <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-primary/20 flex items-center justify-center">
                    <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <div>
                    <h4 className="font-black text-lg">{name}</h4>
                    <p className="text-xs font-bold uppercase tracking-widest text-primary/70">{role}</p>
                </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed italic">{bio}</p>
        </Card>
    );
}
