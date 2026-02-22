'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState, useCallback, useRef } from 'react';
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Plus,
    LogOut,
    LayoutDashboard,
    Sparkles,
    Loader2,
    Image as ImageIcon,
    RotateCw,
    CheckCircle2,
    XCircle,
    Lightbulb,
    User,
    Paintbrush,
    Clock,
    Zap,
    Download,
    Puzzle,
    ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';
import { saveGenerationToAppwrite, getDailyGenerationCount } from '@/lib/whisk';
import { generatePixoraImage } from '@/lib/pixora-actions';
import { PIXORA_BUCKET_ID, PIXORA_DB_ID, GENERATIONS_COLLECTION_ID, databases } from '@/lib/appwrite';
import { Query } from 'appwrite';
import { useQuery, useQueryClient } from '@tanstack/react-query';

// Style presets: each adds descriptive keywords that guide the model
const STYLE_PRESETS: Record<string, { label: string; suffix: string; icon: string }> = {
    none: { label: 'None', suffix: '', icon: '✦' },
    photographic: { label: 'Photographic', suffix: ', ultra-realistic DSLR photo, cinematic lighting, 8K resolution, RAW format', icon: '📷' },
    cartoonic: { label: 'Cartoonic', suffix: ', vibrant cartoon illustration style, bold outlines, cel-shading, flat colors, Disney Pixar style', icon: '🎨' },
    anime: { label: 'Anime', suffix: ', anime art style, Studio Ghibli, detailed illustration, vibrant colors, manga influence', icon: '⛩️' },
    render_3d: { label: '3D Render', suffix: ', 3D CGI render, octane render, ray-tracing, photorealistic, hyper detailed, Blender', icon: '🌐' },
    oil_painting: { label: 'Oil Painting', suffix: ', classical oil painting, rich textures, impressionist brushwork, museum quality', icon: '🖼️' },
    watercolor: { label: 'Watercolor', suffix: ', soft watercolor painting, delicate washes, artistic, flowing colors, hand-painted', icon: '💧' },
    cyberpunk: { label: 'Cyberpunk', suffix: ', cyberpunk aesthetic, neon lights, dystopian future, rain-soaked streets, blade runner style', icon: '🌆' },
};

interface QueueItem {
    id: string;
    prompt: string;
    status: 'pending' | 'generating' | 'saving' | 'completed' | 'failed';
    error?: string;
    attempts: number;
    imageId?: string; // store image_id after completion
}

