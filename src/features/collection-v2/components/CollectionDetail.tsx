"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
    ArrowLeft,
    BookOpen,
    CircleX,
    ExternalLink,
    FileText,
    Globe2,
    Layers3,
    Loader2,
    Lock,
    Pencil,
    Plus,
    Trash2,
    Unlink,
} from "lucide-react";

import InsertNavbar from "@/components/InsertNavbar";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { CollectionTopicProblemsGrid } from "@/features/collection-v2/components/CollectionTopicProblemsGrid";
import { EditCollectionProblemDialog } from "@/features/collection-v2/components/EditCollectionProblemDialog";
import type { TopicProblemGridRow } from "@/features/topic/components/TopicProblemsGrid";
import {
    addCollectionItems,
    deleteCollection,
    fetchCollection,
    fetchPublicCollection,
    removeCollectionItems,
    updateCollectionMetadata,
} from "@/features/collection-v2/api/collections";
import type { BlogEntry } from "@/types/blog";
import type { CollectionEntry, CollectionItem, CollectionTopicItem, CollectionVisibility } from "@/types/collection";

type Candidate = { id: string; label: string; visibility: string };

const isTopicItem = (item: CollectionItem): item is CollectionTopicItem => "title" in item && "problems" in item;
const getItemId = (item: CollectionItem) => isTopicItem(item) ? item.id : String(item._id ?? item.id ?? "");

