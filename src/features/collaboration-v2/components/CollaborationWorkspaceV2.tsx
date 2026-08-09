"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
	ArrowUpRight,
	Loader2,
	MailPlus,
	RefreshCw,
	Shield,
	Users,
	UserRoundPlus,
} from "lucide-react";
import { toast } from "sonner";
import InsertNavbar from "@/components/InsertNavbar";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useCollaborationV2 } from "@/features/collaboration-v2/context/CollaborationProviderV2";
import type {
	CollaborationInviteStatusV2,
	CollaborationRoleV2,
	CollaborationTopicCollaboratorV2,
} from "@/types/collaboration-v2";

const formatDate = (value?: string | null) => {
	if (!value) return "Recently";
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return "Recently";
	return new Intl.DateTimeFormat("en", {
		month: "short",
		day: "numeric",
		year: "numeric",
		hour: "numeric",
		minute: "2-digit",
	}).format(date);
};

const statusVariant: Record<CollaborationInviteStatusV2, "default" | "secondary" | "destructive" | "outline"> = {
	PENDING: "secondary",
	ACCEPTED: "default",
	DECLINED: "destructive",
	REVOKED: "outline",
};

const roleVariant = (role: CollaborationRoleV2) =>
	role === "OWNER" ? "default" : role === "EDITOR" ? "secondary" : "outline";

function ManagementGate({
	enabled,
	children,
}: {
	enabled: boolean;
	children: React.ReactNode;
}) {
	if (enabled) return <>{children}</>;
	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<span className="inline-flex">{children}</span>
			</TooltipTrigger>
			<TooltipContent>You need editor access to manage collaborators.</TooltipContent>
		</Tooltip>
	);
}

