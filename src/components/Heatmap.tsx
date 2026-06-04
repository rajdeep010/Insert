import React, { useEffect, useState } from 'react'
import CalendarHeatmap from 'react-calendar-heatmap'
import { Tooltip } from 'react-tooltip'
import 'react-calendar-heatmap/dist/styles.css'
import 'react-tooltip/dist/react-tooltip.css'
import { useInsertTopics } from '@/features/topic/context/InsertTopicProvider'
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectValue,
    SelectGroup,
    SelectLabel,
    SelectItem
} from '@/components/ui/select'
import type { HeatmapDateValues } from '@/types/topic'
import HeatmapSkeleton from './skeletons/HeatmapSkeleton'

const Heatmap = () => {
    const years = []
    for (let year = new Date().getFullYear(); year >= 2024; year--) {
        years.push(year)
    }

    const { isHeatmapLoading, user_heatmapValues } = useInsertTopics()
    const [selectedYear, setSelectedYear] = useState(String(years[0]))
    const [filteredValues, setFilteredValues] = useState<HeatmapDateValues[]>([])
    const [startDate, setStartDate] = useState<Date>(new Date())
    const [endDate, setEndDate] = useState<Date>(new Date())

    const handleYearChange = (value: string) => setSelectedYear(value)

    function shiftDate(date: Date, numDays: number): Date {
        const newDate = new Date(date)
        newDate.setDate(newDate.getDate() + numDays)
        return newDate
    }

    function formatDate(dateInput: Date | string): string {
        const date = new Date(dateInput)
        const day = date.getDate()
        const month = date.toLocaleString('default', { month: 'long' })
        const year = date.getFullYear()

        const suffix =
            day > 3 && day < 21
                ? 'th'
                : ['st', 'nd', 'rd'][(day % 10) - 1] || 'th'

        return `${day}${suffix} ${month}, ${year}`
    }

    useEffect(() => {
        const now = new Date()
        const selected = Number(selectedYear)
        const currentYear = now.getFullYear()

        let start: Date
        let end: Date

        if (selected === currentYear) {
            // Last 365 days
            end = now
            start = shiftDate(end, -364)
        } else if (selected < currentYear) {
            // Full calendar year (Jan 1 - Dec 31)
            start = new Date(selected, 0, 1)
            end = new Date(selected, 11, 31)
        } else {
            // Future year: show trailing 12 months
            end = new Date(selected, now.getMonth(), now.getDate())
            start = new Date(selected - 1, now.getMonth(), now.getDate() + 1)
        }

        setStartDate(start)
        setEndDate(end)

        const filtered = user_heatmapValues?.filter(({ date }) => {
            const d = new Date(date)
            return d >= start && d <= end
        }) ?? []

        setFilteredValues(filtered)
    }, [selectedYear, user_heatmapValues])

    if (!user_heatmapValues) return null
    if (isHeatmapLoading) return <HeatmapSkeleton />

    // Map dates for quick lookup
    const valueMap = new Map<string, number>()
    filteredValues.forEach(({ date, count }) => {
        valueMap.set(new Date(date).toDateString(), count)
    })

    // Build data array between startDate and endDate
    const oneDay = 24 * 60 * 60 * 1000
    const data: { date: Date; count: number }[] = []

    for (
        let d = new Date(startDate);
        d <= endDate;
        d = new Date(d.getTime() + oneDay)
    ) {
        const key = d.toDateString()
        data.push({
            date: new Date(d),
            count: valueMap.get(key) ?? 0
        })
    }

    const totalSubmissions = filteredValues.reduce((sum, value) => sum + value.count, 0)
    const activeDays = filteredValues.filter((value) => value.count > 0).length

    return (
        <section className="my-6 rounded-2xl border border-border bg-card">
            <div className="flex flex-col gap-4 border-b border-border px-4 py-4 sm:px-6 sm:py-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-1">
                    <h3 className="text-lg font-semibold tracking-tight text-foreground">
                        Activity heatmap
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        {totalSubmissions} submissions across {activeDays} active days
                    </p>
                </div>

                <div className="flex items-center gap-3 text-sm">
                    <label htmlFor="year-select" className="font-medium text-muted-foreground">
                        Year
                    </label>
                    <div className="min-w-[104px]">
                        <Select value={selectedYear} onValueChange={handleYearChange}>
                            <SelectTrigger id="year-select" className="h-9 w-full rounded-lg">
                                <SelectValue placeholder="Select a year" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Years</SelectLabel>
                                    {years.map((year) => (
                                        <SelectItem key={year} value={String(year)}>
                                            {year}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            <div className="px-4 py-4 sm:px-6 sm:py-5">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-muted-foreground">
                        {formatDate(startDate)} to {formatDate(endDate)}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>Less</span>
                        <div className="flex items-center gap-1">
                            <span className="h-2.5 w-2.5 rounded-[3px] bg-[rgba(148,163,184,0.18)] dark:bg-[rgba(148,163,184,0.2)]" />
                            <span className="h-2.5 w-2.5 rounded-[3px] bg-[rgba(34,197,94,0.18)]" />
                            <span className="h-2.5 w-2.5 rounded-[3px] bg-[rgba(34,197,94,0.34)]" />
                            <span className="h-2.5 w-2.5 rounded-[3px] bg-[rgba(22,163,74,0.56)]" />
                            <span className="h-2.5 w-2.5 rounded-[3px] bg-[rgba(21,128,61,0.82)]" />
                        </div>
                        <span>More</span>
                    </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-border bg-background p-3 sm:p-4">
                    <div className="min-w-[760px] heatmap-shell">
                        <CalendarHeatmap
                            startDate={startDate}
                            endDate={endDate}
                            values={data}
                            classForValue={(value) => {
                                if (!value || !value.count) return 'insert-heatmap-empty'
                                if (value.count === 1) return 'insert-heatmap-level-1'
                                if (value.count === 2) return 'insert-heatmap-level-2'
                                if (value.count <= 4) return 'insert-heatmap-level-3'
                                return 'insert-heatmap-level-4'
                            }}
                            tooltipDataAttrs={(value: any) => {
                                const dateStr = formatDate(value.date)
                                return {
                                    'data-tooltip-id': 'heatmap-tooltip',
                                    'data-tooltip-content': `${value.count ?? 0} actions on ${dateStr}`
                                }
                            }}
                            showWeekdayLabels={false}
                        />
                    </div>
                    <Tooltip
                        id="heatmap-tooltip"
                        className="insert-heatmap-tooltip"
                        opacity={1}
                        offset={10}
                    />
                </div>
            </div>
        </section>
    )
}

export default Heatmap
