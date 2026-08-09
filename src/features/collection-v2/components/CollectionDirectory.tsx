"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { BookOpen, FileText, FolderPlus, Globe2, Layers3, Loader2, Lock, Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { createCollection, fetchMyCollections, fetchPublicCollections } from "@/features/collection-v2/api/collections";
import type { CollectionEntry, CollectionType, CollectionVisibility } from "@/types/collection";

export function CollectionDirectory() {
    const { toast } = useToast();
    const { data: session, status } = useSession();
    const params = useParams();
    const profileUsername = String(params.username ?? "");
    const isOwner = status === "authenticated" && session?.user?.username === profileUsername;
    const [collections, setCollections] = useState<CollectionEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [collectionType, setCollectionType] = useState<CollectionType>("TOPIC");
    const [visibility, setVisibility] = useState<CollectionVisibility>("private");

    useEffect(() => {
        if (status !== "authenticated") return;
        setIsLoading(true);
        const request = isOwner ? fetchMyCollections() : fetchPublicCollections(profileUsername);
        request
            .then((payload) => setCollections(payload.collections))
            .catch((error: Error) => toast({ title: "Could not load collections", description: error.message, variant: "destructive" }))
            .finally(() => setIsLoading(false));
    }, [isOwner, profileUsername, status, toast]);

    const counts = useMemo(() => ({
        topics: collections.filter((collection) => collection.collectionType === "TOPIC").length,
        blogs: collections.filter((collection) => collection.collectionType === "BLOG").length,
    }), [collections]);

    const handleCreate = async () => {
        if (!name.trim()) return;
        try {
            setIsSaving(true);
            const payload = await createCollection({ name: name.trim(), description: description.trim(), collectionType, visibility });
            setCollections((current) => [payload.collection, ...current]);
            setIsOpen(false);
            setName("");
            setDescription("");
            setCollectionType("TOPIC");
            setVisibility("private");
        } catch (error) {
            toast({ title: "Could not create collection", description: error instanceof Error ? error.message : "Try again", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <section className="overflow-hidden rounded-2xl border border-border/70 bg-card/65 p-6 backdrop-blur sm:p-8">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h2 className="mt-1 text-3xl font-semibold tracking-tight text-emerald-300">Collections workspace</h2>
                        <p className="max-w-xl text-sm leading-6 text-muted-foreground">Focused sets of topic sheets or technical blogs, kept separate and easy to share.</p>
                    </div>
                    {isOwner && <Button variant='secondary' className="h-11 gap-2" onClick={() => setIsOpen(true)}><Plus className="h-4 w-4" />New collection</Button>}
                </div>
            </section>

            {isLoading ? (
                <div className="flex min-h-64 items-center justify-center"><Loader2 className="h-7 w-7 animate-spin text-muted-foreground" /></div>
            ) : collections.length === 0 ? (
                <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/35 text-center">
                    <FolderPlus className="h-8 w-8 text-muted-foreground" />
                    <h3 className="mt-4 font-semibold">No collections yet</h3>
                    <p className="mt-2 text-sm text-muted-foreground">Create a topic or blog collection to begin.</p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-3">
                    {collections.map((collection) => {
                        const isTopic = collection.collectionType === "TOPIC";
                        return (
                            <Link key={collection._id} href={`/collections/${collection._id}`} className="group rounded-2xl border border-border/70 bg-card/55 p-5 transition hover:-translate-y-0.5 hover:border-emerald-500/35 hover:bg-card">
                                <div className="flex items-start justify-start gap-2">
                                    <Badge variant="default" className="font-mono px-2 py-1">{collection.collectionType}</Badge>
                                    <Badge variant="secondary" className="capitalize flex items-center px-2 py-1">{collection.visibility === "public" ? <Globe2 className="h-4 w-4" /> : <Lock className="h-4 w-4" />}</Badge>
                                </div>
                                
                                <div>
                                    <h3 className="mt-4 text-xl font-semibold tracking-tight transition group-hover:text-emerald-600 dark:group-hover:text-emerald-300">{collection.name}</h3>
                                    <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-muted-foreground">{collection.description || "No description added."}</p>
                                    <div className="mt-6 flex items-center gap-2 border-t border-border/60 pt-4 text-xs text-muted-foreground"><Layers3 className="h-3.5 w-3.5" />{collection.itemCount} {isTopic ? "topic" : "blog"}{collection.itemCount === 1 ? "" : "s"}</div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Create collection</DialogTitle><DialogDescription>Choose the content type now. It cannot be changed later.</DialogDescription></DialogHeader>
                    <div className="space-y-4">
                        <Input placeholder="Collection name" value={name} onChange={(event) => setName(event.target.value)} />
                        <Textarea placeholder="What is this collection for?" value={description} onChange={(event) => setDescription(event.target.value)} />
                        <div className="grid gap-3 sm:grid-cols-2">
                            <Select value={collectionType} onValueChange={(value: CollectionType) => setCollectionType(value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="TOPIC">Sheets</SelectItem><SelectItem value="BLOG">Blogs</SelectItem></SelectContent></Select>
                            <Select value={visibility} onValueChange={(value: CollectionVisibility) => setVisibility(value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="private">Private</SelectItem><SelectItem value="public">Public</SelectItem></SelectContent></Select>
                        </div>
                    </div>
                    <DialogFooter><Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button><Button disabled={!name.trim() || isSaving} onClick={handleCreate}>{isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Create</Button></DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
