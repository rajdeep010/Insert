"use client";

import type { ReactNode } from "react";

import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type TopicActionSheetProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	description?: string;
	children: ReactNode;
	className?: string;
};

export function TopicActionSheet({
	open,
	onOpenChange,
	title,
	description,
	children,
	className,
}: TopicActionSheetProps) {
	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent
				side="right"
				className={cn(
					"w-full overflow-y-auto border-border/60 bg-background/95 p-0 backdrop-blur sm:max-w-xl",
					className
				)}
			>
				<div className="flex h-full flex-col">
					<SheetHeader className="border-b border-border/60 px-6 py-5 text-left">
						<SheetTitle>{title}</SheetTitle>
						{description ? <SheetDescription>{description}</SheetDescription> : null}
					</SheetHeader>
					<div className="flex-1 px-6 py-5">{children}</div>
				</div>
			</SheetContent>
		</Sheet>
	);
}