import React from 'react'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Star } from 'lucide-react'

const EachProject = () => {
    return (
        <div className="bg-[#e9f4ff] dark:bg-[#2521218c] rounded-md px-6 py-10 border-[1.5px] border-gray-300 dark:border-gray-700 shadow-sm hover:bg-[#fafcff] dark:hover:bg-[#232323] transition-colors duration-200">
            
            {/* Top Row */}
            <div className="flex justify-between gap-4 items-center mb-2">
                <div className="flex gap-2 items-center">
                    <img
                        src="https://via.placeholder.com/28"
                        alt="avatar"
                        className="w-7 h-7 rounded-full"
                    />
                    <span className="text-sm text-gray-400">
                        username <span className="text-gray-500">contributed to</span> repo/name
                    </span>
                </div>
                <span className="text-xs text-gray-500">2 days ago</span>
            </div>

            {/* Title */}
            <div className="text-xl font-semibold">
                feat(cluster): Add btn to check machine availability <span className="text-gray-500">#2970</span>
            </div>

            {/* Badge */}
            <div className="mt-2">
                <Badge className="bg-purple-700 rounded-full px-2 py-0.5">Merged</Badge>
            </div>
        </div>
    )
}

export default EachProject