export default function CollaborationWorkspaceV2() {
	const {
		myCollaborations,
		pendingInvites,
		sentInvites,
		topicOptions,
		selectedTopicId,
		topicCollaborators,
		currentTopicRole,
		isInitialLoading,
		isTopicLoading,
		error,
		refreshCollaborationV2,
		selectTopicV2,
		inviteCollaboratorV2,
		resolvePendingInviteV2,
		revokeSentInviteV2,
		updateCollaboratorRoleV2,
		removeCollaboratorV2,
		canManageSelectedTopicV2,
	} = useCollaborationV2();
	const [tab, setTab] = useState("my-collaborations");
	const [isInviteOpen, setIsInviteOpen] = useState(false);
	const [inviteUsername, setInviteUsername] = useState("");
	const [inviteRole, setInviteRole] = useState<"EDITOR" | "VIEWER">("EDITOR");
	const [isInviting, setIsInviting] = useState(false);
	const [actingPendingIds, setActingPendingIds] = useState<string[]>([]);
	const [revokingIds, setRevokingIds] = useState<string[]>([]);
	const [updatingRoleIds, setUpdatingRoleIds] = useState<string[]>([]);
	const [removingCollaborator, setRemovingCollaborator] = useState<CollaborationTopicCollaboratorV2 | null>(null);

	const selectedTopic = useMemo(
		() => topicOptions.find((topic) => topic.id === selectedTopicId) ?? null,
		[selectedTopicId, topicOptions]
	);

	const headerAction = (
		<ManagementGate enabled={canManageSelectedTopicV2}>
			<Button
				onClick={() => setIsInviteOpen(true)}
				disabled={!canManageSelectedTopicV2 || !selectedTopicId}
				className="h-10 gap-2 rounded-md px-4"
			>
				<UserRoundPlus className="h-4 w-4" /> Invite collaborator
			</Button>
		</ManagementGate>
	);

	const handleInvite = async () => {
		if (!selectedTopicId || !inviteUsername.trim()) return;
		setIsInviting(true);
		try {
			await inviteCollaboratorV2({
				entityType: "TOPIC",
				entityId: selectedTopicId,
				receiverUsername: inviteUsername.trim(),
				role: inviteRole,
			});
			toast.success("Invite sent");
			setInviteUsername("");
			setInviteRole("EDITOR");
			setIsInviteOpen(false);
		} catch (error: any) {
			toast.error(error?.response?.data?.message || error?.message || "Could not send invite");
		} finally {
			setIsInviting(false);
		}
	};

	const handlePendingAction = async (requestId: string, action: "accepted" | "declined") => {
		setActingPendingIds((current) => [...current, `${requestId}-${action}`]);
		try {
			await resolvePendingInviteV2(requestId, action);
			toast.success(action === "accepted" ? "Invite accepted" : "Invite declined");
		} catch (error: any) {
			toast.error(error?.response?.data?.message || error?.message || "Could not update invite");
		} finally {
			setActingPendingIds((current) => current.filter((value) => value !== `${requestId}-${action}`));
		}
	};

	const handleRevoke = async (requestId: string) => {
		setRevokingIds((current) => [...current, requestId]);
		try {
			await revokeSentInviteV2(requestId);
			toast.success("Invite revoked");
		} catch (error: any) {
			toast.error(error?.response?.data?.message || error?.message || "Could not revoke invite");
		} finally {
			setRevokingIds((current) => current.filter((value) => value !== requestId));
		}
	};

	const handleRoleChange = async (
		collaborator: CollaborationTopicCollaboratorV2,
		role: "EDITOR" | "VIEWER"
	) => {
		setUpdatingRoleIds((current) => [...current, collaborator.id]);
		try {
			await updateCollaboratorRoleV2(collaborator, role);
			toast.success("Collaborator role updated");
		} catch (error: any) {
			toast.error(error?.response?.data?.message || error?.message || "Could not update role");
		} finally {
			setUpdatingRoleIds((current) => current.filter((value) => value !== collaborator.id));
		}
	};

	const handleRemoveCollaborator = async () => {
		if (!removingCollaborator) return;
		try {
			await removeCollaboratorV2(removingCollaborator);
			toast.success("Collaborator removed");
			setRemovingCollaborator(null);
		} catch (error: any) {
			toast.error(error?.response?.data?.message || error?.message || "Could not remove collaborator");
		}
	};

	return (
		<>
			<main className="relative min-h-screen overflow-hidden bg-slate-50 text-slate-950 dark:bg-[#020817] dark:text-slate-50">
				<div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-60 [background-image:linear-gradient(to_right,rgba(100,116,139,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(100,116,139,0.08)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:linear-gradient(to_bottom,black,transparent_92%)]" />
				<div aria-hidden="true" className="pointer-events-none absolute left-[9%] top-20 h-72 w-72 rounded-full bg-violet-500/10 blur-[120px]" />
				<div className="relative mx-auto flex w-full max-w-[1720px] flex-col gap-6 px-4 py-5 sm:px-7 lg:px-10 lg:py-7">
					<InsertNavbar />
				<section className="relative overflow-hidden rounded-xl border border-violet-500/20 bg-slate-950 text-white shadow-xl shadow-violet-950/10">
					<div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_12%_20%,rgba(139,92,246,0.25),transparent_35%),radial-gradient(circle_at_88%_80%,rgba(6,182,212,0.12),transparent_32%)]" />
					<div aria-hidden="true" className="absolute inset-0 opacity-20 [background-image:linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:36px_36px]" />
						<div className="flex flex-col gap-5 p-5 sm:p-7 lg:flex-row lg:items-end lg:justify-between">
							<div className="relative"><div className="inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.18em] text-violet-300"><Shield className="h-3.5 w-3.5" />Private shared workspace</div><h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Collaboration control center</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">Review access, respond to invitations, and manage every shared topic from one secure workspace.</p></div>
							<div className="flex flex-wrap items-center gap-2">
						<Button variant="outline" className="relative h-10 rounded-md border-white/15 bg-white/[0.06] px-4 text-white hover:bg-white/10 hover:text-white" onClick={() => refreshCollaborationV2()} disabled={isInitialLoading}>
							<RefreshCw className={`mr-2 h-4 w-4 ${isInitialLoading ? "animate-spin" : ""}`} /> Refresh
						</Button>
						{tab === "collaborators" ? headerAction : null}
							</div>
						</div>
						<div className="relative grid border-t border-white/10 sm:grid-cols-3">
							{[{ label: "Active access", value: myCollaborations.length, icon: Users }, { label: "Pending requests", value: pendingInvites.filter((invite) => invite.status === "PENDING").length, icon: MailPlus }, { label: "Invites sent", value: sentInvites.length, icon: UserRoundPlus }].map(({ label, value, icon: Icon }, index) => <div key={label} className={`flex items-center gap-3 px-5 py-4 ${index ? "border-t border-white/10 sm:border-l sm:border-t-0" : ""}`}><span className="flex h-9 w-9 items-center justify-center rounded-md bg-white/10 text-violet-300"><Icon className="h-4 w-4" /></span><div><p className="text-xl font-semibold leading-none">{value}</p><p className="mt-1 text-xs text-slate-400">{label}</p></div></div>)}
						</div>
				</section>

				{error ? (
					<Card className="border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-100">
						<CardContent className="flex items-center justify-between gap-4 p-4">
							<div>
								<p className="font-medium">Unable to load collaboration workspace</p>
								<p className="text-sm opacity-80">{error}</p>
							</div>
							<Button variant="outline" onClick={() => refreshCollaborationV2()}>Retry</Button>
						</CardContent>
					</Card>
				) : null}

				<Tabs value={tab} onValueChange={setTab} className="space-y-5">
					<div className="overflow-x-auto rounded-xl border border-slate-200 bg-white/65 p-1 shadow-sm backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/55">
					<TabsList className="h-auto min-w-max justify-start rounded-md bg-transparent p-0">
						<TabsTrigger value="my-collaborations" className="rounded-md px-4 py-2">My Collaborations <Badge variant="secondary" className="ml-2 rounded-md px-1.5 text-[9px]">{myCollaborations.length}</Badge></TabsTrigger>
						<TabsTrigger value="collaborators" className="rounded-md px-4 py-2">Collaborators</TabsTrigger>
						<TabsTrigger value="pending-invites" className="rounded-md px-4 py-2">Pending <Badge variant="secondary" className="ml-2 rounded-md px-1.5 text-[9px]">{pendingInvites.length}</Badge></TabsTrigger>
						<TabsTrigger value="sent-invites" className="rounded-md px-4 py-2">Sent <Badge variant="secondary" className="ml-2 rounded-md px-1.5 text-[9px]">{sentInvites.length}</Badge></TabsTrigger>
					</TabsList>
					</div>

					<TabsContent value="my-collaborations" className="mt-0">
						<div className="grid auto-rows-fr gap-3 md:grid-cols-2 xl:grid-cols-3">
							{isInitialLoading ? (
								<>
									<div className="h-48 animate-pulse rounded-2xl border border-slate-200 bg-white/50 dark:border-slate-800 dark:bg-slate-950/50" />
									<div className="h-48 animate-pulse rounded-2xl border border-slate-200 bg-white/50 dark:border-slate-800 dark:bg-slate-950/50" />
								</>
							) : myCollaborations.length === 0 ? (
								<Card className="rounded-2xl border-dashed md:col-span-2 xl:col-span-3">
									<CardContent className="flex flex-col items-center justify-center gap-3 py-12 text-center">
										<Users className="h-6 w-6 text-muted-foreground" />
										<div>
											<p className="font-medium">No collaborations yet</p>
											<p className="text-sm text-muted-foreground">Shared topics and blogs will appear here once you are added.</p>
										</div>
									</CardContent>
								</Card>
							) : (
								myCollaborations.map((item) => (
									<Card key={item.id} className="rounded-2xl border-slate-200 bg-white/65 shadow-sm transition hover:-translate-y-0.5 hover:border-violet-400/40 dark:border-slate-800 dark:bg-slate-950/55">
										<CardHeader className="space-y-4 p-5">
											<div className="flex items-start justify-between gap-3">
												<div className="space-y-1">
													<div className="flex flex-wrap items-center gap-2">
												<Badge variant="secondary" className="rounded-md px-2.5 py-1 text-[10px]">{item.entityType}</Badge>
												<Badge variant={roleVariant(item.role)} className="rounded-md px-2.5 py-1 text-[10px]">{item.role}</Badge>
													</div>
													<CardTitle className="text-xl">{item.entityTitle}</CardTitle>
													<CardDescription>
														Granted by: {item.grantedBy ?? "Unknown"}
													</CardDescription>
												</div>
										<Button asChild variant="outline" className="rounded-md">
													<Link href={item.openPath}>Open <ArrowUpRight className="ml-2 h-4 w-4" /></Link>
												</Button>
											</div>
										</CardHeader>
									</Card>
								))
							)}
						</div>
					</TabsContent>

					<TabsContent value="collaborators" className="mt-0 space-y-4">
						<Card className="rounded-2xl border-border/70 bg-background/95 shadow-sm">
							<CardHeader className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
								<div className="space-y-1">
									<CardTitle className="text-xl">Collaborators</CardTitle>
									<CardDescription>Manage access for a topic you own.</CardDescription>
								</div>
								<div className="w-full sm:w-[280px]">
									<Select value={selectedTopicId ?? undefined} onValueChange={(value) => void selectTopicV2(value)}>
									<SelectTrigger className="rounded-md">
											<SelectValue placeholder={topicOptions.length ? "Select a topic" : "No owned topics"} />
										</SelectTrigger>
										<SelectContent>
											{topicOptions.map((topic) => (
												<SelectItem key={topic.id} value={topic.id}>{topic.title}</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							</CardHeader>
							<CardContent className="space-y-4 p-5 pt-0">
								<div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
								<Badge variant={roleVariant(currentTopicRole ?? "VIEWER")} className="rounded-md px-2.5 py-1 text-[10px]">
										Current role: {currentTopicRole ?? "VIEWER"}
									</Badge>
									{selectedTopic ? <span>{selectedTopic.collaboratorCount} collaborator{selectedTopic.collaboratorCount === 1 ? "" : "s"}</span> : null}
								</div>
								{isTopicLoading ? (
									<div className="h-40 animate-pulse rounded-2xl border bg-muted/30" />
								) : !selectedTopic ? (
									<div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">Pick a topic to manage collaborators.</div>
								) : topicCollaborators.length === 0 ? (
									<div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">No collaborators added yet.</div>
								) : (
									<div className="space-y-3">
										{topicCollaborators.map((collaborator) => (
											<div key={collaborator.id} className="flex flex-col gap-3 rounded-2xl border border-border/70 p-4 sm:flex-row sm:items-center sm:justify-between">
												<div className="space-y-1">
													<div className="flex flex-wrap items-center gap-2">
														<p className="font-medium">@{collaborator.username}</p>
											<Badge variant={roleVariant(collaborator.role)} className="rounded-md px-2.5 py-1 text-[10px]">{collaborator.role}</Badge>
													</div>
													<p className="text-sm text-muted-foreground">Granted by: {collaborator.grantedBy ?? "Unknown"}</p>
												</div>
												<div className="flex flex-wrap items-center gap-2">
													<ManagementGate enabled={canManageSelectedTopicV2}>
														<DropdownMenu>
															<DropdownMenuTrigger asChild>
											<Button variant="outline" className="rounded-md" disabled={!canManageSelectedTopicV2 || updatingRoleIds.includes(collaborator.id)}>
																	{updatingRoleIds.includes(collaborator.id) ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
																	Change role
																</Button>
															</DropdownMenuTrigger>
															<DropdownMenuContent align="end">
																<DropdownMenuItem onClick={() => void handleRoleChange(collaborator, "EDITOR")}>Change to EDITOR</DropdownMenuItem>
																<DropdownMenuItem onClick={() => void handleRoleChange(collaborator, "VIEWER")}>Change to VIEWER</DropdownMenuItem>
															</DropdownMenuContent>
														</DropdownMenu>
													</ManagementGate>
													<ManagementGate enabled={canManageSelectedTopicV2}>
									<Button variant="destructive" className="rounded-md" disabled={!canManageSelectedTopicV2} onClick={() => setRemovingCollaborator(collaborator)}>
															Remove
														</Button>
													</ManagementGate>
												</div>
											</div>
										))}
									</div>
								)}
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="pending-invites" className="mt-0">
						<div className="space-y-3">
							{pendingInvites.length === 0 ? (
								<Card className="rounded-2xl border-dashed">
									<CardContent className="flex flex-col items-center gap-3 py-12 text-center">
										<MailPlus className="h-6 w-6 text-muted-foreground" />
										<div>
											<p className="font-medium">No pending invites</p>
											<p className="text-sm text-muted-foreground">Incoming collaboration requests will appear here.</p>
										</div>
									</CardContent>
								</Card>
							) : (
								pendingInvites.map((invite) => {
									const pending = invite.status === "PENDING";
									return (
										<Card key={invite.requestId} className="rounded-2xl border-border/70 bg-background/95 shadow-sm">
											<CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
												<div className="space-y-1">
													<div className="flex flex-wrap items-center gap-2">
														<p className="font-medium">{invite.entityTitle}</p>
										<Badge variant={roleVariant(invite.role)} className="rounded-md px-2.5 py-1 text-[10px]">{invite.role}</Badge>
										<Badge variant={statusVariant[invite.status]} className="rounded-md px-2.5 py-1 text-[10px]">{invite.status}</Badge>
													</div>
													<p className="text-sm text-muted-foreground">Sender: {invite.senderUsername ?? "Unknown"}</p>
													<p className="text-sm text-muted-foreground">Created: {formatDate(invite.createdAt)}</p>
												</div>
												<div className="flex flex-wrap items-center gap-2">
								<Button asChild variant="outline" className="rounded-md">
														<Link href={invite.entityType === "BLOG" ? `/blog/${invite.entityId}` : `/topic/${invite.entityId}`}>Open</Link>
													</Button>
													<Button
									className="rounded-md"
														disabled={!pending || actingPendingIds.includes(`${invite.requestId}-accepted`) || actingPendingIds.includes(`${invite.requestId}-declined`)}
														onClick={() => void handlePendingAction(invite.requestId, "accepted")}
													>
														{actingPendingIds.includes(`${invite.requestId}-accepted`) ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
														Accept
													</Button>
													<Button
														variant="outline"
									className="rounded-md"
														disabled={!pending || actingPendingIds.includes(`${invite.requestId}-accepted`) || actingPendingIds.includes(`${invite.requestId}-declined`)}
														onClick={() => void handlePendingAction(invite.requestId, "declined")}
													>
														{actingPendingIds.includes(`${invite.requestId}-declined`) ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
														Decline
													</Button>
												</div>
											</CardContent>
										</Card>
									);
								})
							)}
						</div>
					</TabsContent>

					<TabsContent value="sent-invites" className="mt-0">
						<div className="space-y-3">
							{sentInvites.length === 0 ? (
								<Card className="rounded-2xl border-dashed">
									<CardContent className="flex flex-col items-center gap-3 py-12 text-center">
										<MailPlus className="h-6 w-6 text-muted-foreground" />
										<div>
											<p className="font-medium">No sent invites</p>
											<p className="text-sm text-muted-foreground">Invites you send will be tracked here.</p>
										</div>
									</CardContent>
								</Card>
							) : (
								sentInvites.map((invite) => (
									<Card key={invite.requestId} className="rounded-2xl border-border/70 bg-background/95 shadow-sm">
										<CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
											<div className="space-y-1">
												<div className="flex flex-wrap items-center gap-2">
													<p className="font-medium">{invite.entityTitle}</p>
									<Badge variant={roleVariant(invite.role)} className="rounded-md px-2.5 py-1 text-[10px]">{invite.role}</Badge>
									<Badge variant={statusVariant[invite.status]} className="rounded-md px-2.5 py-1 text-[10px]">{invite.status}</Badge>
												</div>
												<p className="text-sm text-muted-foreground">Receiver: {invite.receiverUsername ?? "Unknown"}</p>
												<p className="text-sm text-muted-foreground">Created: {formatDate(invite.createdAt)}</p>
											</div>
											<div className="flex items-center gap-2">
												{invite.status === "PENDING" ? (
													<Button
														variant="outline"
								className="rounded-md"
														onClick={() => void handleRevoke(invite.requestId)}
														disabled={revokingIds.includes(invite.requestId)}
													>
														{revokingIds.includes(invite.requestId) ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
														Revoke
													</Button>
												) : null}
											</div>
										</CardContent>
									</Card>
								))
							)}
						</div>
					</TabsContent>
				</Tabs>
				</div>
			</main>

			<Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Invite collaborator</DialogTitle>
						<DialogDescription>Send a collaboration invite for the selected topic.</DialogDescription>
					</DialogHeader>
					<div className="space-y-4">
						<div className="space-y-2">
							<label className="text-sm font-medium">Username</label>
							<Input placeholder="rajdeep999" value={inviteUsername} onChange={(event) => setInviteUsername(event.target.value)} />
						</div>
						<div className="space-y-2">
							<label className="text-sm font-medium">Role</label>
							<Select value={inviteRole} onValueChange={(value: "EDITOR" | "VIEWER") => setInviteRole(value)}>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="EDITOR">EDITOR</SelectItem>
									<SelectItem value="VIEWER">VIEWER</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setIsInviteOpen(false)}>Cancel</Button>
						<Button onClick={handleInvite} disabled={isInviting || !inviteUsername.trim() || !selectedTopicId}>
							{isInviting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
							Send invite
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<AlertDialog open={Boolean(removingCollaborator)} onOpenChange={(open) => !open ? setRemovingCollaborator(null) : null}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Remove collaborator access?</AlertDialogTitle>
						<AlertDialogDescription>
							This action can be reversed only by sending a new invitation.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction onClick={() => void handleRemoveCollaborator()}>Remove</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
