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
    alt = "U"
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
                src="https://res.cloudinary.com/dgxeg3sju/image/upload/v1767523800/animal_uxsxos.png"
                alt={alt}
                className="object-contain"
            />
            <AvatarFallback>i</AvatarFallback>
        </Avatar>
    )
}

export default InsertIcon