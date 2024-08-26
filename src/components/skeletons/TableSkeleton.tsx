import React from 'react';
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from '../ui/table';
import { Skeleton } from '../ui/skeleton';

const TableSkeleton = () => {
    const skeletonRows = Array(5).fill(null)

    return (
        <Table className="border-collapse separate md:table px-8 py-2">
            <TableHeader className="block md:table-header-group">
                <TableRow className="border border-grey-500 md:border-none block md:table-row">
                    <TableHead className="rounded-tl-md rounded-bl-md bg-slate-50 p-2 text-black font-bold text-center md:border md:border-grey-500 block md:table-cell">
                        Problem Name
                    </TableHead>
                    <TableHead className="bg-slate-50 p-2 text-black font-bold text-center md:border md:border-grey-500 block md:table-cell">
                        Link
                    </TableHead>
                    <TableHead className="bg-slate-50 p-2 text-black font-bold text-center md:border md:border-grey-500 block md:table-cell">
                        Difficulty
                    </TableHead>
                    <TableHead className="rounded-tr-md rounded-br-md bg-slate-50 p-2 text-black font-bold text-center md:border md:border-grey-500 block md:table-cell">
                        Delete
                    </TableHead>
                </TableRow>
            </TableHeader>
            <TableBody className="block md:table-row-group px-6">
                {skeletonRows.map((_, index) => (
                    <TableRow key={index} className="bg-gray-50 my-4 border-2 rounded-md block md:table-row">
                        <TableCell className="p-2 px-4 text-center block md:table-cell">
                            <Skeleton className="h-6 w-24 md:w-32" />
                        </TableCell>
                        <TableCell className="p-2 px-4 text-left block md:table-cell">
                            <Skeleton className="h-6 w-48 md:w-64" />
                        </TableCell>
                        <TableCell className="p-2 px-4 text-center block md:table-cell">
                            <Skeleton className="h-6 w-16 md:w-24" />
                        </TableCell>
                        <TableCell className="p-2 px-4 text-center block md:table-cell">
                            <Skeleton className="h-8 w-16 md:w-24" />
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};

export default TableSkeleton;
