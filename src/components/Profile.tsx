'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Building2, Github, Linkedin, MapPin } from 'lucide-react'

import EditProfile from '@/components/EditProfile'
import ProBadgeIcon from '@/components/ProBadgeIcon'
import AvatarSkeleton from '@/components/skeletons/AvatarSkeleton'
import ProfileSkeleton from '@/components/skeletons/ProfileSkeleton'
import { useInsertUser } from '@/features/user/context/InsertUserProvider'

export default function Profile() {
    const { username } = useParams()
    const { data: session } = useSession()
    const { profileUser, isAvatarUploading, isUserLoading } = useInsertUser()
    const isOwner = session?.user?.username === username
    const links = [
        profileUser?.company ? { icon: Building2, label: profileUser.company } : null,
        profileUser?.location ? { icon: MapPin, label: profileUser.location } : null,
    ].filter(Boolean) as { icon: typeof Building2; label: string }[]

    return (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white/65 shadow-sm backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/55">
            <div className="h-20 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.35),transparent_58%),radial-gradient(circle_at_bottom_right,rgba(6,182,212,0.2),transparent_55%)]" />
            <div className="px-5 pb-5">
                <div className="-mt-10 flex items-end justify-between gap-3">
                    {isAvatarUploading ? <AvatarSkeleton /> : <Image src={profileUser?.avatar || '/user_png.png'} width={112} height={112} alt={profileUser?.name || 'Profile avatar'} className="h-24 w-24 rounded-2xl border-4 border-white bg-white object-cover shadow-sm dark:border-slate-950 dark:bg-slate-950" />}
                    {isOwner && <div className="pb-1"><EditProfile /></div>}
                </div>

                {isUserLoading ? <div className="mt-5"><ProfileSkeleton /></div> : (
                    <>
                        <div className="mt-5">
                            <div className="flex items-center gap-1.5 text-xs text-slate-500"><span>@{profileUser?.username}</span><ProBadgeIcon state={profileUser?.proStatus?.badgeState ?? 'none'} /></div>
                            <h1 className="mt-1 text-2xl font-semibold tracking-[-0.03em]">{profileUser?.name || profileUser?.username}</h1>
                            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{profileUser?.about || 'Building and sharing with the Insert community.'}</p>
                        </div>

                        <div className="mt-5 space-y-2 border-t border-slate-200 pt-4 text-sm dark:border-slate-800">
                            {links.map(({ icon: Icon, label }) => <div key={label} className="flex min-w-0 items-center gap-2.5 text-slate-600 dark:text-slate-400"><Icon className="h-4 w-4 shrink-0" /><span className="truncate">{label}</span></div>)}
                            {profileUser?.profile && <Link href={`https://github.com/${profileUser.profile}`} target="_blank" rel="noopener noreferrer" className="flex min-w-0 items-center gap-2.5 text-slate-600 transition hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-300"><Github className="h-4 w-4 shrink-0" /><span className="truncate">{profileUser.profile}</span></Link>}
                            {profileUser?.linkedin && <Link href={`https://www.linkedin.com/in/${profileUser.linkedin}`} target="_blank" rel="noopener noreferrer" className="flex min-w-0 items-center gap-2.5 text-slate-600 transition hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-300"><Linkedin className="h-4 w-4 shrink-0" /><span className="truncate">{profileUser.linkedin}</span></Link>}
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
