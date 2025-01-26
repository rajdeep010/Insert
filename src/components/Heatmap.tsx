'use client'
import React, { useState, useEffect } from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import { useParams } from 'next/navigation';
import { useUser } from '@/app/context/UserProvider';
import { useSession } from 'next-auth/react';
import { HeatmapDateValues } from '@/types/types';
import HeatmapTooltip from './HeatmapTooltip';
import { useTopics } from '@/app/context/TopicProvider';
import HeatmapSkeleton from './skeletons/HeatmapSkeleton';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

const Heatmap = () => {
    const params = useParams()
    const username = params.username as string
    const { data: session, status } = useSession()

    const years = []
    for (let year = new Date().getFullYear(); year >= 2024; year--) {
        years.push(year)
    }

    const { user_information } = useUser()
    const { isHeatmapLoading, user_heatmapValues } = useTopics()

    let heatmapValues = user_heatmapValues

    const [selectedYear, setSelectedYear] = useState(String(years[0]))
    const [filteredValues, setFilteredValues] = useState<HeatmapDateValues[]>([]);
    const [tooltipContent, setTooltipContent] = useState('');
    const [tooltipPosition, setTooltipPosition] = useState<{ x: number, y: number }>({ x: 0, y: 0 });
    const [showTooltip, setShowTooltip] = useState(false)


    const handleYearChange = (value: string) => {
        setSelectedYear(value);
    }



    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        const day = date.getDate();
        const month = date.toLocaleString('default', { month: 'short' });
        const year = date.getFullYear();

        const getOrdinalSuffix = (day: number): string => {
            if (day > 3 && day < 21) return 'th'
            switch (day % 10) {
                case 1: return 'st'
                case 2: return 'nd'
                case 3: return 'rd'
                default: return 'th'
            }
        }

        return `${day}${getOrdinalSuffix(day)} ${month} ${year}`
    }

    const handleMouseOver = (event: React.MouseEvent, value: HeatmapDateValues | null) => {
        if (value) {
            setTooltipContent(`${value.count} actions on ${formatDate(value.date)}`)
            setTooltipPosition({ x: event.clientX, y: event.clientY })
            setShowTooltip(true)
        } else {
            const target = event.currentTarget as HTMLElement
            const date = target.getAttribute('data-date')
            // // console.log(event, date)
            if (date) {
                setTooltipContent(`0 actions on ${formatDate(date)}`)
                setTooltipPosition({ x: event.clientX, y: event.clientY })
                setShowTooltip(true)
            } else {
                setTooltipContent(`No actions`)
                setTooltipPosition({ x: event.clientX, y: event.clientY })
                setShowTooltip(true)
            }
        }
    }

    const handleMouseOut = () => {
        setShowTooltip(false)
        setTooltipContent('')
    }

    useEffect(() => {
        const startOfYear = new Date(Number(selectedYear), 0, 1)
        const endOfYear = selectedYear === new Date().getFullYear().toString() ? new Date() : new Date(Number(selectedYear), 11, 31)

        const filtered = heatmapValues.filter(value => {
            const date = new Date(value.date)
            const valueDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
            return valueDate >= startOfYear && valueDate <= endOfYear
        })

        setFilteredValues(filtered)
    }, [selectedYear, heatmapValues])


    if (isHeatmapLoading) {
        return <HeatmapSkeleton />
    }

    return (
        <div className='my-6'>
            <div className='flex items-center mb-[20px] text-md'>

                <label htmlFor="year-select" className='mr-2 font-medium'>Select Year:</label>

                <div className='min-w-[80px]'>
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

                {/* 
                <select className='border-2 cursor-pointer' id="year-select" value={selectedYear} onChange={handleYearChange}>
                    {years.map((year) => (
                        <option className='cursor-pointer' key={year} value={year}>{year}</option>
                    ))}
                </select> */}
            </div>

            <div className='px-6 py-4 border-2 rounded-md'>
                <CalendarHeatmap
                    startDate={new Date(`${selectedYear}-01-01`)}
                    endDate={new Date(`${selectedYear}-12-31`)}
                    values={filteredValues}
                    classForValue={(value: any) => {
                        if (!value) {
                            return 'color-empty';
                        }
                        return `color-scale-${value.count}`;
                    }}
                    tooltipDataAttrs={(value: any) => {
                        return { 'data-date': value.date };
                    }}
                    onMouseOver={(event, value) => handleMouseOver(event, value as HeatmapDateValues)}
                    onMouseLeave={handleMouseOut}
                />

                <HeatmapTooltip
                    content={tooltipContent}
                    position={tooltipPosition}
                    show={showTooltip}
                />
            </div>
        </div>
    )
}

export default Heatmap