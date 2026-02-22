'use client';

import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    Zap,
    Shield,
    Rocket,
    Sparkles,
    Image as ImageIcon,
    ArrowRight,
    Layers,
    Loader2
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect } from 'react';

export default function LandingClient() {
    const { user, loginWithGoogle, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (user) {
            router.push('/dashboard');
        }
    }, [user, router]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <Loader2 className="animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary selection:text-primary-foreground">

            {/* Navbar */}
            <nav className="fixed top-0 w-full z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        <span className="text-xl font-bold tracking-tight uppercase">Pixora</span>
                    </div>
                    <div className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
                        <Link href="/inspire" className="hover:text-foreground transition-colors">Feed</Link>
                        <Link href="#features" className="hover:text-foreground transition-colors">Features</Link>
                        <Link href="#workflow" className="hover:text-foreground transition-colors">Workflow</Link>
                        <Link href="/about" className="hover:text-foreground transition-colors">About</Link>
                    </div>
                    <div className="flex items-center gap-3">
                        {!user ? (
                            <>
                                <Button variant="ghost" size="sm" onClick={loginWithGoogle}>
                                    Sign In
                                </Button>
                                <Button size="sm" onClick={loginWithGoogle}>
                                    Get Started
                                </Button>
                            </>
                        ) : (
                            <Button asChild size="sm">
                                <Link href="/dashboard">Go to Studio</Link>
                            </Button>
                        )}
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 overflow-hidden">
                {/* Decorative elements for SEO and visual appeal */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10 pointer-events-none">
                    <div className="absolute top-[10%] left-[10%] w-72 h-72 bg-primary/20 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[20%] right-[10%] w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
                </div>

                <div className="max-w-4xl mx-auto text-center space-y-8">
                    <div className="inline-flex justify-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted border text-xs font-semibold text-muted-foreground animate-in fade-in slide-in-from-bottom-3 duration-700">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                            </span>
                            Next-Gen Neural Engine v6.0
                        </div>
                    </div>

                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground animate-in fade-in slide-in-from-bottom-5 duration-700 delay-100 italic">
                        Create Professional AI Visuals <br />
                        <span className="text-muted-foreground not-italic">at the Speed of Thought.</span>
                    </h1>

                    <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground font-medium leading-relaxed animate-in fade-in slide-in-from-bottom-7 duration-700 delay-200">
                        Professional-grade image generation powered by Pixora's elite GPU cluster. <br className="hidden md:block" /> Engineered for high-fidelity creative output and rapid iteration cycles.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 animate-in fade-in slide-in-from-top-4 duration-700 delay-300">
                        <Button
                            onClick={loginWithGoogle}
                            size="lg"
                            className="h-12 px-8 text-base font-bold shadow-lg"
                        >
                            Start Creating Free
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                        <Button
                            asChild
                            variant="outline"
                            size="lg"
                            className="h-12 px-8 text-base font-bold"
                        >
                            <Link href="/inspire">Explore Community Hub</Link>
                        </Button>
                    </div>
                </div>
            </section>

            {/* Stats Section (Technical SEO & Authority) */}
            <section className="py-12 border-y bg-muted/20">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
                    <StatBox label="Neural Cycles" value="< 1.2s" />
                    <StatBox label="Daily Generations" value="500k+" />
                    <StatBox label="Elite Creators" value="10k+" />
                    <StatBox label="Global Uptime" value="99.9%" />
                </div>
            </section>

            {/* Feature Grid */}
            <section id="features" className="py-24 px-6 bg-muted/30">
                <div className="max-w-7xl mx-auto space-y-16">
                    <div className="text-center space-y-4">
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">The Professional Design Standard</h2>
                        <p className="text-muted-foreground font-medium max-w-xl mx-auto">Infrastructure built for modern creators who demand peak performance and unmatched fidelity.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <LandingCard
                            icon={<Zap className="h-5 w-5" />}
                            title="Hyper-Latency Engine"
                            description="Sub-second neural cycles allow you to generate complex scenes while your creative thought is still fresh. Zero lag, pure inspiration."
                        />
                        <LandingCard
                            icon={<Shield className="h-5 w-5" />}
                            title="Enterprise Security"
                            description="Professional data sanitization protocols. All creative session data is managed with high-security standards for your peace of mind."
                        />
                        <LandingCard
                            icon={<Layers className="h-5 w-5" />}
                            title="Parallel Matrix Processing"
                            description="Batch-execute hundreds of prompts simultaneously. Perfect for campaign scaling and rapid stylistic exploration."
                        />
                    </div>
                </div>
            </section>

            {/* AI Structured Info Section (GEO/AI Optimization) */}
            <section className="py-24 px-6 border-b">
                <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                        <h2 className="text-3xl font-bold tracking-tight">How Pixora AI Works</h2>
                        <div className="space-y-4 text-muted-foreground font-medium">
                            <p>Pixora uses a proprietary <strong>Latent Diffusion Matrix</strong> architecture optimized for RTX 4090 clusters. This ensures that every pixel is calculated with extreme precision before upscaling.</p>
                            <ul className="space-y-2 list-disc pl-5">
                                <li>Real-time prompt semantic analysis</li>
                                <li>High-fidelity temporal consistency</li>
                                <li>Advanced lighting and texture shading</li>
                                <li>Lossless export in 4K resolution</li>
                            </ul>
                        </div>
                    </div>
                    <div className="relative aspect-video rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border-2 border-dashed border-primary/30">
                        <div className="flex flex-col items-center gap-2">
                            <Sparkles className="h-10 w-10 text-primary animate-pulse" />
                            <span className="text-xs font-bold uppercase tracking-widest text-primary/50">Neural Engine v6.0</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Simple Workflow */}
            <section id="workflow" className="py-24 px-6 border-b">
                <div className="max-w-5xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
                        <div className="space-y-8">
                            <div className="space-y-4">
                                <h2 className="text-4xl font-bold tracking-tight">Creative Workflow</h2>
                                <p className="text-muted-foreground text-lg italic">"Connecting the dots between abstract thought and visual reality."</p>
                            </div>

                            <div className="space-y-10 pt-4">
                                <WorkflowStep
                                    number="01"
                                    title="Contextual Sync"
                                    description="Our engine syncs with your creative context to understand style references and technical requirements instantly."
                                />
                                <WorkflowStep
                                    number="02"
                                    title="Prompt Orchestration"
                                    description="Leveraging parallel processing, we orchestrate multiple prompt variants to find your perfect visual match."
                                />
                                <WorkflowStep
                                    number="03"
                                    title="Final Production"
                                    description="Export production-ready assets in multiple formats with AI-enhanced upscaling up to 4x native resolution."
                                />
                            </div>
                        </div>

                        <Card className="aspect-square bg-muted flex items-center justify-center border-dashed border-2 p-12 overflow-hidden shadow-sm relative group">
                            <div className="grid grid-cols-2 gap-4 w-full relative z-10 transition-transform duration-500 group-hover:scale-110">
                                {[Sparkles, ImageIcon, Shield, Rocket].map((Icon, i) => (
                                    <div key={i} className="aspect-square bg-background border flex items-center justify-center rounded-xl shadow-sm">
                                        <Icon className="h-8 w-8 text-primary/40" />
                                    </div>
                                ))}
                            </div>
                            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Card>
                    </div>
                </div>
            </section>

            {/* Programmatic SEO Section: Use Cases */}
            <section className="py-24 px-6 bg-muted/20">
                <div className="max-w-7xl mx-auto space-y-16">
                    <div className="text-center space-y-4">
                        <h2 className="text-3xl md:text-4xl font-black tracking-tight uppercase">Infinite Use Cases</h2>
                        <p className="text-muted-foreground font-medium max-w-xl mx-auto">Tailored neural configurations for every professional vertical.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <UseCaseCard
                            title="AI for Designers"
                            desc="Generate UI layouts, icons, and moodboard inspirations with pixel-perfect precision."
                            slug="designers"
                        />
                        <UseCaseCard
                            title="AI for Marketers"
                            desc="Create high-converting social media assets and ad creative in parallel batches."
                            slug="marketers"
                        />
                        <UseCaseCard
                            title="AI for Game Devs"
                            desc="Rapidly prototype textures, character concepts, and immersive environment art."
                            slug="game-devs"
                        />
                        <UseCaseCard
                            title="AI for Students"
                            desc="Visualize complex scientific concepts and historical events for educational projects."
                            slug="students"
                        />
                    </div>
                </div>
            </section>

            {/* Schema Markup for Google & AI (Hidden but present in DOM) */}
            <script type="application/ld+json" dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "SoftwareApplication",
                    "name": "Pixora AI",
                    "operatingSystem": "Web",
                    "applicationCategory": "DesignApplication",
                    "offers": {
                        "@type": "Offer",
                        "price": "0",
                        "priceCurrency": "USD"
                    },
                    "aggregateRating": {
                        "@type": "AggregateRating",
                        "ratingValue": "4.9",
                        "ratingCount": "1200"
                    }
                })
            }} />

            {/* CTA Section */}
            <section className="py-24 px-6">
                <div className="max-w-4xl mx-auto text-center space-y-10 py-16 px-8 rounded-3xl border bg-muted/50 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -mr-32 -mt-32" />
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Ready to Elevate Your Craft?</h2>
                    <p className="text-muted-foreground text-lg font-medium max-w-xl mx-auto">
                        Join thousands of professional creators building the next generation of visual storytelling on Pixora.
                    </p>
                    <div className="pt-4">
                        <Button
                            onClick={loginWithGoogle}
                            size="lg"
                            className="h-14 px-12 text-lg font-bold rounded-xl shadow-xl hover:shadow-primary/20 transition-all"
                        >
                            Enter Pixora Studio
                        </Button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-16 border-t px-6 bg-muted/20">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-primary" />
                            <span className="text-xl font-bold tracking-tight text-foreground">PIXORA</span>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            The leading AI image generation platform for professional creators and design studios.
                        </p>
                    </div>
                    <div className="space-y-4">
                        <h4 className="text-sm font-bold uppercase tracking-wider text-foreground">Product</h4>
                        <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                            <Link href="/dashboard" className="hover:text-primary transition-colors">Studio</Link>
                            <Link href="/inspire" className="hover:text-primary transition-colors">Feed</Link>
                            <Link href="/extension.zip" className="hover:text-primary transition-colors">Extension</Link>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <h4 className="text-sm font-bold uppercase tracking-wider text-foreground">Company</h4>
                        <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                            <Link href="/about" className="hover:text-primary transition-colors">About Us</Link>
                            <Link href="#" className="hover:text-primary transition-colors">Safety</Link>
                            <Link href="#" className="hover:text-primary transition-colors">Terms</Link>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <h4 className="text-sm font-bold uppercase tracking-wider text-foreground">Social</h4>
                        <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                            <a href="https://twitter.com" target="_blank" className="hover:text-primary transition-colors">Twitter (X)</a>
                            <a href="https://discord.com" target="_blank" className="hover:text-primary transition-colors">Discord</a>
                            <a href="https://instagram.com" target="_blank" className="hover:text-primary transition-colors">Instagram</a>
                        </div>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-muted-foreground">
                    <p className="font-medium inline-flex items-center gap-2">
                        Pixora &copy; 2026. Built for the future of creativity.
                    </p>
                    <div className="flex gap-8 font-semibold">
                        <Link href="#" className="hover:text-foreground">Privacy Policy</Link>
                        <Link href="#" className="hover:text-foreground">Contact Support</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}

