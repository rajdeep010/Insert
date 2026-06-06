'use client'
import React, { useEffect, useRef, useState } from 'react'
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";
import Image from 'next/image';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { useInsertUser } from '@/features/user/context/InsertUserProvider';
import { disablePushNotifications, enablePushNotifications } from '@/lib/push-notifications';
import { Loader2, Camera, User, Building2, MapPin, Settings, Bell, Info } from 'lucide-react';
import { FaGithub, FaLinkedin } from 'react-icons/fa6';



const surface =
    'rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-white/60 dark:bg-gray-900/40 supports-[backdrop-filter]:bg-white/40 transition-colors'
const hoverable =
    'transition-colors hover:border-black/20 dark:hover:border-white/30'



const EditProfile = () => {
    const { currentUser, updateUser, uploadAvatar } = useInsertUser()
    const avatarURL = currentUser?.avatar

    const [formData, setFormData] = useState({
        name: '',
        about: '',
        linkedin: '',
        profile: '',
        company: '',
        location: ''
    })
    const [isAvatarUploading, setIsAvatarUploading] = useState(false)
    const [isSavingUser, setSaveUser] = useState(false)
    const [isNotificationSaving, setIsNotificationSaving] = useState(false)
    const [pushEnabled, setPushEnabled] = useState(false)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target
        setFormData(prevState => ({
            ...prevState,
            [id]: value
        }))
    }

    const [selectedImage, setSelectedImage] = useState<string | ArrayBuffer | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [file, setFile] = useState<File | null>(null)

    const handleImageChange = (e: any) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0])
            const reader = new FileReader()
            reader.onload = (event) => {
                setSelectedImage(event.target?.result || null)
            }
            reader.readAsDataURL(e.target.files[0])
        }
    }

    const handleIconClick = () => { fileInputRef.current?.click() }
    const handleAvatarUpdate = async (file: File) => {
        setIsAvatarUploading(true)
        await uploadAvatar(file)
        setIsAvatarUploading(false)
    }

    const handleSaveUser = async () => {
        try {
            setSaveUser(true)
            await updateUser(formData)
        } catch {
            setSaveUser(false)
        } finally {
            setSaveUser(false)
        }
    }

    const handlePushToggle = async (checked: boolean) => {
        const previousValue = pushEnabled

        setPushEnabled(checked)
        setIsNotificationSaving(true)

        try {
            if (checked) {
                const token = await enablePushNotifications()
                const wasSaved = await updateUser({
                    notificationSettings: {
                        pushEnabled: true,
                        fcmToken: token,
                    },
                })

                if (!wasSaved) {
                    throw new Error('Could not save notification settings')
                }

                return
            }

            await disablePushNotifications()
            const wasSaved = await updateUser({
                notificationSettings: {
                    pushEnabled: false,
                    fcmToken: null,
                },
            })

            if (!wasSaved) {
                throw new Error('Could not save notification settings')
            }
        } catch (error) {
            setPushEnabled(previousValue)
            toast({
                title: 'Notification settings unchanged',
                description: error instanceof Error ? error.message : 'Could not update notification settings',
                variant: 'destructive',
            })
        } finally {
            setIsNotificationSaving(false)
        }
    }

    useEffect(() => {
        if (currentUser) {
            setFormData({
                name: currentUser?.name || '',
                about: currentUser?.about || '',
                linkedin: currentUser?.linkedin || '',
                profile: currentUser?.profile || '',
                company: currentUser?.company || '',
                location: currentUser?.location || ''
            })
            setPushEnabled(Boolean(currentUser?.notificationSettings?.pushEnabled))
        }
    }, [currentUser])

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <Settings className="h-4 w-4" />
                    Settings
                </Button>
            </SheetTrigger>

            <SheetContent className="sm:max-w-[560px]">
                <SheetHeader>
                    <SheetDescription>
                        <VisuallyHidden.Root>Manage your profile settings, avatar, and notifications</VisuallyHidden.Root>
                    </SheetDescription>
                    <SheetTitle className="text-xl">Settings</SheetTitle>
                </SheetHeader>

                <div className="grid gap-6 py-6">
                    {/* <div className={`${surface} ${hoverable} p-4`}>
                        <div className="flex items-start justify-between gap-4">
                            <div className="space-y-1 pr-4">
                                <div className="flex items-center gap-2">
                                    <Bell className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                    <Label htmlFor="push-notifications" className="text-sm font-medium">
                                        Push notifications
                                    </Label>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                {isNotificationSaving && <Loader2 className="h-4 w-4 animate-spin text-gray-500" />}
                                <Switch
                                    id="push-notifications"
                                    checked={pushEnabled}
                                    onCheckedChange={handlePushToggle}
                                    disabled={isNotificationSaving}
                                    aria-label="Toggle push notifications"
                                />
                            </div>
                        </div>
                    </div> */}
                    {/* Avatar section */}
                    <div className={`${surface} ${hoverable} p-4`}>
                        <div className="flex items-center justify-between gap-6">
                            <div className="relative">
                                <div className="relative h-[112px] w-[112px] rounded-full overflow-hidden ring-1 ring-black/10 dark:ring-white/10">
                                    <Image
                                        src={typeof selectedImage === 'string' ? selectedImage : avatarURL || '/user_png.png'}
                                        alt="Profile avatar"
                                        className="object-cover"
                                        width={112}
                                        height={112}
                                    />
                                </div>

                                {/* Overlay change button */}
                                <button
                                    type="button"
                                    onClick={handleIconClick}
                                    disabled={isAvatarUploading}
                                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[11px] px-2 py-1 rounded-md bg-black/80 text-white hover:bg-black/90 focus:outline-none focus:ring-2 focus:ring-black/30 dark:focus:ring-white/20"
                                    title="Change avatar"
                                >
                                    <span className="inline-flex items-center gap-1">
                                        <Camera className="h-3.5 w-3.5" /> Change
                                    </span>
                                </button>
                            </div>

                            <div className="flex-1">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    ref={fileInputRef}
                                    className="hidden"
                                />

                                <div className="flex flex-wrap gap-2">
                                    <Button
                                        className="cursor-pointer flex items-center gap-2"
                                        onClick={handleIconClick}
                                        disabled={isAvatarUploading}
                                        variant="secondary"
                                    >
                                        <Camera className="h-4 w-4" />
                                        Choose image
                                    </Button>

                                    {file && (
                                        <Button
                                            type="submit"
                                            disabled={isAvatarUploading}
                                            onClick={() => handleAvatarUpdate(file)}
                                            variant="default"
                                            className="gap-2"
                                        >
                                            {isAvatarUploading ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 animate-spin" /> Please Wait
                                                </>
                                            ) : (
                                                'Save Avatar'
                                            )}
                                        </Button>
                                    )}
                                </div>

                                <p className="mt-2 text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                                    <Info className="h-3.5 w-3.5" />
                                    Recommended: square image, at least 256×256
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Profile fields */}
                    <div className={`${surface} ${hoverable} p-4`}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Name */}
                            <div className="col-span-1 md:col-span-2">
                                <label htmlFor="name" className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                    Name
                                </label>
                                <div className="relative mt-1">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input id="name" value={formData.name} onChange={handleChange} placeholder="Your name" className="pl-9" />
                                </div>
                            </div>

                            {/* About */}
                            <div className="col-span-1 md:col-span-2">
                                <label htmlFor="about" className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                    About
                                </label>
                                <div className="relative mt-1">
                                    <Info className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input id="about" value={formData.about} onChange={handleChange} placeholder="Short bio" className="pl-9" />
                                </div>
                            </div>

                            {/* LinkedIn */}
                            <div>
                                <label htmlFor="linkedin" className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                    Linkedin Username
                                </label>
                                <div className="relative mt-1">
                                    <FaLinkedin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input id="linkedin" value={formData.linkedin} onChange={handleChange} placeholder="Linkedin username" className="pl-9" />
                                </div>
                            </div>

                            {/* Profile/Handle */}
                            <div>
                                <label htmlFor="profile" className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                    Github Username
                                </label>
                                <div className="relative mt-1">
                                    <FaGithub className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input id="profile" value={formData.profile} onChange={handleChange} placeholder="Github username" className="pl-9" />
                                </div>
                            </div>

                            {/* Company */}
                            <div>
                                <label htmlFor="company" className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                    Company
                                </label>
                                <div className="relative mt-1">
                                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input id="company" value={formData.company} onChange={handleChange} placeholder="Company name" className="pl-9" />
                                </div>
                            </div>

                            {/* Location */}
                            <div>
                                <label htmlFor="location" className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                    Location
                                </label>
                                <div className="relative mt-1">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input id="location" value={formData.location} onChange={handleChange} placeholder="City, Country" className="pl-9" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <SheetFooter className="mt-2">
                    <SheetClose asChild>
                        <Button type="submit" onClick={() => handleSaveUser()} className="w-full gap-2">
                            {isSavingUser ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please Wait
                                </>
                            ) : ('Save Changes')}
                        </Button>
                    </SheetClose>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}

export default EditProfile