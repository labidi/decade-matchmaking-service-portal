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
            key: 'preference',
            label: 'Preference',
            sortable: true,
            sortField: 'attribute_value',
            className: 'max-w-[250px] truncate',
            headerClassName: 'min-w-[150px]',
            render: (preference: UserNotificationPreference) => {
                // Show human-readable label if available, otherwise use attribute_value
                const displayValue = preference.attribute_label || preference.attribute_value;
                return (
                    <span
                        className="text-zinc-700 dark:text-zinc-300 text-sm block truncate"
                        title={displayValue}
                    >
                        {displayValue}
                    </span>
                );
            }
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