export function CollectionDetail({ collectionId, publicView = false }: { collectionId: string; publicView?: boolean }) {
    const router = useRouter();
    const { toast } = useToast();
    const [collection, setCollection] = useState<CollectionEntry | null>(null);
    const [items, setItems] = useState<CollectionItem[]>([]);
    const [isOwner, setIsOwner] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isMutating, setIsMutating] = useState(false);
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [candidateId, setCandidateId] = useState("");
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [visibility, setVisibility] = useState<CollectionVisibility>("private");
    const [editingProblem, setEditingProblem] = useState<{ topicId: string; problem: TopicProblemGridRow } | null>(null);

    const loadCollection = useCallback(async () => {
        try {
            const payload = await (publicView ? fetchPublicCollection(collectionId) : fetchCollection(collectionId));
            setCollection(payload.collection);
            setItems(payload.items);
            setIsOwner(payload.isOwner);
        } catch (error) {
            toast({ title: "Collection unavailable", description: error instanceof Error ? error.message : "Try again", variant: "destructive" });
            router.replace("/404");
        } finally {
            setIsLoading(false);
        }
    }, [collectionId, publicView, router, toast]);

    useEffect(() => { void loadCollection(); }, [loadCollection]);

    useEffect(() => {
        if (!collection || !isOwner) return;
        const url = collection.collectionType === "TOPIC"
            ? `/api/users/${encodeURIComponent(collection.ownerUsername)}/topics?limit=50`
            : `/api/users/${encodeURIComponent(collection.ownerUsername)}/blogs?limit=50`;
        fetch(url)
            .then((response) => response.json())
            .then((payload) => {
                const source = collection.collectionType === "TOPIC" ? payload.topics ?? [] : payload.blogs ?? [];
                const mapped: Candidate[] = source
                    .filter((item: Record<string, unknown>) => collection.collectionType === "TOPIC"
                        ? item.creator_username === collection.ownerUsername
                        : item.creator === collection.ownerUsername)
                    .map((item: Record<string, unknown>) => collection.collectionType === "TOPIC"
                        ? { id: String(item.id), label: String(item.title), visibility: String(item.visibility) }
                        : { id: String(item._id), label: String(item.blogTitle), visibility: String(item.type) });
                setCandidates(mapped);
            })
            .catch(() => setCandidates([]));
    }, [collection, isOwner]);

    const availableCandidates = useMemo(() => {
        const included = new Set(collection?.itemIds ?? []);
        return candidates.filter((candidate) => !included.has(candidate.id) && (collection?.visibility !== "public" || candidate.visibility === "public"));
    }, [candidates, collection]);

    useEffect(() => {
        if (!availableCandidates.some((candidate) => candidate.id === candidateId)) setCandidateId(availableCandidates[0]?.id ?? "");
    }, [availableCandidates, candidateId]);

    const openEdit = () => {
        if (!collection) return;
        setName(collection.name);
        setDescription(collection.description);
        setVisibility(collection.visibility);
        setIsEditOpen(true);
    };

    const saveMetadata = async () => {
        if (!collection || !name.trim()) return;
        try {
            setIsMutating(true);
            const payload = await updateCollectionMetadata(collection._id, { name: name.trim(), description: description.trim(), visibility });
            setCollection(payload.collection);
            setIsEditOpen(false);
        } catch (error) {
            toast({ title: "Could not update collection", description: error instanceof Error ? error.message : "Try again", variant: "destructive" });
        } finally { setIsMutating(false); }
    };

    const addItem = async () => {
        if (!collection || !candidateId) return;
        try {
            setIsMutating(true);
            await addCollectionItems(collection._id, [candidateId]);
            setCandidateId("");
            await loadCollection();
        } catch (error) {
            toast({ title: "Could not add item", description: error instanceof Error ? error.message : "Try again", variant: "destructive" });
        } finally { setIsMutating(false); }
    };

    const removeItem = async (itemId: string) => {
        if (!collection) return;
        try {
            setIsMutating(true);
            await removeCollectionItems(collection._id, [itemId]);
            await loadCollection();
        } catch (error) {
            toast({ title: "Could not remove item", description: error instanceof Error ? error.message : "Try again", variant: "destructive" });
        } finally { setIsMutating(false); }
    };

    const confirmDelete = async () => {
        if (!collection) return;
        try {
            setIsMutating(true);
            await deleteCollection(collection._id);
            router.push(`/u/${collection.ownerUsername}?tab=collections`);
        } catch (error) {
            toast({ title: "Could not delete collection", description: error instanceof Error ? error.message : "Try again", variant: "destructive" });
            setIsMutating(false);
        }
    };

    if (isLoading || !collection) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
    const isTopicCollection = collection.collectionType === "TOPIC";
    const canManage = isOwner && !publicView;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#020817]">
            <div className="mx-auto max-w-[1440px] space-y-2 px-4 py-6 sm:px-8 lg:px-12 lg:py-9">
                <InsertNavbar />
                <Link href={publicView ? "/posts/collections" : `/u/${collection.ownerUsername}?tab=collections`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" />{publicView ? "Explore collections" : "All collections"}</Link>

                <header className="rounded-2xl border border-border/70 bg-card/60 p-6 backdrop-blur sm:p-8">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                        <div className="max-w-3xl">
                            <div className="flex flex-wrap gap-2">
                                <Badge variant="default" className="font-mono text-[10px]">{collection.collectionType}</Badge>
                                <Badge variant="destructive" className="gap-1 capitalize">{collection.visibility === "public" ? <Globe2 className="h-3 w-3" /> : <Lock className="h-3 w-3" />}{collection.visibility}</Badge>
                                <Badge variant="secondary" className="gap-1"><Layers3 className="h-3 w-3" />{items.length} {isTopicCollection ? "sheets" : "blogs"}</Badge>
                            </div>
                            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-3xl">{collection.name}</h1>
                            <p className="mt-2 text-sm text-muted-foreground">{collection.description || "No description added for this collection."}</p>
                        </div>
                        {canManage && <div className="flex gap-2"><Button variant="outline" className="gap-2" onClick={openEdit}><Pencil className="h-4 w-4" /></Button><Button variant="destructive" size="icon" onClick={() => setIsDeleteOpen(true)}><Trash2 className="h-4 w-4" /></Button></div>}
                    </div>
                </header>

                {canManage && (
                    <section className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-card/45 p-5 sm:flex-row sm:items-center">
                        <div className="mr-auto"><h2 className="font-semibold">Add an existing {isTopicCollection ? "topic sheet" : "blog"}</h2><p className="mt-1 text-sm text-muted-foreground">Only your own compatible items can be added.</p></div>
                        <Select value={candidateId} onValueChange={setCandidateId}><SelectTrigger className="sm:w-80"><SelectValue placeholder={`No ${isTopicCollection ? "topics" : "blogs"} available`} /></SelectTrigger><SelectContent>{availableCandidates.map((candidate) => <SelectItem key={candidate.id} value={candidate.id}>{candidate.label}</SelectItem>)}</SelectContent></Select>
                        <Button className="gap-2" disabled={!candidateId || isMutating} onClick={addItem}>{isMutating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}Add</Button>
                    </section>
                )}

                <main>
                    {items.length === 0 ? (
                        <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/30 text-center">
                            {isTopicCollection ? <BookOpen className="h-8 w-8 text-muted-foreground" /> : <FileText className="h-8 w-8 text-muted-foreground" />}
                            <h2 className="mt-4 font-semibold">This collection is empty</h2>
                            <p className="mt-2 text-sm text-muted-foreground">{isOwner ? "Add an existing item above." : "The curator has not added anything yet."}</p>
                        </div>
                    ) : (
                        <Accordion type="multiple" defaultValue={[getItemId(items[0])]} className="space-y-3">
                            {items.map((item) => {
                                const itemId = getItemId(item);
                                const title = isTopicItem(item) ? item.title : (item as BlogEntry).blogTitle;
                                return (
                                    <AccordionItem key={itemId} value={itemId} className="overflow-hidden rounded-2xl border border-border/70 bg-card/55 px-5 data-[state=open]:bg-card">
                                        <AccordionTrigger className="gap-4 py-5 px-5 text-left hover:no-underline">
                                            <div className="flex flex-1 items-center gap-4"><span className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${isTopicCollection ? "bg-emerald-500/10 text-emerald-500" : "bg-cyan-500/10 text-cyan-500"}`}>{isTopicCollection ? <BookOpen className="h-4 w-4" /> : <FileText className="h-4 w-4" />}</span><div><p className="font-semibold">{title}</p><p className="mt-1 text-xs font-normal text-muted-foreground">{isTopicItem(item) ? `${item.problems.length} problems` : "Open blog summary"}</p></div></div>
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            {isTopicItem(item) ? (
                                                item.problems.length ? <CollectionTopicProblemsGrid problems={item.problems} canEdit={canManage} onEdit={(problem) => setEditingProblem({ topicId: item.id, problem })} /> : <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">No problems in this topic yet.</p>
                                            ) : (
                                                <div className="flex flex-col gap-4 rounded-xl border border-border/70 p-5 sm:flex-row sm:items-center sm:justify-between"><p className="line-clamp-3 max-w-3xl text-sm leading-6 text-muted-foreground">{String((item as BlogEntry).blogContentText || "No content preview available.")}</p><Button asChild variant="outline"><Link href={`${canManage ? "/blog" : "/posts/blog"}/${(item as BlogEntry).blogUrl}`}>Open blog<ExternalLink className="ml-2 h-4 w-4" /></Link></Button></div>
                                            )}
                                            {canManage && <div className="mt-4 flex justify-end"><Button variant="default" className="gap-2 text-destructive hover:text-destructive" disabled={isMutating} onClick={() => removeItem(itemId)}><CircleX className="h-4 w-4" />Remove</Button></div>}
                                        </AccordionContent>
                                    </AccordionItem>
                                );
                            })}
                        </Accordion>
                    )}
                </main>
            </div>

            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}><DialogContent><DialogHeader><DialogTitle>Edit collection metadata</DialogTitle><DialogDescription>The collection type stays fixed.</DialogDescription></DialogHeader><div className="space-y-4"><Input value={name} onChange={(event) => setName(event.target.value)} /><Textarea value={description} onChange={(event) => setDescription(event.target.value)} /><Select value={visibility} onValueChange={(value: CollectionVisibility) => setVisibility(value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="private">Private</SelectItem><SelectItem value="public">Public</SelectItem></SelectContent></Select></div><DialogFooter><Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button><Button disabled={!name.trim() || isMutating} onClick={saveMetadata}>{isMutating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Save changes</Button></DialogFooter></DialogContent></Dialog>
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}><DialogContent><DialogHeader><DialogTitle>Delete collection?</DialogTitle><DialogDescription>This removes only the collection. Its topics or blogs will not be deleted.</DialogDescription></DialogHeader><DialogFooter><Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button><Button variant="destructive" disabled={isMutating} onClick={confirmDelete}>{isMutating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Delete</Button></DialogFooter></DialogContent></Dialog>
            <EditCollectionProblemDialog
                topicId={editingProblem?.topicId ?? ""}
                problem={editingProblem?.problem ?? null}
                open={Boolean(editingProblem)}
                onOpenChange={(open) => { if (!open) setEditingProblem(null); }}
                onSaved={loadCollection}
            />
        </div>
    );
}
