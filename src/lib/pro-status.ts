export type ProBadgeState = 'none' | 'expired' | 'active'

type ProStatusLike = {
    active?: boolean | null;
    plan?: string | null;
    startedAt?: string | Date | null;
    expiresAt?: string | Date | null;
    autoRenew?: boolean | null;
    cancelledAt?: string | Date | null;
    badgeState?: ProBadgeState | null;
} | null | undefined

const toDate = (value?: string | Date | null) => {
    if (!value) return null

    const parsed = value instanceof Date ? value : new Date(value)
    return Number.isNaN(parsed.getTime()) ? null : parsed
}

export function getProStatusView(status: ProStatusLike) {
    const expiresAt = toDate(status?.expiresAt)
    const cancelledAt = toDate(status?.cancelledAt)
    const hasHistory = Boolean(
        status?.active ||
        status?.plan ||
        status?.startedAt ||
        status?.expiresAt ||
        status?.cancelledAt
    )

    const isExpiredByDate = expiresAt ? expiresAt.getTime() <= Date.now() : false
    const active = Boolean(status?.active) && !isExpiredByDate
    const badgeState: ProBadgeState = active ? 'active' : hasHistory ? 'expired' : 'none'

    return {
        active,
        badgeState,
        hasHistory,
        plan: status?.plan ?? null,
        startedAt: toDate(status?.startedAt),
        expiresAt,
        autoRenew: Boolean(status?.autoRenew),
        cancelledAt,
    }
}

export function normalizeProStatus<T extends ProStatusLike>(status: T) {
    if (!status) return null

    const view = getProStatusView(status)

    return {
        ...status,
        active: view.active,
        badgeState: view.badgeState,
    }
}