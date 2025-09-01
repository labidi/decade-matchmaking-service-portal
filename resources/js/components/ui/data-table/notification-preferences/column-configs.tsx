import React from 'react';
import { Badge } from '@/components/ui/badge';
import {
    UserNotificationPreference,
    NotificationPreferenceTableColumn,
    NotificationPreferenceToggleType,
} from '@/types';
import { PreferenceToggleCell } from './preference-toggle-cell';

const NOTIFICATION_ENTITY_ATTRIBUTES = {
    request: {
        subtheme: 'Subtheme',
        coverage_activity: 'Coverage Activity',
        support_type: 'Support Type',
        target_audience: 'Target Audience'
    },
    opportunity: {
        type: 'Opportunity Type',
        location: 'Location',
        category: 'Category'
    }
} as const;
interface ColumnConfigsProps {
    onToggle: (preference: UserNotificationPreference, type: NotificationPreferenceToggleType) => void;
    updating?: boolean;
}

export function getNotificationPreferenceColumns({
    onToggle,
    updating = false
}: ColumnConfigsProps): NotificationPreferenceTableColumn[] {
    return [
        {
            key: 'entity_type',
            label: 'Type',
            sortable: true,
            sortField: 'entity_type',
            className: 'font-medium',
            headerClassName: 'min-w-[80px]',
            render: (preference: UserNotificationPreference) => (
                <Badge
                    color={preference.entity_type === 'request' ? 'blue' : 'green'}
                    className="capitalize text-xs"
                >
                    {preference.entity_type}
                </Badge>
            )
        },
        {
            key: 'attribute_type',
            label: 'Attribute',
            sortable: true,
            sortField: 'attribute_type',
            headerClassName: 'min-w-[100px]',
            render: (preference: UserNotificationPreference) => {
                const entityAttributes = NOTIFICATION_ENTITY_ATTRIBUTES[preference.entity_type as keyof typeof NOTIFICATION_ENTITY_ATTRIBUTES];
                const displayName = entityAttributes?.[preference.attribute_type as keyof typeof entityAttributes] || preference.attribute_type;
                return (
                    <span className="font-medium text-zinc-900 dark:text-zinc-100 text-sm">
                        {displayName}
                    </span>
                );
            }
        },
        {
            key: 'attribute_value',
            label: 'Value',
            sortable: true,
            sortField: 'attribute_value',
            className: 'max-w-[200px] truncate',
            headerClassName: 'min-w-[120px]',
            render: (preference: UserNotificationPreference) => (
                <span
                    className="text-zinc-700 dark:text-zinc-300 text-sm block truncate"
                    title={preference.attribute_value}
                >
                    {preference.attribute_value}
                </span>
            )
        },
        {
            key: 'email_notification_enabled',
            label: 'Email Notifications',
            className: 'text-center',
            headerClassName: 'text-center min-w-[120px]',
            render: (preference: UserNotificationPreference) => (
                <PreferenceToggleCell
                    preference={preference}
                    type="email_notification_enabled"
                    onToggle={(preference) => onToggle(preference, "email_notification_enabled")}
                    disabled={updating}
                />
            )
        },
        {
            key: 'created_at',
            label: 'Created',
            sortable: true,
            sortField: 'created_at',
            className: 'text-xs text-zinc-600 dark:text-zinc-400 hidden sm:table-cell',
            headerClassName: 'hidden sm:table-cell min-w-[90px]',
            render: (preference: UserNotificationPreference) => {
                const date = new Date(preference.created_at);
                return (
                    <span className="whitespace-nowrap">
                        {date.toLocaleDateString('en-US', {
                            year: '2-digit',
                            month: 'short',
                            day: 'numeric'
                        })}
                    </span>
                );
            }
        }
    ];
}
