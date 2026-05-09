import { BadgeCheck } from 'lucide-react'

import type { ProBadgeState } from '@/lib/pro-status'

type ProBadgeIconProps = {
    state?: ProBadgeState | null
    size?: number
}

export default function ProBadgeIcon({ state = 'none', size = 14 }: ProBadgeIconProps) {
    if (state === 'none') {
        return null
    }

    const isActive = state === 'active'

    return (
        <span
            className={`inline-flex items-center justify-center rounded-full ${isActive ? 'bg-blue-500' : 'bg-slate-400'} ml-1`}
            style={{ width: size + 2, height: size + 2 }}
            aria-label={isActive ? 'Pro active' : 'Pro expired'}
            title={isActive ? 'Pro active' : 'Pro expired'}
        >
            <BadgeCheck className="text-white" size={size} strokeWidth={3} />
        </span>
    )
}