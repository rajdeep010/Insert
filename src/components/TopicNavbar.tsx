import { useUser } from '@/app/context/UserProvider'
import { signOut,useSession } from 'next-auth/react'
import React from 'react'
import { BsHourglassSplit } from 'react-icons/bs'
import { DropdownMenu,DropdownMenuContent,DropdownMenuItem,DropdownMenuLabel,DropdownMenuSeparator,DropdownMenuTrigger,} from "@/components/ui/dropdown-menu"
import { CreditCard,LogOut,User,LayoutDashboard,Contact,LogIn,LoaderPinwheel, MessageSquare, CircleCheckBig } from "lucide-react"
import { RiMenu3Line } from "react-icons/ri";
import Link from 'next/link'
import { FiTarget } from "react-icons/fi";
import DeclineInviteCard from './DeclineInviteCard'
import AcceptedInviteCard from './AcceptedInviteCard'
import SuggestionNotificationCard from './SuggestionNotificationCard'
import InviteNotificationCard from './InviteNotificationCard'
import { useParams } from 'next/navigation'




const TopicNavbar = () => {
    const { data: session,status } = useSession()
    const { handleOverViewClick,handleDashboardClick } = useUser()

    const params = useParams()
    const param_username = params.username

    const { userNotifications,markAllRead } = useUser()
    let unread_cnt = 0
    userNotifications.map((each) => {
        if (each.read === true) unread_cnt += 1
    })

    return (
        <>
            <nav className='flex justify-between'>
                <Link className='flex gap-2 text-5xl' href={`/`}>
                    {/* <span><FiTarget /></span> */}
                    <span className='font-sans'>Insert</span>
                </Link>

                <div className='flex gap-3'>

                    <div>
                        {status === 'authenticated' && param_username && param_username === session?.user?.username && <div>
                            <DropdownMenu>
                                <DropdownMenuTrigger className={`flex items-center ${unread_cnt > 0 && 'notify'}`} unread-count={unread_cnt}>
                                    <MessageSquare className='text-2xl' />
                                </DropdownMenuTrigger>

                                <DropdownMenuContent className='max-w-[300px] max-h-[400px] overflow-y-scroll custom-scrollbar'>
                                    <DropdownMenuLabel className='flex items-center justify-between'>
                                        <div>Notifications</div>
                                        {session && session?.user && session?.user?.username && userNotifications.length > 0 && <div className='p-1 cursor-pointer flex items-center gap-1 text-xs underline text-blue-400' onClick={() => markAllRead(session?.user?.username!)} ><CircleCheckBig className='h-4 w-4' /> Mark all read</div>}
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <div>
                                        {
                                            userNotifications.length === 0 && <>
                                                <div className='p-2 text-sm'>No notifications</div>
                                            </>
                                        }
                                        {
                                            userNotifications.map((msg,idx) => (
                                                <React.Fragment key={idx}>
                                                    {
                                                        msg.noti_type === 'collab_invitation' && (
                                                            <>
                                                                <InviteNotificationCard
                                                                    key={idx}
                                                                    from={msg.from as string}
                                                                    topicid={msg.topicid as string}
                                                                    topicname={msg.topicname as string}
                                                                    notifyid={msg._id as string}
                                                                    read={msg.read}
                                                                />
                                                                <DropdownMenuSeparator />
                                                            </>
                                                        )
                                                    }

                                                    {
                                                        msg.noti_type === 'suggestion' && (
                                                            <>
                                                                <SuggestionNotificationCard
                                                                    key={idx}
                                                                    from={msg.from as string}
                                                                    topicid={msg.topicid as string}
                                                                    problemurl={msg.problemurl as string}
                                                                    topicname={msg.topicname as string}
                                                                    read={msg.read}
                                                                />
                                                                <DropdownMenuSeparator />
                                                            </>
                                                        )
                                                    }

                                                    {
                                                        msg.noti_type === 'accept_invite' && (
                                                            <>
                                                                <AcceptedInviteCard
                                                                    key={idx}
                                                                    from={msg.from as string}
                                                                    topicid={msg.topicid as string}
                                                                    topicname={msg.topicname as string}
                                                                    read={msg.read}
                                                                />
                                                                <DropdownMenuSeparator />
                                                            </>
                                                        )
                                                    }

                                                    {
                                                        msg.noti_type === 'decline_invite' && (
                                                            <>
                                                                <DeclineInviteCard
                                                                    key={idx}
                                                                    from={msg.from as string}
                                                                    topicid={msg.topicid as string}
                                                                    topicname={msg.topicname as string}
                                                                    read={msg.read}
                                                                />
                                                            </>
                                                        )
                                                    }

                                                </ React.Fragment>
                                            ))
                                        }
                                    </div>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>}
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger className='text-2xl'>
                            <RiMenu3Line />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuLabel>Insert</DropdownMenuLabel>
                            <DropdownMenuSeparator />

                            {
                                status === 'authenticated' && <DropdownMenuItem className='cursor-pointer'>
                                    <User className="mr-2 h-4 w-4" />
                                    <Link className='text-md' href={`/u/${session?.user?.username}`} onClick={handleOverViewClick} >Your Profile</Link>
                                </DropdownMenuItem>
                            }

                            <DropdownMenuItem className='cursor-pointer'>
                                <Link href={`/sheets`} className='flex items-center'>
                                    <LayoutDashboard className='mr-2 h-4 w-4' />
                                    <span>All Sheets</span>
                                </Link>
                            </DropdownMenuItem>

                            {
                                status === 'authenticated' && <DropdownMenuItem className='cursor-pointer'>
                                    <Contact className='mr-2 h-4 w-4' />
                                    <a href={`mailto:insertcontact999@gmail.com`} >Contact</a>
                                </DropdownMenuItem>
                            }

                            {
                                status === 'authenticated' && <DropdownMenuItem className='cursor-pointer' onClick={() => signOut()}>
                                    <LogOut className='mr-2 h-4 w-4' />
                                    <span>LogOut</span>
                                </DropdownMenuItem>
                            }

                            {
                                status === 'unauthenticated' && <DropdownMenuItem className='cursor-pointer'>
                                    <Link href={`/sign-in`} className='flex items-center'>
                                        <LogIn className='mr-2 h-4 w-4' />
                                        <span>Login</span>
                                    </Link>
                                </DropdownMenuItem>
                            }
                        </DropdownMenuContent>
                    </DropdownMenu>

                </div>

            </nav>
        </>
    )
}

export default TopicNavbar