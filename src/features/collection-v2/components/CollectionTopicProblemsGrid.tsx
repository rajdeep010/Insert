"use client";

import { TopicProblemsGrid, type TopicProblemGridRow } from "@/features/topic/components/TopicProblemsGrid";
import type { Question } from "@/types/topic";

type CollectionTopicProblemsGridProps = {
    problems: Question[];
    canEdit?: boolean;
    onEdit?: (problem: TopicProblemGridRow) => void;
};

export function CollectionTopicProblemsGrid({ problems, canEdit = false, onEdit }: CollectionTopicProblemsGridProps) {
    const rows: TopicProblemGridRow[] = problems.map((problem, index) => ({
        _id: String(problem._id ?? problem.id ?? `${problem.url}-${index}`),
        qname: problem.qname,
        url: problem.url,
        difficulty: problem.difficulty,
        blogReferences: problem.blogReferences?.map((reference) => ({
            _id: reference._id,
            blogId: reference.blogId,
            collectionId: reference.collectionId,
            kind: reference.kind,
            label: reference.label,
            blogTitle: reference.blogTitle,
            blogUrl: reference.blogUrl,
            collectionName: reference.collectionName,
        })),
    }));

    return (
        <TopicProblemsGrid
            problems={rows}
            canManageProblems={false}
            canEditProblems={canEdit}
            onEdit={onEdit}
        />
    );
}
