import React from 'react';
import { Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Link } from '@inertiajs/react';
import { Opportunity } from '@/types';

interface OpportunitiesDialogProps {
    open: boolean;
    onClose: () => void;
    opportunities: Opportunity[];
}

export default function OpportunitiesDialog({ open, onClose, opportunities }: OpportunitiesDialogProps) {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString();
    };

    const formatLocation = (locations: Array<{ value: string; label: string }>) => {
        if (!locations || locations.length === 0) {
            return 'Not specified';
        }

        if (locations[0]?.label === 'Global') {
            return 'Global';
        }

        if (locations.length === 1) {
            return locations[0].label;
        }

        return `${locations[0].label} +${locations.length - 1} more`;
    };

    const formatTargetAudience = (audiences: Array<{ value: string; label: string }>) => {
        if (!audiences || audiences.length === 0) {
            return 'All audiences';
        }

        if (audiences.length === 1) {
            return audiences[0].label;
        }

        return `${audiences[0].label} +${audiences.length - 1} more`;
    };

    const getDaysRemaining = (closingDate: string) => {
        const today = new Date();
        const closing = new Date(closingDate);
        const diffTime = closing.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return Math.max(0, diffDays);
    };

    const isClosingSoon = (closingDate: string) => {
        return getDaysRemaining(closingDate) <= 7;
    };

    return (
        <Dialog open={open} onClose={onClose} size="5xl">
            <DialogTitle>Recent Partner Opportunities</DialogTitle>
            <DialogDescription>
                Explore the latest capacity development opportunities from our partners.
            </DialogDescription>

            <DialogBody>
                {opportunities.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-sm text-gray-600">No active opportunities available.</div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <Table className="[--gutter:--spacing(6)] sm:[--gutter:--spacing(8)]">
                            <TableHead>
                                <TableRow>
                                    <TableHeader>Title</TableHeader>
                                    <TableHeader>Type</TableHeader>
                                    <TableHeader>Closing Date</TableHeader>
                                    <TableHeader>Location</TableHeader>
                                    <TableHeader>Target Audience</TableHeader>
                                    <TableHeader>Action</TableHeader>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {opportunities.map((opportunity) => (
                                    <TableRow key={opportunity.id}>
                                        <TableCell>
                                            <div>
                                                <Link
                                                    href={route('opportunity.show', opportunity.id)}
                                                    className="font-medium text-blue-600 hover:text-blue-500 hover:underline"
                                                >
                                                    {opportunity.title}
                                                </Link>
                                                {opportunity.summary && (
                                                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                                        {opportunity.summary}
                                                    </p>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge color="blue">
                                                {opportunity.type.label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <div className="text-sm">
                                                    {formatDate(opportunity.closing_date)}
                                                </div>
                                                <div className={`text-xs ${isClosingSoon(opportunity.closing_date) ? 'text-red-500' : 'text-gray-500'}`}>
                                                    {getDaysRemaining(opportunity.closing_date)} days remaining
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            {formatLocation(opportunity.implementation_location)}
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            {formatTargetAudience(opportunity.target_audience)}
                                        </TableCell>
                                        <TableCell>
                                            <Link
                                                href={route('opportunity.show', opportunity.id)}
                                                className="text-blue-600 hover:text-blue-500 text-sm hover:underline"
                                            >
                                                View Details
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </DialogBody>

            <DialogActions>
                <Button color="firefly" onClick={onClose}>
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
}
