"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import type { TopicProblemGridRow } from "@/features/topic/components/TopicProblemsGrid";
import { questionSchema } from "@/schemas/topicSchema";
import type { ProblemDifficulty } from "@/types/topic";

const difficulties: ProblemDifficulty[] = ["Easy", "Easy-Med", "Medium", "Med-Hard", "Hard", "Advanced"];

type EditCollectionProblemDialogProps = {
    topicId: string;
    problem: TopicProblemGridRow | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSaved: () => Promise<void> | void;
};

export function EditCollectionProblemDialog({
    topicId,
    problem,
    open,
    onOpenChange,
    onSaved,
}: EditCollectionProblemDialogProps) {
    const { toast } = useToast();
    const [qname, setQname] = useState("");
    const [url, setUrl] = useState("");
    const [difficulty, setDifficulty] = useState<ProblemDifficulty>("Easy");
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!problem) return;
        setQname(problem.qname);
        setUrl(problem.url);
        setDifficulty(problem.difficulty);
    }, [problem]);

    const handleSave = async () => {
        if (!problem) return;
        const parsed = questionSchema.safeParse({ qname, url, difficulty });
        if (!parsed.success) {
            toast({ title: "Check the problem details", description: parsed.error.issues[0]?.message, variant: "destructive" });
            return;
        }

        try {
            setIsSaving(true);
            const response = await fetch(`/api/topics/${encodeURIComponent(topicId)}/problems/${encodeURIComponent(problem._id)}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(parsed.data),
            });
            const payload = await response.json();
            if (!response.ok) throw new Error(payload.message || "Problem update failed");
            await onSaved();
            onOpenChange(false);
            toast({ title: "Problem updated", description: "The collection sheet now shows the latest details." });
        } catch (error) {
            toast({ title: "Could not update problem", description: error instanceof Error ? error.message : "Try again", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit problem</DialogTitle>
                    <DialogDescription>Update the existing topic problem without leaving this collection.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <Input value={qname} onChange={(event) => setQname(event.target.value)} placeholder="Problem name" />
                    <Input value={url} onChange={(event) => setUrl(event.target.value)} placeholder="Problem URL" />
                    <Select value={difficulty} onValueChange={(value: ProblemDifficulty) => setDifficulty(value)}>
                        <SelectTrigger><SelectValue placeholder="Difficulty" /></SelectTrigger>
                        <SelectContent>{difficulties.map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>Cancel</Button>
                    <Button onClick={handleSave} disabled={isSaving || !problem}>{isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Save changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
