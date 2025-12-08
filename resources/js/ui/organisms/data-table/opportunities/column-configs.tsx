import React from 'react';
import { Opportunity } from '@/types';
import { formatDate, opportunityStatusBadgeRenderer } from '@shared/utils';


// Column configuration for Admin interface
export const adminColumns = [
    {
        key: 'id',
        label: 'ID',
        sortable: true,
        sortField: 'id' as const,
        render: (opportunity: Opportunity) => (
            <span className="font-medium">#{opportunity.id}</span>
        )
    },
    {
        key: 'title',
        label: 'Title',
        sortable: true,
        sortField: 'title' as const,
        render: (opportunity: Opportunity) => (
            <div className="max-w-xs">
                <span className="truncate font-medium text-wrap">{opportunity.title}</span>
            </div>
        )
    },
    {
        key: 'type',
        label: 'Type',
        sortable: true,
        sortField: 'type' as const,
        render: (opportunity: Opportunity) => (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                {opportunity.type.label}
            </span>
        )
    },
    {
        key: 'user',
        label: 'Submitted By',
        render: (opportunity: Opportunity) => (
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
        render: (opportunity: Opportunity) => (
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
        render: (opportunity: Opportunity) => opportunityStatusBadgeRenderer(opportunity)
    }
];

// Column configuration for Partner interface (for partner's own opportunities)
export const partnerColumns = [
    {
        key: 'title',
        label: 'Opportunity Title',
        render: (opportunity: Opportunity) => (
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
        render: (opportunity: Opportunity) => (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                {opportunity.type.label}
            </span>
        )
    },
    {
        key: 'closing_date',
        label: 'Closing Date',
        sortable: true,
        sortField: 'created_at' as const,
        render: (opportunity: Opportunity) => (
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
        render: (opportunity: Opportunity) => (
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
        render: (opportunity: Opportunity) => (
            <div className="flex flex-col items-start">
                {opportunityStatusBadgeRenderer(opportunity)}
            </div>
        )
    }
];