export default function DashboardPage() {
    const { user, logout, loading: authLoading } = useAuth();
    const router = useRouter();
    const queryClient = useQueryClient();
    const isProcessingRef = useRef(false); // Use ref to prevent re-render race conditions

    const [promptsText, setPromptsText] = useState('');
    const [batchCount, setBatchCount] = useState('1');
    const [token, setToken] = useState('');
    const [aspectRatio, setAspectRatio] = useState('IMAGE_ASPECT_RATIO_SQUARE');
    const [stylePreset, setStylePreset] = useState('none');
    const [queue, setQueue] = useState<QueueItem[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        const savedToken = localStorage.getItem('pixora_token');
        if (savedToken) setToken(savedToken);

        const handleMessage = (event: MessageEvent) => {
            if (event.data?.type === 'PIXORA_TOKEN_SYNCCED') {
                const newToken = event.data.token;
                setToken(newToken);
                localStorage.setItem('pixora_token', newToken);
                toast.success('Pixora Engine Connected ✓');
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    const syncConnection = () => {
        toast.info('Click the Pixora Sync extension in your browser toolbar', {
            description: 'The extension will automatically connect your session — no copy-paste needed.',
            duration: 6000,
        });
    };

    useEffect(() => {
        if (!authLoading && !user) router.push('/');
    }, [user, authLoading, router]);

    const { data: generations, isLoading: gensLoading } = useQuery({
        queryKey: ['generations', user?.$id],
        queryFn: async () => {
            const resp = await databases.listDocuments(PIXORA_DB_ID, GENERATIONS_COLLECTION_ID, [
                Query.equal('user_id', user?.$id || ''),
                Query.orderDesc('created_at'),
                Query.limit(6)
            ]);
            return resp.documents;
        },
        enabled: !!user,
        staleTime: 60 * 1000,
    });

    const { data: dailyCount = 0 } = useQuery({
        queryKey: ['dailyCount', user?.$id],
        queryFn: () => getDailyGenerationCount(user!.$id),
        enabled: !!user,
        staleTime: 30 * 1000,
    });

    const startBulkGeneration = () => {
        if (!token) {
            toast.error('Engine Not Connected', {
                description: 'Click "Sync Connection" to get started.',
                action: { label: 'Sync', onClick: syncConnection }
            });
            return;
        }

        const lines = promptsText.split('\n').filter(p => p.trim());
        if (lines.length === 0) {
            toast.error('Enter a creative prompt first');
            return;
        }

        const preset = STYLE_PRESETS[stylePreset];
        const newItems: QueueItem[] = [];
        lines.forEach(line => {
            for (let i = 0; i < parseInt(batchCount); i++) {
                newItems.push({
                    id: Math.random().toString(36).substring(7),
                    prompt: `${line.trim()}${preset.suffix}`,
                    status: 'pending',
                    attempts: 0
                });
            }
        });

        setQueue(prev => [...newItems, ...prev]);
        setPromptsText('');
        toast.success(`${newItems.length} job${newItems.length > 1 ? 's' : ''} queued`);
    };

    // STABLE queue processor — uses ref to prevent duplicate execution
    const processQueue = useCallback(async (currentQueue: QueueItem[], currentToken: string) => {
        if (isProcessingRef.current) return;

        const nextItem = currentQueue.find(item => item.status === 'pending');
        if (!nextItem) return;

        if (!currentToken) return;

        isProcessingRef.current = true;
        setIsProcessing(true);

        // Mark as generating
        setQueue(prev => prev.map(item =>
            item.id === nextItem.id ? { ...item, status: 'generating', attempts: item.attempts + 1 } : item
        ));

        try {
            const base64 = await generatePixoraImage({
                prompt: nextItem.prompt,
                aspectRatio,
                token: currentToken
            });

            setQueue(prev => prev.map(item =>
                item.id === nextItem.id ? { ...item, status: 'saving' } : item
            ));

            const doc = await saveGenerationToAppwrite(user!.$id, user!.name, nextItem.prompt, aspectRatio, base64);

            setQueue(prev => prev.map(item =>
                item.id === nextItem.id ? { ...item, status: 'completed', imageId: doc.image_id } : item
            ));

            queryClient.invalidateQueries({ queryKey: ['generations', user?.$id] });
            queryClient.invalidateQueries({ queryKey: ['dailyCount', user?.$id] });

            toast.success('Image Generated!', { description: nextItem.prompt.slice(0, 60) + '...' });

        } catch (error: any) {
            const msg = error.message || '';
            const isConnectionExpired = msg === 'CONNECTION_EXPIRED';
            const isBlocked = msg.startsWith('PROMPT_BLOCKED');

            setQueue(prev => prev.map(item =>
                item.id === nextItem.id ? {
                    ...item,
                    status: 'failed',
                    error: isConnectionExpired ? 'Session expired' : isBlocked ? 'Prompt blocked by safety filter' : (msg || 'Unknown error')
                } : item
            ));

            if (isConnectionExpired) {
                setToken('');
                localStorage.removeItem('pixora_token');
                toast.error('Session Expired', {
                    description: 'Please re-sync your engine connection.',
                    action: { label: 'Re-sync', onClick: syncConnection }
                });
                isProcessingRef.current = false;
                setIsProcessing(false);
                return;
            }

            if (isBlocked) {
                toast.warning('Prompt Blocked', { description: 'Your prompt contains restricted content.' });
            }

        } finally {
            isProcessingRef.current = false;
            setIsProcessing(false);
        }
    }, [aspectRatio, user, queryClient]);

    // Watch queue and trigger processing — only on state changes
    const queueRef = useRef(queue);
    const tokenRef = useRef(token);
    queueRef.current = queue;
    tokenRef.current = token;

    useEffect(() => {
        const hasPending = queue.some(i => i.status === 'pending');
        if (hasPending && !isProcessingRef.current) {
            // Slight delay to batch rapid state changes
            const timer = setTimeout(() => {
                processQueue(queueRef.current, tokenRef.current);
            }, 200);
            return () => clearTimeout(timer);
        }
    }, [queue, processQueue]);

    const retryItem = (id: string) => {
        setQueue(prev => prev.map(i => i.id === id ? { ...i, status: 'pending', error: undefined } : i));
    };

    const clearCompleted = () => {
        setQueue(prev => prev.filter(i => i.status !== 'completed' && i.status !== 'failed'));
    };

    if (authLoading || !user) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                        <Sparkles className="h-10 w-10 text-primary animate-pulse" />
                    </div>
                    <p className="text-sm text-muted-foreground font-medium">Loading Pixora Studio...</p>
                </div>
            </div>
        );
    }

    const pendingCount = queue.filter(i => i.status === 'pending').length;
    const activeCount = queue.filter(i => i.status === 'generating' || i.status === 'saving').length;
    const completedCount = queue.filter(i => i.status === 'completed').length;
    const failedCount = queue.filter(i => i.status === 'failed').length;

    return (
        <SidebarProvider>
            <div className="flex min-h-screen bg-background text-foreground w-full">
                <Sidebar className="border-r">
                    <SidebarHeader className="border-b p-4">
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-primary" />
                            <span className="text-lg font-bold tracking-tight">Pixora Studio</span>
                        </div>
                    </SidebarHeader>
                    <SidebarContent>
                        <SidebarGroup>
                            <SidebarGroupLabel className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Navigation</SidebarGroupLabel>
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton asChild isActive>
                                            <Link href="/dashboard" className="flex items-center py-2.5">
                                                <LayoutDashboard className="h-4 w-4 mr-3" />
                                                <span className="font-medium">Creative Studio</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton asChild>
                                            <Link href="/inspire" className="flex items-center py-2.5">
                                                <Lightbulb className="h-4 w-4 mr-3" />
                                                <span className="font-medium">Community Feed</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton asChild>
                                            <Link href="/profile" className="flex items-center py-2.5">
                                                <User className="h-4 w-4 mr-3" />
                                                <span className="font-medium">My Gallery</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>

                        <div className="mt-auto px-4 pb-6 space-y-6">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between px-1">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">Engine Health</label>
                                    {token && <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />}
                                </div>
                                {!token ? (
                                    <Button variant="destructive" className="w-full justify-start h-10 shadow-sm" onClick={syncConnection}>
                                        <XCircle className="h-4 w-4 mr-2" />
                                        <span className="font-semibold">Not Connected</span>
                                    </Button>
                                ) : (
                                    <Button variant="secondary" className="w-full justify-start h-10 border border-emerald-500/20 text-emerald-600 bg-emerald-50/50 hover:bg-emerald-100/50" onClick={syncConnection}>
                                        <CheckCircle2 className="h-4 w-4 mr-2" />
                                        <span className="font-semibold">Engine Synced ✦</span>
                                    </Button>
                                )}
                                {!token && (
                                    <div className="space-y-2">
                                        <p className="text-[9px] text-muted-foreground leading-relaxed px-1">
                                            Click the <strong className="text-foreground/70">Pixora Sync</strong> extension in your toolbar to auto-connect.
                                        </p>
                                        <a href="/extension.zip" download className="flex items-center gap-1.5 w-full px-3 py-2 rounded-lg bg-primary/10 border border-primary/20 hover:bg-primary/15 transition-colors text-primary text-[11px] font-semibold">
                                            <Download className="h-3 w-3 shrink-0" />
                                            Download Extension
                                        </a>
                                    </div>
                                )}
                            </div>

                            <div className="pt-4 border-t border-border/50">
                                <div className="flex justify-between text-[11px] font-bold text-muted-foreground/80 uppercase tracking-widest mb-2 px-1">
                                    <span>Daily Quota</span>
                                    <span>{dailyCount}/50</span>
                                </div>
                                <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                                    <div
                                        className="h-full bg-primary transition-all duration-700"
                                        style={{ width: `${Math.min((dailyCount / 50) * 100, 100)}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </SidebarContent>
                    <SidebarFooter className="border-t p-4 bg-muted/20">
                        <div className="flex items-center gap-3 px-1">
                            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">
                                {user.name.charAt(0)}
                            </div>
                            <div className="flex flex-col truncate flex-1">
                                <span className="text-sm font-bold truncate leading-tight">{user.name}</span>
                                <span className="text-[10px] text-muted-foreground truncate opacity-70">{user.email}</span>
                            </div>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={logout}>
                                <LogOut className="h-4 w-4" />
                            </Button>
                        </div>
                    </SidebarFooter>
                </Sidebar>

                <SidebarInset className="flex flex-col">
                    <header className="flex h-14 items-center gap-4 border-b px-6">
                        <SidebarTrigger className="lg:hidden" />
                        <div className="flex-1 flex items-center gap-3">
                            <h1 className="text-lg font-semibold tracking-tight">Creative Studio</h1>
                            {isProcessing && (
                                <Badge variant="secondary" className="gap-1.5 text-[10px] animate-pulse">
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                    Generating...
                                </Badge>
                            )}
                        </div>
                        {queue.length > 0 && (
                            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                                {pendingCount > 0 && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{pendingCount} pending</span>}
                                {completedCount > 0 && <span className="flex items-center gap-1 text-emerald-600"><CheckCircle2 className="h-3 w-3" />{completedCount} done</span>}
                                {failedCount > 0 && <span className="flex items-center gap-1 text-destructive"><XCircle className="h-3 w-3" />{failedCount} failed</span>}
                            </div>
                        )}
                    </header>

                    <main className="flex-1 p-6 md:p-8 overflow-y-auto">
                        <div className="mx-auto max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8">

                            {/* Extension Install Banner — shown when not connected */}
                            {!token && (
                                <div className="lg:col-span-12">
                                    <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-[#1a0533]/80 via-[#0d0d2e]/80 to-[#07071a]/90 p-6">
                                        {/* Glow */}
                                        <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-primary/20 blur-3xl" />
                                        <div className="pointer-events-none absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-pink-500/10 blur-2xl" />

                                        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6">
                                            {/* Icon */}
                                            <div className="shrink-0 h-14 w-14 rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center">
                                                <Puzzle className="h-7 w-7 text-primary" />
                                            </div>

                                            {/* Text */}
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                                                    Install the Pixora Sync Extension
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary">Required</span>
                                                </h3>
                                                <p className="mt-1 text-[12px] text-muted-foreground leading-relaxed">
                                                    The extension automatically syncs your session to Pixora — one click, zero copy-paste.
                                                </p>

                                                {/* Steps */}
                                                <ol className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
                                                    {[
                                                        { n: '1', label: 'Download the extension ZIP' },
                                                        { n: '2', label: 'Go to chrome://extensions → enable Developer Mode' },
                                                        { n: '3', label: 'Click Load Unpacked → select the extracted folder' },
                                                        { n: '4', label: 'Click the ✦ Pixora icon in your toolbar → Sync to Pixora' },
                                                    ].map(step => (
                                                        <li key={step.n} className="flex items-start gap-2 text-[11px] text-muted-foreground">
                                                            <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/20 text-[9px] font-bold text-primary">{step.n}</span>
                                                            {step.label}
                                                        </li>
                                                    ))}
                                                </ol>
                                            </div>

                                            {/* CTA */}
                                            <div className="shrink-0 flex flex-col gap-2 w-full sm:w-auto">
                                                <a
                                                    href="/extension.zip"
                                                    download
                                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-purple-900/30 hover:from-violet-500 hover:to-purple-500 hover:-translate-y-0.5 transition-all duration-200"
                                                >
                                                    <Download className="h-4 w-4" />
                                                    Download Extension
                                                </a>
                                                <a
                                                    href="chrome://extensions"
                                                    target="_blank"
                                                    className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border px-5 py-2.5 text-sm font-semibold text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all duration-200"
                                                >
                                                    Open Extensions
                                                    <ArrowRight className="h-3.5 w-3.5" />
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Studio Panel */}
                            <div className="lg:col-span-8 space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Sparkles className="h-4 w-4 text-primary" />
                                            Creative Prompt
                                        </CardTitle>
                                        <CardDescription>One prompt per line for bulk generation.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-5">
                                        <Textarea
                                            placeholder="An oil painting of a futuristic city at sunrise&#10;A cozy cabin in the woods during snowstorm..."
                                            value={promptsText}
                                            onChange={(e) => setPromptsText(e.target.value)}
                                            className="min-h-[200px] resize-none font-mono text-sm"
                                        />

                                        {/* Style Selector */}
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                                <Paintbrush className="h-3 w-3" /> Visual Style
                                            </label>
                                            <div className="grid grid-cols-4 gap-2">
                                                {Object.entries(STYLE_PRESETS).map(([key, preset]) => (
                                                    <button
                                                        key={key}
                                                        onClick={() => setStylePreset(key)}
                                                        className={`flex flex-col items-center gap-1 rounded-lg border p-2.5 text-center transition-all hover:border-primary/50 ${stylePreset === key ? 'border-primary bg-primary/5 shadow-sm' : 'border-border'}`}
                                                    >
                                                        <span className="text-base">{preset.icon}</span>
                                                        <span className="text-[9px] font-bold leading-none text-muted-foreground uppercase tracking-wide">{preset.label}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-end gap-4 pt-2 border-t">
                                            <div className="grid gap-1.5">
                                                <label className="text-[11px] font-semibold text-muted-foreground uppercase">Aspect Ratio</label>
                                                <Select value={aspectRatio} onValueChange={setAspectRatio}>
                                                    <SelectTrigger className="w-[160px]">
                                                        <SelectValue placeholder="Ratio" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="IMAGE_ASPECT_RATIO_SQUARE">Square 1:1</SelectItem>
                                                        <SelectItem value="IMAGE_ASPECT_RATIO_LANDSCAPE">Landscape 16:9</SelectItem>
                                                        <SelectItem value="IMAGE_ASPECT_RATIO_PORTRAIT">Portrait 9:16</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="grid gap-1.5">
                                                <label className="text-[11px] font-semibold text-muted-foreground uppercase">Batch</label>
                                                <Select value={batchCount} onValueChange={setBatchCount}>
                                                    <SelectTrigger className="w-[90px]">
                                                        <SelectValue placeholder="Count" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="1">× 1</SelectItem>
                                                        <SelectItem value="2">× 2</SelectItem>
                                                        <SelectItem value="4">× 4</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="flex-1 flex justify-end">
                                                <Button
                                                    disabled={!promptsText.trim()}
                                                    onClick={startBulkGeneration}
                                                    size="lg"
                                                    className="gap-2 font-semibold"
                                                >
                                                    <Zap className="h-4 w-4" />
                                                    Generate
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Generation Queue */}
                                {queue.length > 0 && (
                                    <Card>
                                        <CardHeader className="py-3 px-5 border-b flex flex-row items-center justify-between">
                                            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Generation Queue</CardTitle>
                                            <Button variant="ghost" size="sm" className="h-7 text-[11px] text-muted-foreground hover:text-foreground" onClick={clearCompleted}>
                                                Clear done
                                            </Button>
                                        </CardHeader>
                                        <CardContent className="p-0">
                                            <div className="divide-y max-h-[400px] overflow-y-auto">
                                                {queue.map(item => (
                                                    <QueueRow
                                                        key={item.id}
                                                        item={item}
                                                        onRetry={() => retryItem(item.id)}
                                                        bucketId={PIXORA_BUCKET_ID}
                                                        projectId={process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || ''}
                                                        endpoint={process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || ''}
                                                    />
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>

                            {/* Right panel: Recent Output */}
                            <div className="lg:col-span-4 space-y-6">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Recent Output</h2>
                                        <Link href="/profile" className="text-xs font-semibold hover:underline text-primary">View All →</Link>
                                    </div>

                                    {gensLoading ? (
                                        <div className="grid gap-3">
                                            {[1, 2, 3].map(i => (
                                                <div key={i} className="aspect-square rounded-xl bg-muted animate-pulse" />
                                            ))}
                                        </div>
                                    ) : generations && generations.length > 0 ? (
                                        <div className="grid gap-3">
                                            {generations.slice(0, 4).map((gen: any) => (
                                                <div key={gen.$id} className="group relative aspect-square rounded-xl overflow-hidden border bg-muted">
                                                    <img
                                                        src={`${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${PIXORA_BUCKET_ID}/files/${gen.image_id}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`}
                                                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                                        alt={gen.prompt}
                                                    />
                                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                                                        <p className="text-white text-[10px] line-clamp-2 italic leading-relaxed">"{gen.prompt}"</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed rounded-xl opacity-30">
                                            <ImageIcon className="h-6 w-6 mb-2" />
                                            <p className="text-[10px] font-bold uppercase">No generations yet</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </main>
                </SidebarInset>
            </div>
        </SidebarProvider>
    );
}

function QueueRow({ item, onRetry, bucketId, projectId, endpoint }: {
    item: QueueItem;
    onRetry: () => void;
    bucketId: string;
    projectId: string;
    endpoint: string;
}) {
    const imageUrl = item.imageId
        ? `${endpoint}/storage/buckets/${bucketId}/files/${item.imageId}/view?project=${projectId}`
        : null;

    return (
        <div className={`flex items-center gap-3 px-5 py-3.5 transition-colors ${item.status === 'completed' ? 'bg-emerald-50/30 dark:bg-emerald-950/20' : item.status === 'failed' ? 'bg-destructive/5' : ''}`}>
            {/* Status Icon */}
            <div className="shrink-0 w-8 h-8">
                {item.status === 'completed' && imageUrl ? (
                    <img src={imageUrl} className="w-8 h-8 rounded-md object-cover border" alt="" />
                ) : item.status === 'generating' ? (
                    <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    </div>
                ) : item.status === 'saving' ? (
                    <div className="w-8 h-8 rounded-md bg-blue-500/10 flex items-center justify-center">
                        <div className="h-3 w-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : item.status === 'failed' ? (
                    <div className="w-8 h-8 rounded-md bg-destructive/10 flex items-center justify-center">
                        <XCircle className="h-4 w-4 text-destructive" />
                    </div>
                ) : (
                    <div className="w-8 h-8 rounded-md bg-secondary flex items-center justify-center">
                        <div className="h-3 w-3 rounded-full border-2 border-muted-foreground/30" />
                    </div>
                )}
            </div>

            {/* Text */}
            <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{item.prompt}</p>
                {item.status === 'completed' && (
                    <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
                        <CheckCircle2 className="h-3 w-3" /> Generated
                    </p>
                )}
                {item.status === 'generating' && (
                    <p className="text-[10px] text-primary font-semibold mt-0.5 animate-pulse">Generating image...</p>
                )}
                {item.status === 'saving' && (
                    <p className="text-[10px] text-blue-600 font-semibold mt-0.5">Saving to archive...</p>
                )}
                {item.status === 'pending' && (
                    <p className="text-[10px] text-muted-foreground mt-0.5">Queued</p>
                )}
                {item.status === 'failed' && (
                    <p className="text-[10px] text-destructive mt-0.5 truncate">{item.error || 'Generation failed'}</p>
                )}
            </div>

            {/* Retry Button (only on failed) */}
            {item.status === 'failed' && (
                <Button size="sm" variant="outline" className="h-7 text-[11px] gap-1 shrink-0" onClick={onRetry}>
                    <RotateCw className="h-3 w-3" />
                    Retry
                </Button>
            )}
        </div>
    );
}
