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

    return (
        <div className="my-6">
            <div className="flex items-center mb-[20px] text-md">
                <label htmlFor="year-select" className="mr-2 font-medium">
                    Select Year:
                </label>
                <div className="min-w-[80px]">
                    <Select value={selectedYear} onValueChange={handleYearChange}>
                        <SelectTrigger className="border-2 cursor-pointer w-full">
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

            <p className="text-sm text-muted-foreground mb-4">
                Showing: {formatDate(startDate)} – {formatDate(endDate)}
            </p>

            <div className="px-2 py-3 lg:px-6 lg:py-4 border-[1px] rounded-sm">
                <CalendarHeatmap
                    startDate={startDate}
                    endDate={endDate}
                    values={data}
                    classForValue={(value) => {
                        if (!value || !value.count) return 'color-empty'
                        return value.count < 5
                            ? `color-github-${value.count}`
                            : `color-github-5`
                    }}
                    tooltipDataAttrs={(value: any) => {
                        const dateStr = formatDate(value.date)
                        return {
                            'data-tooltip-id': 'heatmap-tooltip',
                            'data-tooltip-content': `${value.count ?? 0} submissions on ${dateStr}`
                        }
                    }}
                    showWeekdayLabels={false}
                />
                <Tooltip id="heatmap-tooltip" />
            </div>
        </div>
    )
}

export default Heatmap
