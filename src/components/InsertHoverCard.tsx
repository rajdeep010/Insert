import React, { useEffect, useState, ReactNode } from "react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import { usePublicUser } from "@/features/user/context/InsertUserProvider";

interface InsertHoverCardProps {
	username: string;
	type?: string;
	avatarSize?: string
}

const InsertHoverCard: React.FC<InsertHoverCardProps> = ({
	username,
	type,
	avatarSize,
}) => {
	const currentUser = usePublicUser(username)


	return (
		<HoverCard>
			<HoverCardTrigger asChild>
				{
					type === "username"
						? <div className={avatarSize === "small" ? "flex items-center gap-1 text-gray-500 hover:underline cursor-pointer" : "flex items-center gap-1 text-blue-500 hover:underline cursor-pointer"}>
							@{username}
							{
								currentUser?.proStatus?.active && (
									<span
										className='inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-500'
										aria-label='Verified'
										title='Verified'
									>
										<BadgeCheck className='text-white' size={14} strokeWidth={3} />
									</span>
								)
							}
						</div>
						: <Avatar className={avatarSize === "small" ? 'h-5 w-5' : 'cursor-pointer outline-2 outline-black border-2 border-red-500 dark:border-white'}>
							<AvatarImage src={currentUser?.avatar || ''} />
							<AvatarFallback>{currentUser?.username?.[0]}</AvatarFallback>
						</Avatar>
				}
			</HoverCardTrigger>
			<HoverCardContent className="w-fit">
				<div className="flex justify-between gap-4">
					<Avatar>
						<AvatarImage src={currentUser?.avatar || ""} />
						<AvatarFallback>{currentUser?.username[0]?.toUpperCase()}</AvatarFallback>
					</Avatar>
					<div className="flex flex-col gap-2">
						<div className="flex flex-col gap-1">
							<h4 className="text-sm font-semibold truncate mb-[-2px]">{currentUser?.name || currentUser?.username}</h4>
							<Link href={`/u/${currentUser?.username}`} className="flex items-center gap-1 text-xs text-slate-500 truncate hover:text-blue-500 hover:underline">
								@{currentUser?.username}
								{
									currentUser?.proStatus?.active && (
										<span
											className='inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-500'
											aria-label='Verified'
											title='Verified'
										>
											<BadgeCheck className='text-white' size={14} strokeWidth={3} />
										</span>
									)
								}
							</Link>
						</div>

						{currentUser?.about && (<p className="text-xs text-gray-700 dark:text-gray-300">{currentUser?.about}</p>)}
					</div>
				</div>
			</HoverCardContent>
		</HoverCard>
	)
}

export default InsertHoverCard