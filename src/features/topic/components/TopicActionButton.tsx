"use client";

import type { ReactNode } from "react";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type TopicActionButtonProps = {
	label: string;
	children: ReactNode;
};

export function TopicActionButton({ label, children }: TopicActionButtonProps) {
	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<span className="inline-flex">{children}</span>
			</TooltipTrigger>
			<TooltipContent>{label}</TooltipContent>
		</Tooltip>
	);
}