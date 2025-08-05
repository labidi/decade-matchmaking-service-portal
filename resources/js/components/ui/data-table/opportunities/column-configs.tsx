import React from 'react';
import { OCDOpportunity } from '@/types';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/utils/date-formatter';

// Status badge renderer utility for opportunities
export const statusBadgeRenderer = (status: number, statusLabel: string) => {
    let color: "teal" | "cyan" | "amber" | "green" | "blue" | "red" | "orange" | "yellow" | "lime" | "emerald" | "sky" | "indigo" | "violet" | "purple" | "fuchsia" | "pink" | "rose" | "zinc" | undefined;

    switch (status) {
        case 1: // ACTIVE
            color = 'green';
            break;
        case 2: // CLOSED
            color = 'zinc';
            break;
        case 3: // REJECTED
            color = 'red';
            break;
        case 4: // PENDING_REVIEW
            color = 'amber';
            break;
        default:
            color = 'zinc';
    }

    return <Badge color={color}>{statusLabel}</Badge>;
};

// Column configuration for Admin interface
export const adminColumns = [
    {
        key: 'id',
        label: 'ID',
        sortable: true,
        sortField: 'id' as const,
        render: (opportunity: OCDOpportunity) => (
            <span className="font-medium">#{opportunity.id}</span>
        )
    },
    {
        key: 'title',
        label: 'Title',
        sortable: true,
        sortField: 'title' as const,
        render: (opportunity: OCDOpportunity) => (
            <div className="max-w-xs">
                <span className="truncate font-medium">{opportunity.title}</span>
            </div>
        )
    },
    {
        key: 'type',
        label: 'Type',
        sortable: true,
        sortField: 'type' as const,
        render: (opportunity: OCDOpportunity) => (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                {opportunity.type_label || opportunity.type}
            </span>
        )
    },
    {
        key: 'user',
        label: 'Submitted By',
        render: (opportunity: OCDOpportunity) => (
            <div className="flex flex-col">
                <span className="font-medium">{opportunity.user?.name ?? 'N/A'}</span>
                <span className="text-xs text-gray-500">{opportunity.user?.email ?? ''}</span>
            </div>
        )
    },
    {
        key: 'closing_date',
        label: 'Closing Date',
        sortable: true,
        sortField: 'closing_date' as const,
        render: (opportunity: OCDOpportunity) => (
            <span className="text-zinc-500">
                {opportunity.closing_date ? formatDate(opportunity.closing_date) : 'N/A'}
            </span>
        )
    },
    {
        key: 'status',
        label: 'Status',
        sortable: true,
        sortField: 'status' as const,
        render: (opportunity: OCDOpportunity) => statusBadgeRenderer(opportunity.status, opportunity.status_label)
    }
];

// Column configuration for Partner interface (for partner's own opportunities)
export const partnerColumns = [
    {
        key: 'title',
        label: 'Opportunity Title',
        render: (opportunity: OCDOpportunity) => (
            <div>
                <div className="font-medium">{opportunity.title}</div>
                <div className="text-sm text-gray-500 truncate max-w-md">
                    {opportunity.summary}
                </div>
            </div>
        )
    },
    {
        key: 'type',
        label: 'Type',
        render: (opportunity: OCDOpportunity) => (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                {opportunity.type_label || opportunity.type}
            </span>
        )
    },
    {
        key: 'closing_date',
        label: 'Closing Date',
        render: (opportunity: OCDOpportunity) => (
            <div>
                <div>{opportunity.closing_date ?
                    formatDate(opportunity.closing_date, 'en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                    }) : 'No deadline'
                }</div>
                {opportunity.closing_date && (
                    <div className="text-gray-500 text-xs">
                        {new Date(opportunity.closing_date) > new Date() ? 'Open' : 'Closed'}
                    </div>
                )}
            </div>
        )
    },
    {
        key: 'created_at',
        label: 'Published',
        sortable: true,
        sortField: 'created_at' as const,
        render: (opportunity: OCDOpportunity) => (
            <div>
                <div>{formatDate(opportunity.created_at, 'en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                })}</div>
                <div className="text-gray-500 text-xs">{formatDate(opportunity.created_at, 'en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                })}</div>
            </div>
        )
    },
    {
        key: 'status',
        label: 'Status',
        render: (opportunity: OCDOpportunity) => (
            <div className="flex flex-col items-start">
                {statusBadgeRenderer(opportunity.status, opportunity.status_label)}
            </div>
        )
    }
];

// Column configuration for Public interface (for browsing opportunities)
export const publicColumns = [
    {
        key: 'title',
        label: 'Opportunity',
        render: (opportunity: OCDOpportunity) => (
            <div>
                <div className="font-medium text-blue-600 hover:text-blue-800">
                    {opportunity.title}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                    <span>{opportunity.user?.name ?? 'Organization'}</span>
                </div>
            </div>
        )
    },
    {
        key: 'type',
        label: 'Type',
        render: (opportunity: OCDOpportunity) => (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                {opportunity.type_label || opportunity.type}
            </span>
        )
    },
    {
        key: 'implementation_location',
        label: 'Location',
        render: (opportunity: OCDOpportunity) => (
            <div className="text-sm">
                {opportunity.implementation_location ? (
                    <span>{opportunity.implementation_location}</span>
                ) : (
                    <span className="text-gray-500">Location not specified</span>
                )}
            </div>
        )
    },
    {
        key: 'closing_date',
        label: 'Application Deadline',
        render: (opportunity: OCDOpportunity) => (
            <div className="text-sm">
                {opportunity.closing_date ? (
                    <div>
                        <div className="font-medium">
                            {formatDate(opportunity.closing_date, 'en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                            })}
                        </div>
                        <div className={`text-xs ${
                            new Date(opportunity.closing_date) > new Date()
                                ? 'text-green-600'
                                : 'text-red-600'
                        }`}>
                            {new Date(opportunity.closing_date) > new Date() ? 'Open' : 'Closed'}
                        </div>
                    </div>
                ) : (
                    <span className="text-gray-500">No deadline</span>
                )}
            </div>
        )
    },
    {
        key: 'target_audience',
        label: 'Target Audience',
        render: (opportunity: OCDOpportunity) => (
            <div className="text-sm">
                {opportunity.target_audience ? (
                    <div className="font-medium">{opportunity.target_audience}</div>
                ) : (
                    <span className="text-gray-500">Not specified</span>
                )}
            </div>
        )
    }
];
