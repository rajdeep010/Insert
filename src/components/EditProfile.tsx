'use client'
import { useSession } from 'next-auth/react'
import React, { useEffect, useRef, useState } from 'react'
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import Image from 'next/image';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import {useUser} from '@/app/context/UserProvider'


const EditProfile = () => {
    const { data: session, status} = useSession()
    const { updateUser, user_information, uploadAvatar, user_avatar } = useUser()

    const avatarURL = user_avatar

    const [formData, setFormData] = useState({
        name: '',
        about: '',
        linkedin: '',
        profile: '',
        company: '',
        location: ''
    })

    // console.log(user_information, formData)

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

    const handleAvatarSubmit = () => {
        if (!file) return
        uploadAvatar(file)
    }

    const handleSubmit = () => {
        updateUser(formData)
    }

    useEffect(() => {
        if (user_information) {
            setFormData({
                name: user_information.name || '',
                about: user_information.about || '',
                linkedin: user_information.linkedin || '',
                profile: user_information.profile || '',
                company: user_information.company || '',
                location: user_information.location || ''
            })
        }
    }, [user_information])

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline">Edit Profile</Button>
            </SheetTrigger>
            <SheetContent>
                <SheetHeader>
                    <SheetDescription>
                        <VisuallyHidden.Root>
                            Description goes here
                        </VisuallyHidden.Root>
                    </SheetDescription>
                    <SheetTitle>Edit profile</SheetTitle>
                </SheetHeader>
                <div className="grid gap-4 py-4">
                    <div className='flex flex-col gap-2'>
                        <div className="flex justify-between items-end gap-4">
                            <Image
                                src={typeof selectedImage === 'string' ? selectedImage : avatarURL || '/user_png.png'}
                                alt="Profile"
                                className="rounded-full border-2 p-2 shadow-md max-w-[230px] max-h-[130px]"
                                width={130}
                                height={130}
                            />
                            <Input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                ref={fileInputRef}
                                className='hidden mb-8'
                            />
                            <div className='flex flex-col gap-2'>
                                <Button className='cursor-pointer flex items-center gap-2' onClick={handleIconClick}>
                                    Update
                                </Button>
                                <Button className='cursor-pointer flex items-center gap-2' onClick={handleAvatarSubmit}>
                                    Save Avatar
                                </Button>
                            </div>
                        </div>
                    </div>
                    <Input id="name" value={formData.name} onChange={handleChange} placeholder='Name' className="col-span-3" />
                    <Input id="about" value={formData.about} onChange={handleChange} placeholder='About' className="col-span-3" />
                    <Input id="linkedin" value={formData.linkedin} onChange={handleChange} placeholder='LinkedIn' className="col-span-3" />
                    <Input id="profile" value={formData.profile} onChange={handleChange} placeholder='Profile' className="col-span-3" />
                    <Input id="company" value={formData.company} onChange={handleChange} placeholder='Company' className="col-span-3" />
                    <Input id="location" value={formData.location} onChange={handleChange} placeholder='Location' className="col-span-3" />
                </div>
                <SheetFooter>
                    <SheetClose asChild>
                        <Button type="submit" onClick={handleSubmit}>Save changes</Button>
                    </SheetClose>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}

export default EditProfile