import React,{ useEffect,useState,ReactNode } from "react";
import { HoverCard,HoverCardContent,HoverCardTrigger } from "@/components/ui/hover-card";
import { Avatar,AvatarFallback,AvatarImage } from "@/components/ui/avatar";
import axios from "axios";
import Link from "next/link";

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
	const [currentUser,setCurrentUser] = useState<any>(null)

	useEffect(() => {
		const collectUser = async () => {
			try {
				if (!username) return
				const response = await axios.get(`/api/get-user-by-username?username=${username}`)
				if (response.data?.success) {
					console.log(response)
					setCurrentUser(response?.data?.userdata)
				} else {
					setCurrentUser(null)
				}
			} catch {
				setCurrentUser(null)
			}
		}
		collectUser()
	},[username])

	return (
		<HoverCard>
			<HoverCardTrigger asChild>
				{
					type === "username"
						? <div className={avatarSize === "small" ?  "text-gray-500 hover:underline cursor-pointer" : "text-blue-500 hover:underline cursor-pointer"}>@{username}</div>
						: <Avatar className={avatarSize === "small" ? 'h-5 w-5' : 'cursor-pointer outline-2 outline-black border-2 border-red-500 dark:border-white'}>
							<AvatarImage src={currentUser?.avatar || ''} />
							<AvatarFallback>{currentUser?.username[0]}</AvatarFallback>
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
							<Link href={`/u/${currentUser?.username}`} className="text-xs text-slate-500 truncate hover:text-blue-500 hover:underline">@{currentUser?.username}</Link>
						</div>

						{currentUser?.about && (<p className="text-xs text-gray-300">{currentUser?.about}</p>)}
					</div>
				</div>
			</HoverCardContent>
		</HoverCard>
	)
}

export default InsertHoverCard