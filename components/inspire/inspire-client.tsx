'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useRef, useCallback, useState } from 'react';
import {
    SidebarProvider,
    SidebarTrigger,
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarFooter,
    SidebarHeader,
    SidebarInset
} from '@/components/ui/sidebar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogCancel,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    Sparkles,
    LogOut,
    LayoutDashboard,
    Lightbulb,
    ExternalLink,
    Loader2,
    MoreVertical,
    Copy,
    Download,
    XCircle,
    CheckCircle2,
    Maximize2
} from 'lucide-react';
import { PIXORA_BUCKET_ID, PIXORA_DB_ID, GENERATIONS_COLLECTION_ID, databases } from '@/lib/appwrite';
import { Query } from 'appwrite';
import { useInfiniteQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function InspireClient() {
    const { user, logout, loading: authLoading } = useAuth();
    const [token, setToken] = useState('');

    useEffect(() => {
        const savedToken = localStorage.getItem('pixora_token');
        if (savedToken) setToken(savedToken);

        const handleMessage = (event: MessageEvent) => {
            if (event.data?.type === 'PIXORA_TOKEN_SYNCCED') {
                const newToken = event.data.token;
                setToken(newToken);
                localStorage.setItem('pixora_token', newToken);
                toast.success('Connection Active');
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    const syncConnection = () => {
        toast.info('Click the Pixora Sync extension in your browser toolbar', {
            description: 'The extension will automatically connect your session.',
            duration: 6000,
        });
    };

    const fetchPublicGenerations = async ({ pageParam = '' }) => {
        const queries = [
            Query.equal('is_public', true),
            Query.orderDesc('created_at'),
            Query.limit(12)
        ];

        if (pageParam) {
            queries.push(Query.cursorAfter(pageParam));
        }

        const resp = await databases.listDocuments(
            PIXORA_DB_ID,
            GENERATIONS_COLLECTION_ID,
            queries
        );
        return resp;
    };

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading
    } = useInfiniteQuery({
        queryKey: ['public-generations'],
        queryFn: fetchPublicGenerations,
        getNextPageParam: (lastPage) => {
            if (lastPage.documents.length < 12) return undefined;
            return lastPage.documents[lastPage.documents.length - 1].$id;
        },
        initialPageParam: '',
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    const observer = useRef<IntersectionObserver | null>(null);
    const lastElementRef = useCallback((node: HTMLDivElement) => {
        if (isLoading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasNextPage) {
                fetchNextPage();
            }
        });
        if (node) observer.current.observe(node);
    }, [isLoading, hasNextPage, fetchNextPage]);

    if (authLoading) {
        return <div className="flex items-center justify-center min-h-screen bg-background"><Loader2 className="animate-spin text-muted-foreground" /></div>;
    }

    return (
        <SidebarProvider>
            <div className="flex min-h-screen bg-background text-foreground w-full">
                <Sidebar className="border-r shadow-sm">
                    <SidebarHeader className="border-b p-4">
                        <Link href="/" className="flex items-center gap-2 group">
                            <div className="p-1.5 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                <Sparkles className="h-5 w-5" />
                            </div>
                            <span className="text-xl font-bold tracking-tight uppercase">Pixora</span>
                        </Link>
                    </SidebarHeader>
                    <SidebarContent>
                        <SidebarGroup>
                            <SidebarGroupLabel className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Navigation</SidebarGroupLabel>
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton asChild>
                                            <Link href="/dashboard" className="flex items-center py-2.5">
                                                <LayoutDashboard className="h-4 w-4 mr-3" />
                                                <span className="font-medium">Creative Studio</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton asChild isActive>
                                            <Link href="/inspire" className="flex items-center py-2.5">
                                                <Lightbulb className="h-4 w-4 mr-3" />
                                                <span className="font-medium">Community Feed</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>

                        {user && (
                            <div className="mt-auto px-4 pb-6 space-y-6">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between px-1">
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">Engine Health</label>
                                        {token && <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />}
                                    </div>
                                    {!token ? (
                                        <Button
                                            variant="destructive"
                                            className="w-full justify-start h-10 shadow-sm transition-all active:scale-[0.98]"
                                            onClick={syncConnection}
                                        >
                                            <XCircle className="h-4 w-4 mr-2" />
                                            <span className="font-semibold">Sync Connection</span>
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="secondary"
                                            className="w-full justify-start h-10 border border-emerald-500/20 text-emerald-600 bg-emerald-50/50 hover:bg-emerald-100/50"
                                            onClick={syncConnection}
                                        >
                                            <CheckCircle2 className="h-4 w-4 mr-2" />
                                            <span className="font-semibold">Engine Synced</span>
                                        </Button>
                                    )}
                                    {!token && (
                                        <div className="space-y-2">
                                            <p className="text-[9px] text-muted-foreground leading-relaxed px-1">
                                                Click the <strong className="text-foreground/70">Pixora Sync</strong> extension in your toolbar to connect.
                                            </p>
                                            <a href="/extension.zip" download className="flex items-center gap-1.5 w-full px-3 py-2 rounded-lg bg-primary/10 border border-primary/20 hover:bg-primary/15 transition-colors text-primary text-[11px] font-semibold">
                                                <span className="text-xs">↓</span>
                                                Download Extension
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </SidebarContent>
                    <SidebarFooter className="border-t p-4 bg-muted/20">
                        {user ? (
                            <div className="flex items-center gap-3 px-1">
                                <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-sm font-bold shadow-inner border border-primary/20">
                                    {user.name.charAt(0)}
                                </div>
                                <div className="flex flex-col truncate flex-1">
                                    <span className="text-sm font-bold truncate leading-tight">{user.name}</span>
                                    <span className="text-[10px] text-muted-foreground truncate opacity-70">{user.email}</span>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                    onClick={logout}
                                >
                                    <LogOut className="h-4 w-4" />
                                </Button>
                            </div>
                        ) : (
                            <Button variant="outline" className="w-full" asChild>
                                <Link href="/">Sign In</Link>
                            </Button>
                        )}
                    </SidebarFooter>
                </Sidebar>

                <SidebarInset className="flex flex-col">
                    <header className="flex h-14 items-center gap-4 border-b px-6 lg:h-[60px] bg-background/50 backdrop-blur">
                        <SidebarTrigger className="lg:hidden" />
                        <div className="flex-1">
                            <h1 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Inspiration Hub</h1>
                        </div>
                    </header>

                    <main className="flex-1 p-6 md:p-10 lg:px-12 lg:py-10 overflow-y-auto">
                        <div className="max-w-7xl mx-auto space-y-10">

                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-primary">
                                    <Sparkles className="h-4 w-4" />
                                    <span className="text-[11px] font-black uppercase tracking-[0.2em] text-primary/70">Community Gallery</span>
                                </div>
                                <h2 className="text-3xl md:text-4xl font-black tracking-tighter">The Pixora Showcase</h2>
                                <p className="text-muted-foreground max-w-2xl text-lg font-medium">Explore high-fidelity visual assets generated by the Pixora community. Real-time prompt transparency for every creation.</p>
                            </div>

                            {isLoading ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => (
                                        <Card key={i} className="aspect-square bg-muted animate-pulse rounded-2xl" />
                                    ))}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {data?.pages.map((page) => (
                                        page.documents.map((doc: any, index: number) => (
                                            <div key={doc.$id} ref={(page.documents.length === index + 1) ? lastElementRef : undefined}>
                                                <InspirationCard doc={doc} user={user} />
                                            </div>
                                        ))
                                    ))}
                                </div>
                            )}

                            {isFetchingNextPage && (
                                <div className="flex justify-center py-10">
                                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                </div>
                            )}

                            {!hasNextPage && !isLoading && (
                                <div className="text-center py-24 border-t border-dashed">
                                    <p className="text-muted-foreground text-[11px] font-black uppercase tracking-[0.3em] opacity-40">EndOfInspiration</p>
                                </div>
                            )}
                        </div>
                    </main>
                </SidebarInset>
            </div>
        </SidebarProvider>
    );
}

function InspirationCard({ doc, user }: { doc: any, user: any }) {
    const imageUrl = `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${PIXORA_BUCKET_ID}/files/${doc.image_id}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`;

    const handleAction = (action: () => void) => {
        if (!user) {
            toast.error('Sign in to perform this action');
            return;
        }
        action();
    };

    const downloadImage = async () => {
        try {
            // Using download endpoint for better compatibility
            const downloadUrl = `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${PIXORA_BUCKET_ID}/files/${doc.image_id}/download?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`;
            const response = await fetch(downloadUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `pixora-${doc.prompt.slice(0, 20)}.png`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            toast.success('Download started');
        } catch (error) {
            console.error('Download error:', error);
            toast.error('Download failed - trying direct link');
            window.open(`${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${PIXORA_BUCKET_ID}/files/${doc.image_id}/download?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`, '_blank');
        }
    };

    return (
        <AlertDialog>
            <Card className="overflow-hidden border-2 border-transparent hover:border-primary/30 group bg-muted/30 transition-all duration-300 rounded-2xl shadow-sm hover:shadow-xl hover:shadow-primary/5">
                <div className="aspect-square relative overflow-hidden bg-muted cursor-pointer">
                    <img
                        src={imageUrl}
                        alt={`AI Generated: ${doc.prompt}`}
                        title={doc.prompt}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-between p-4">
                        <div className="flex justify-end gap-2">
                            <AlertDialogTrigger asChild>
                                <Button
                                    size="icon"
                                    variant="secondary"
                                    className="h-8 w-8 bg-white/10 hover:bg-white/30 border-0 backdrop-blur-md rounded-lg"
                                >
                                    <Maximize2 className="h-4 w-4 text-white" />
                                </Button>
                            </AlertDialogTrigger>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="secondary" size="icon" className="h-8 w-8 bg-white/10 hover:bg-white/30 border-0 backdrop-blur-md rounded-lg">
                                        <MoreVertical className="h-4 w-4 text-white" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuItem onClick={() => handleAction(() => {
                                        navigator.clipboard.writeText(doc.prompt);
                                        toast.success('Prompt copied');
                                    })} className="font-medium">
                                        <Copy className="mr-2 h-4 w-4" />
                                        Copy Prompt
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleAction(downloadImage)} className="font-medium">
                                        <Download className="mr-2 h-4 w-4" />
                                        Download HD
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                        <div>
                            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/20 backdrop-blur-md border border-primary/30 text-[9px] font-bold text-primary-foreground mb-2">
                                <Sparkles className="h-2 w-2" />
                                NEURAL V6
                            </div>
                            <p className="text-white text-xs line-clamp-3 italic leading-relaxed font-medium">"{doc.prompt}"</p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3 px-4 py-3.5 bg-card/50 backdrop-blur">
                    <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary shrink-0 border border-primary/20">
                        {doc.user_name?.charAt(0) || 'P'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <span className="text-xs font-bold truncate block text-foreground">
                            {doc.user_name || 'Anonymous Creator'}
                        </span>
                    </div>
                    <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50 bg-muted px-2 py-1 rounded-md">
                        {doc.aspect_ratio?.replace('IMAGE_ASPECT_RATIO_', '').replace('_', ':') || '1:1'}
                    </div>
                </div>
            </Card>

            <AlertDialogContent className="max-w-[95vw] lg:max-w-[80vw] h-[90vh] p-0 overflow-hidden bg-black/95 border-0">
                <div className="relative w-full h-full flex items-center justify-center p-4">
                    <AlertDialogCancel className="absolute right-4 top-4 z-50 rounded-full h-10 w-10 p-0 border-0 bg-white/10 hover:bg-white/20 text-white backdrop-blur-md">
                        ✕
                    </AlertDialogCancel>

                    <div className="flex flex-col lg:flex-row w-full h-full gap-6">
                        {/* Image Container */}
                        <div className="flex-1 relative bg-neutral-900 rounded-2xl overflow-hidden flex items-center justify-center">
                            <img
                                src={imageUrl.replace('/view', '/download')}
                                alt={doc.prompt}
                                className="max-w-full max-h-full object-contain"
                            />
                        </div>

                        {/* Details Sidebar */}
                        <div className="w-full lg:w-80 flex flex-col gap-6 p-2 lg:p-6 lg:border-l border-white/10">
                            <div>
                                <h3 className="text-sm font-bold uppercase tracking-widest text-primary/70 mb-2">Neural Prompt</h3>
                                <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-xs text-white leading-relaxed italic">
                                    "{doc.prompt}"
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                                    <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Ratio</p>
                                    <p className="text-xs font-bold text-white">{doc.aspect_ratio?.replace('IMAGE_ASPECT_RATIO_', '').replace('_', ':') || '1:1'}</p>
                                </div>
                                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                                    <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Engine</p>
                                    <p className="text-xs font-bold text-white">v6.0</p>
                                </div>
                            </div>

                            <div className="mt-auto space-y-3">
                                <Button onClick={downloadImage} className="w-full gap-2 h-12 font-bold" variant="default">
                                    <Download className="h-4 w-4" />
                                    Download UHD
                                </Button>
                                <Button onClick={() => {
                                    navigator.clipboard.writeText(doc.prompt);
                                    toast.success('Prompt copied');
                                }} variant="outline" className="w-full border-white/10 text-white h-12 font-bold bg-white/5 hover:bg-white/10">
                                    <Copy className="h-4 w-4 mr-2" />
                                    Copy Prompt
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </AlertDialogContent>
        </AlertDialog>
    );
}
