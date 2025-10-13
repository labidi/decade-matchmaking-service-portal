import React from 'react';
import { IOCPlatform, IOCPlatformsList } from '@/types';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/components/ui/table';

interface IOCPlatformsDataTableProps {
    platforms: IOCPlatformsList;
}

export function IOCPlatformsDataTable({ platforms }: Readonly<IOCPlatformsDataTableProps>) {
    if (platforms.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                <p>No IOC platforms found.</p>
            </div>
        );
    }

    return (
        <Table bleed className="[--gutter:--spacing(6)] sm:[--gutter:--spacing(8)]">
            <TableHead>
                <TableRow>
                    <TableHeader>Name</TableHeader>
                    <TableHeader>Description</TableHeader>
                    <TableHeader>Link</TableHeader>
                    <TableHeader>Contact</TableHeader>
                </TableRow>
            </TableHead>
            <TableBody>
                {platforms.map((platform) => (
                    <TableRow key={platform.id}>
                        <TableCell className="font-medium text-wrap">
                            {platform.name}
                        </TableCell>
                        <TableCell className='text-wrap'>
                            {platform.description ? (
                                <span className="text-sm text-gray-600">
                                    {platform.description}
                                </span>
                            ) : (
                                <span className="text-sm text-gray-400 italic">No description</span>
                            )}
                        </TableCell>
                        <TableCell>
                            {platform.link ? (
                                <a
                                    href={platform.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 underline text-sm"
                                >
                                    Visit Platform
                                </a>
                            ) : (
                                <span className="text-sm text-gray-400 italic">No link</span>
                            )}
                        </TableCell>
                        <TableCell>
                            {platform.contact ? (
                                <span className="text-sm text-gray-600">
                                    {platform.contact}
                                </span>
                            ) : (
                                <span className="text-sm text-gray-400 italic">No contact</span>
                            )}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}