'use client'
import React from 'react'
import { BsHourglassSplit } from 'react-icons/bs'
import Link from 'next/link'
import { signOut,useSession } from 'next-auth/react'
import { DropdownMenu,DropdownMenuContent,DropdownMenuItem,DropdownMenuLabel,DropdownMenuSeparator,DropdownMenuTrigger,} from "@/components/ui/dropdown-menu"
import { RiMenu3Line } from "react-icons/ri";
import { CreditCard,LogOut,User,LayoutDashboard,Contact,LogIn,LoaderPinwheel,MessageSquareDot,MessageSquare,CircleCheckBig } from "lucide-react"
import { useUser } from '@/app/context/UserProvider'
import { Button } from './ui/button'
import { InviteNotificationCardProps,SuggestionNotificationCardProps } from '@/types/types'
import InviteNotificationCard from './InviteNotificationCard'
import SuggestionNotificationCard from './SuggestionNotificationCard'
import AcceptedInviteCard from './AcceptedInviteCard'
import { uniqueId } from '@/helpers/unique-id'
import DeclineInviteCard from './DeclineInviteCard'
import { useParams } from 'next/navigation'
import { FiTarget } from "react-icons/fi";



const Navbar = () => {
    const { data: session,status } = useSession()
    const { handleOverViewClick,handleDashboardClick } = useUser()

    const params = useParams()
    const param_username = params.username

    const { userNotifications,markAllRead } = useUser()
    let unread_cnt = 0
    userNotifications.map((each) => {
        if (each.read === true) unread_cnt += 1
    })
    // // console.log(userNotifications, userNotifications.length)

    return (
        <>
            <nav className='flex justify-between items-center'>
                <Link className='flex gap-2 text-5xl' href={`/`}>
                    {/* <span><FiTarget /></span> */}
                    <span className='font-sans'>Insert</span>
                </Link>


                <div className='flex items-center justify-between gap-10'>

                    <div className='hidden lg:flex'>

                        <div className='flex gap-5 items-center'>
                            {
                                session ? (<>

                                    <div className='flex items-center gap-10'>


                                        <div className='text-md cursor-pointer' onClick={handleOverViewClick}>Overview</div>
                                        <div className='text-md cursor-pointer' onClick={handleDashboardClick}>Dashboard</div>

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

                                        <div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger className='text-2xl'>
                                                    <RiMenu3Line />
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    <DropdownMenuLabel className='font-sans'>Insert</DropdownMenuLabel>
                                                    <DropdownMenuSeparator />

                                                    <Link href={`/u/${session?.user?.username}`} onClick={handleOverViewClick}>
                                                        <DropdownMenuItem className='cursor-pointer'>
                                                            <User className="mr-2 h-4 w-4" />
                                                            Your Profile
                                                        </DropdownMenuItem>
                                                    </Link>

                                                    <Link className='text-md' href={`/sheets`}>
                                                        <DropdownMenuItem className='cursor-pointer'>
                                                            <LayoutDashboard className='mr-2 h-4 w-4' />
                                                            All Sheets
                                                        </DropdownMenuItem>
                                                    </Link>

                                                    <Link href={`mailto:insertcontact999@gmail.com`}>
                                                        <DropdownMenuItem className='cursor-pointer'>
                                                            <Contact className='mr-2 h-4 w-4' />
                                                            Contact
                                                        </DropdownMenuItem>
                                                    </Link>


                                                    <DropdownMenuItem className='cursor-pointer' onClick={() => signOut()}>
                                                        <LogOut className='mr-2 h-4 w-4' />
                                                        LogOut
                                                    </DropdownMenuItem>

                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>

                                </>) : (<>
                                    <div className='flex items-center gap-10'>
                                        <div className='text-md cursor-pointer' onClick={handleOverViewClick}>Overview</div>
                                        <div className='text-md cursor-pointer' onClick={handleDashboardClick}>Dashboard</div>



                                        <div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger className='text-2xl'>
                                                    <RiMenu3Line />
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    <DropdownMenuLabel>Insert</DropdownMenuLabel>
                                                    <DropdownMenuSeparator />

                                                    <Link className='text-md' href={`/sheets`}>
                                                        <DropdownMenuItem className='cursor-pointer'>
                                                            <LayoutDashboard className='mr-2 h-4 w-4' />
                                                            All Sheets
                                                        </DropdownMenuItem>
                                                    </Link>

                                                    <Link className='text-md' href={`/sign-in`}>
                                                        <DropdownMenuItem className='cursor-pointer'>
                                                            <LogIn className='mr-2 h-4 w-4' />
                                                            Login
                                                        </DropdownMenuItem>
                                                    </Link>

                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>

                                    </div>
                                </>)
                            }
                        </div>
                    </div>

                    {/* Mobile View */}
                    <div className="lg:hidden flex gap-10 items-center">

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
                        {
                            session
                                ?
                                (<>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger className='text-2xl'>
                                            <RiMenu3Line />
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            <DropdownMenuLabel>Options</DropdownMenuLabel>
                                            <DropdownMenuSeparator />


                                            <div onClick={handleOverViewClick} className='flex items-center'>
                                                <DropdownMenuItem className='cursor-pointer'>
                                                    <CreditCard className='mr-2 h-4 w-4' />
                                                    <span className='text-md'>Overview</span>
                                                </DropdownMenuItem>
                                            </div>


                                            <div onClick={handleDashboardClick} className='flex items-center'>
                                                <DropdownMenuItem className='cursor-pointer'>
                                                    <LoaderPinwheel className='mr-2 h-4 w-4' />
                                                    <span className='text-md'>Dashboard</span>
                                                </DropdownMenuItem>
                                            </div>

                                            <Link href={`/u/${session?.user?.username}`} className='flex items-center'>
                                                <DropdownMenuItem className='cursor-pointer'>
                                                    <User className='mr-2 h-4 w-4' />
                                                    <span className='text-md'>Your Profile</span>
                                                </DropdownMenuItem>
                                            </Link>

                                            <Link href={`/sheets`} className='flex items-center'>
                                                <DropdownMenuItem className='cursor-pointer'>
                                                    <LayoutDashboard className='mr-2 h-4 w-4' />
                                                    <span className='text-md'>All Sheets</span>
                                                </DropdownMenuItem>
                                            </Link>

                                            {
                                                status === 'authenticated' && <Link href={`mailto:insertcontact999@gmail.com`}>
                                                    <DropdownMenuItem className='cursor-pointer'>
                                                        <Contact className='mr-2 h-4 w-4' />
                                                        Contact
                                                    </DropdownMenuItem>
                                                </Link>
                                            }
                                            {
                                                status === 'authenticated' && <DropdownMenuItem className='cursor-pointer' onClick={() => signOut()}>
                                                    <LogOut className='mr-2 h-4 w-4' />
                                                    <span>LogOut</span>
                                                </DropdownMenuItem>
                                            }
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </>)
                                :
                                (<>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger className='text-2xl'>
                                            <RiMenu3Line />
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            <DropdownMenuLabel>Options</DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className='cursor-pointer'>
                                                <CreditCard className='mr-2 h-4 w-4' />
                                                <span className='text-md' onClick={handleOverViewClick}>Overview</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className='cursor-pointer'>
                                                <LoaderPinwheel className='mr-2 h-4 w-4' />
                                                <span className='text-md' onClick={handleDashboardClick}>Dashboard</span>
                                            </DropdownMenuItem>

                                            <Link href={`/sheets`} className='flex items-center'>
                                                <DropdownMenuItem className='cursor-pointer'>
                                                    <LayoutDashboard className='mr-2 h-4 w-4' />
                                                    <span className='text-md'>All Sheets</span>
                                                </DropdownMenuItem>
                                            </Link>

                                            {
                                                status === 'unauthenticated' && <>
                                                    <DropdownMenuItem className='cursor-pointer'>
                                                        <LogIn className='mr-2 h-4 w-4' />
                                                        <Link href={`/sign-in`} >Login</Link>
                                                    </DropdownMenuItem>
                                                </>
                                            }
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </>)
                        }
                    </div >

                </div>

            </nav >
        </>
    )
}

export default Navbar