function StatBox({ label, value }: { label: string, value: string }) {
    return (
        <div className="text-center md:text-left">
            <p className="text-3xl font-black text-foreground">{value}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
        </div>
    );
}

function LandingCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <Card className="p-8 hover:bg-muted/50 transition-all border-2 border-transparent hover:border-primary/20 group">
            <div className="mb-6 h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                {icon}
            </div>
            <h3 className="text-xl font-bold mb-3">{title}</h3>
            <p className="text-muted-foreground text-sm font-medium leading-relaxed">{description}</p>
        </Card>
    );
}

function WorkflowStep({ number, title, description }: { number: string, title: string, description: string }) {
    return (
        <div className="flex gap-6">
            <span className="text-2xl font-black text-primary/10 italic shrink-0">{number}</span>
            <div className="space-y-1">
                <h3 className="text-lg font-bold">{title}</h3>
                <p className="text-muted-foreground text-sm font-medium leading-relaxed">{description}</p>
            </div>
        </div>
    );
}

function UseCaseCard({ title, desc, slug }: { title: string, desc: string, slug: string }) {
    return (
        <Card className="p-6 space-y-3 bg-card border-2 border-transparent hover:border-primary/10 hover:bg-muted/30 transition-all cursor-pointer group">
            <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            <div className="pt-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-primary/50 group-hover:text-primary transition-colors flex items-center gap-1">
                    Explore Solution <ArrowRight className="h-2 w-2" />
                </span>
            </div>
        </Card>
    );
}
