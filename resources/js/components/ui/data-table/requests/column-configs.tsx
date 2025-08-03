import React from 'react';
import { OCDRequest } from '@/types';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/utils/date-formatter';

// Status badge renderer utility
export const statusBadgeRenderer = (status: OCDRequest['status']) => {
    let color: "teal" | "cyan" | "amber" | "green" | "blue" | "red" | "orange" | "yellow" | "lime" | "emerald" | "sky" | "indigo" | "violet" | "purple" | "fuchsia" | "pink" | "rose" | "zinc" | undefined;

    switch (status.status_code) {
        case 'draft':
            color = 'zinc';
            break;
        case 'under_review':
            color = 'amber';
            break;
        case 'validated':
            color = 'green';
            break;
        case 'offer_made':
            color = 'blue';
            break;
        case 'in_implementation':
            color = 'blue';
            break;
        case 'rejected':
        case 'unmatched':
            color = 'red';
            break;
        case 'closed':
            color = "teal";
            break;
        default:
            color = 'zinc';
    }

    return <Badge color={color}>{status.status_label}</Badge>;
};

// Column configuration for Admin interface
export const adminColumns = [
    {
        key: 'id',
        label: 'ID',
        sortable: true,
        sortField: 'id' as const,
        render: (request: OCDRequest) => (
            <span className="font-medium">#{request.id}</span>
        )
    },
    {
        key: 'title',
        label: 'Title',
        render: (request: OCDRequest) => (
            <div className="max-w-xs">
                <span className="truncate">{request.detail?.capacity_development_title || 'No Title'}</span>
            </div>
        )
    },
    {
        key: 'user',
        label: 'Submitted By',
        sortable: true,
        sortField: 'user_id' as const,
        render: (request: OCDRequest) => (
            <div className="flex flex-col">
                <span className="font-medium">{request.user.name}</span>
                <span className="text-xs text-gray-500">{request.user.email}</span>
            </div>
        )
    },
    {
        key: 'created_at',
        label: 'Submitted At',
        sortable: true,
        sortField: 'created_at' as const,
        render: (request: OCDRequest) => (
            <span className="text-zinc-500">{formatDate(request.created_at)}</span>
        )
    },
    {
        key: 'status',
        label: 'Status',
        sortable: true,
        sortField: 'status_id' as const,
        render: (request: OCDRequest) => statusBadgeRenderer(request.status)
    }
];

// Column configuration for User interface (different columns for user's own requests)
export const userColumns = [
    {
        key: 'title',
        label: 'Request Title',
        render: (request: OCDRequest) => (
            <div>
                <div className="font-medium">{request.detail?.capacity_development_title || 'No Title'}</div>
                <div className="text-sm text-gray-500 truncate max-w-md">
                    {request.detail?.gap_description}
                </div>
            </div>
        )
    },
    {
        key: 'created_at',
        label: 'Submitted',
        sortable: true,
        sortField: 'created_at' as const,
        render: (request: OCDRequest) => (
            <div>
                <div>{formatDate(request.created_at, 'en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                })}</div>
                <div className="text-gray-500">{formatDate(request.created_at, 'en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                })}</div>
            </div>
        )
    },
    {
        key: 'status',
        label: 'Status',
        render: (request: OCDRequest) => (
            <div className="flex flex-col items-start">
                {statusBadgeRenderer(request.status)}
            </div>
        )
    },
    {
        key: 'completion_date',
        label: 'Target Completion',
        render: (request: OCDRequest) => (
            <span className="text-gray-600">
                {request.detail?.completion_date ?
                    formatDate(request.detail?.completion_date, 'en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                    }) :
                    'Not specified'
                }
            </span>
        )
    }
];

// Column configuration for Public/Partner interface (for browsing validated requests)
export const publicColumns = [
    {
        key: 'title',
        label: 'Opportunity',
        render: (request: OCDRequest) => (
            <div>
                <div className="font-medium text-blue-600 hover:text-blue-800">
                    {request.detail?.capacity_development_title || 'No Title'}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                    {request.detail.subthemes && request.detail?.subthemes.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                            {request.detail.subthemes.slice(0, 2).map((theme, index) => (
                                <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                    {theme}
                                </span>
                            ))}
                            {request.detail.subthemes.length > 2 && (
                                <span className="text-xs text-gray-500">+{request.detail?.subthemes.length - 2} more</span>
                            )}
                        </div>
                    )}
                </div>
            </div>
        )
    },
    {
        key: 'activity_type',
        label: 'Type',
        render: (request: OCDRequest) => (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                {request.detail.related_activity}
            </span>
        )
    },
    {
        key: 'location',
        label: 'Location',
        render: (request: OCDRequest) => (
            <div className="text-sm">
                {request.detail.delivery_countries && request.detail.delivery_countries.length > 0 ? (
                    <div>
                        {request.detail.delivery_countries.slice(0, 2).join(', ')}
                        {request.detail.delivery_countries.length > 2 && (
                            <span className="text-gray-500"> +{request.detail.delivery_countries.length - 2} more</span>
                        )}
                    </div>
                ) : (
                    <span className="text-gray-500">Location not specified</span>
                )}
            </div>
        )
    },
    {
        key: 'beneficiaries',
        label: 'Beneficiaries',
        render: (request: OCDRequest) => (
            <div className="text-sm">
                <div className="font-medium">{request.detail.direct_beneficiaries_number || 'N/A'}</div>
                <div className="text-gray-500 text-xs">{request.detail.direct_beneficiaries}</div>
            </div>
        )
    },
    {
        key: 'timeline',
        label: 'Timeline',
        render: (request: OCDRequest) => (
            <div className="text-sm">
                <div>{request.detail.support_months ? `${request.detail.support_months} months` : 'Not specified'}</div>
                {request.detail.completion_date && (
                    <div className="text-gray-500 text-xs">
                        Due: {formatDate(request.detail.completion_date, 'en-US', {
                            year: 'numeric',
                            month: 'short'
                        })}
                    </div>
                )}
            </div>
        )
    }
];
