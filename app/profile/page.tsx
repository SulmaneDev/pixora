'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
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
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    Sparkles,
    LogOut,
    LayoutDashboard,
    Lightbulb,
    User,
    Download,
    Maximize2,
    Copy,
    Loader2,
    Image as ImageIcon,
    Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { deleteGeneration } from '@/lib/whisk';
import { PIXORA_BUCKET_ID, PIXORA_DB_ID, GENERATIONS_COLLECTION_ID, databases } from '@/lib/appwrite';
import { Query } from 'appwrite';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export default function ProfilePage() {
    const { user, logout, loading: authLoading } = useAuth();
    const router = useRouter();
    const queryClient = useQueryClient();
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const { data: generations, isLoading } = useQuery({
        queryKey: ['my-generations', user?.$id],
        queryFn: async () => {
            const resp = await databases.listDocuments(PIXORA_DB_ID, GENERATIONS_COLLECTION_ID, [
                Query.equal('user_id', user?.$id || ''),
                Query.orderDesc('created_at'),
                Query.limit(50)
            ]);
            return resp.documents;
        },
        enabled: !!user,
    });

    const handleDelete = async (docId: string, imageId: string) => {
        try {
            await deleteGeneration(docId, imageId);
            toast.success('Generation deleted');
            queryClient.invalidateQueries({ queryKey: ['my-generations', user?.$id] });
            queryClient.invalidateQueries({ queryKey: ['generations', user?.$id] });
            queryClient.invalidateQueries({ queryKey: ['public-generations'] });
        } catch {
            toast.error('Failed to delete');
        } finally {
            setDeletingId(null);
        }
    };

    const downloadImage = async (imageId: string, prompt: string) => {
        try {
            const downloadUrl = `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${PIXORA_BUCKET_ID}/files/${imageId}/download?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`;
            const response = await fetch(downloadUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `pixora-${prompt.slice(0, 20)}.png`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            toast.success('Download started');
        } catch {
            toast.error('Download failed - trying direct link');
            window.open(`${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${PIXORA_BUCKET_ID}/files/${imageId}/download?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`, '_blank');
        }
    };

    if (authLoading || !user) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <Loader2 className="animate-spin text-muted-foreground" />
            </div>
        );
    }

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
                                        <SidebarMenuButton asChild>
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
                                        <SidebarMenuButton asChild isActive>
                                            <Link href="/profile" className="flex items-center py-2.5">
                                                <User className="h-4 w-4 mr-3" />
                                                <span className="font-medium">My Gallery</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
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
                        <div className="flex items-center gap-3 flex-1">
                            <User className="h-5 w-5 text-primary" />
                            <div>
                                <h1 className="text-lg font-semibold tracking-tight">My Gallery</h1>
                            </div>
                        </div>
                        <span className="text-sm text-muted-foreground">{generations?.length ?? 0} creations</span>
                    </header>

                    <main className="flex-1 p-6 md:p-8 overflow-y-auto">
                        <div className="max-w-6xl mx-auto">
                            {/* User Stats */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
                                <Card className="p-4">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Total Creations</p>
                                    <p className="text-2xl font-bold">{generations?.length ?? 0}</p>
                                </Card>
                                <Card className="p-4">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Member Since</p>
                                    <p className="text-sm font-bold">{new Date(user.$createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</p>
                                </Card>
                                <Card className="p-4 col-span-2 sm:col-span-1">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Account</p>
                                    <p className="text-sm font-bold truncate">{user.email}</p>
                                </Card>
                            </div>

                            {/* Gallery Grid */}
                            {isLoading ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {Array.from({ length: 8 }).map((_, i) => (
                                        <div key={i} className="aspect-square rounded-xl bg-muted animate-pulse" />
                                    ))}
                                </div>
                            ) : !generations || generations.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed rounded-2xl">
                                    <ImageIcon className="h-10 w-10 text-muted-foreground/30 mb-4" />
                                    <h3 className="text-base font-semibold text-muted-foreground">No creations yet</h3>
                                    <p className="text-sm text-muted-foreground/60 mt-1 mb-6">Head to Creative Studio to generate your first image.</p>
                                    <Button asChild>
                                        <Link href="/dashboard">Open Studio</Link>
                                    </Button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {generations.map((gen: any) => {
                                        const imageUrl = `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${PIXORA_BUCKET_ID}/files/${gen.image_id}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`;
                                        const isDeleting = deletingId === gen.$id;
                                        return (
                                            <AlertDialog key={gen.$id}>
                                                <div className="group relative aspect-square rounded-xl overflow-hidden border bg-muted cursor-pointer">
                                                    {isDeleting ? (
                                                        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
                                                            <Loader2 className="h-5 w-5 animate-spin text-destructive" />
                                                        </div>
                                                    ) : null}
                                                    <img
                                                        src={imageUrl}
                                                        alt={gen.prompt}
                                                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                                    />
                                                    {/* Hover overlay */}
                                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                                                        <div className="flex justify-end gap-1.5">
                                                            <AlertDialogTrigger asChild>
                                                                <Button
                                                                    size="icon"
                                                                    variant="secondary"
                                                                    className="h-7 w-7"
                                                                >
                                                                    <Maximize2 className="h-3.5 w-3.5" />
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialog>
                                                                <AlertDialogTrigger asChild>
                                                                    <Button size="icon" variant="destructive" className="h-7 w-7">
                                                                        <Trash2 className="h-3.5 w-3.5" />
                                                                    </Button>
                                                                </AlertDialogTrigger>
                                                                <AlertDialogContent>
                                                                    <AlertDialogHeader>
                                                                        <AlertDialogTitle>Delete this creation?</AlertDialogTitle>
                                                                        <AlertDialogDescription>
                                                                            This will permanently remove the image from your gallery and the community feed. This action cannot be undone.
                                                                        </AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                        <AlertDialogAction
                                                                            className="bg-destructive hover:bg-destructive/90"
                                                                            onClick={() => {
                                                                                setDeletingId(gen.$id);
                                                                                handleDelete(gen.$id, gen.image_id);
                                                                            }}
                                                                        >
                                                                            Delete
                                                                        </AlertDialogAction>
                                                                    </AlertDialogFooter>
                                                                </AlertDialogContent>
                                                            </AlertDialog>
                                                        </div>
                                                        <p className="text-white text-[10px] line-clamp-2 italic leading-relaxed">"{gen.prompt}"</p>
                                                    </div>
                                                </div>

                                                <AlertDialogContent className="max-w-[95vw] lg:max-w-[80vw] h-auto lg:h-[90vh] p-0 overflow-hidden bg-zinc-950 border-0 shadow-2xl ring-1 ring-white/10">
                                                    <div className="flex flex-col lg:flex-row h-full w-full relative">
                                                        <AlertDialogCancel className="absolute right-4 top-4 z-50 rounded-full h-10 w-10 p-0 border-0 bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all">
                                                            ✕
                                                        </AlertDialogCancel>

                                                        {/* Image Section */}
                                                        <div className="flex-[3] bg-black flex items-center justify-center p-4 min-h-[50vh] lg:min-h-0">
                                                            <img
                                                                src={imageUrl.replace('/view', '/download')}
                                                                alt={gen.prompt}
                                                                className="w-full h-full object-contain"
                                                                style={{ maxHeight: 'calc(90vh - 40px)' }}
                                                            />
                                                        </div>

                                                        {/* Sidebar section */}
                                                        <div className="flex-1 lg:max-w-xs border-t lg:border-t-0 lg:border-l border-white/10 flex flex-col bg-zinc-900/50">
                                                            <div className="p-6 lg:p-8 space-y-8 flex-1">
                                                                <section>
                                                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/80 mb-4">Neural Data</h3>
                                                                    <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 text-sm text-zinc-300 leading-relaxed italic">
                                                                        "{gen.prompt}"
                                                                    </div>
                                                                </section>

                                                                <div className="pt-6 space-y-4">
                                                                    <Button onClick={() => downloadImage(gen.image_id, gen.prompt)} className="w-full gap-3 h-14 font-black uppercase tracking-widest text-[11px] shadow-xl" variant="default">
                                                                        <Download className="h-4 w-4" />
                                                                        Download Master
                                                                    </Button>
                                                                    <Button onClick={() => {
                                                                        navigator.clipboard.writeText(gen.prompt);
                                                                        toast.success('Prompt copied');
                                                                    }} variant="outline" className="w-full border-white/10 text-white h-14 font-black uppercase tracking-widest text-[11px] bg-white/[0.03] hover:bg-white/[0.08]">
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
                                    })}
                                </div>
                            )}
                        </div>
                    </main>
                </SidebarInset>
            </div>
        </SidebarProvider>
    );
}
