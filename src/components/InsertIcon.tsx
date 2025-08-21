import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

interface InsertIconProps {
    width?: number | string
    height?: number | string
    className?: string
    alt?: string
}

const InsertIcon: React.FC<InsertIconProps> = ({
    width = 40,
    height = 40,
    className,
    alt = "Insert Logo"
}) => {
    const sizeStyle = {
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
    }

    return (
        <Avatar
            className={cn("", className)}
            style={sizeStyle}
        >
            <AvatarImage
                src="/panda-bear.png"
                alt={alt}
                className="object-contain"
            />
            <AvatarFallback
                className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold"
                style={sizeStyle}
            >
                IN
            </AvatarFallback>
        </Avatar>
    )
}

export default InsertIcon