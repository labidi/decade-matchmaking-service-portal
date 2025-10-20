import React from 'react';
import { UserNotificationPreference, NotificationPreferenceToggleHandler, NotificationPreferenceActionHandler } from '@/types';
import { Switch, SwitchField } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Badge } from '@/components/ui/badge';
import { EnvelopeIcon, TrashIcon } from '@heroicons/react/16/solid';
import { NoSymbolIcon } from '@heroicons/react/24/outline';

interface PreferenceCardProps {
    preference: UserNotificationPreference;
    onToggleNotification: NotificationPreferenceToggleHandler;
    onDelete: NotificationPreferenceActionHandler;
    updating?: boolean;
}

export default function PreferenceCard({
    preference,
    onToggleNotification,
    onDelete,
    updating = false
}: PreferenceCardProps) {
    const formatAttributeValue = (value: string) => {
        // Handle cases where value might be a comma-separated list or array
        if (value.includes(',')) {
            return value.split(',').map(v => v.trim()).join(', ');
        }
        return value;
    };

    const getStatusBadge = () => {
        if (preference.email_notification_enabled) {
            return <Badge color="indigo">Email enabled</Badge>;
        } else {
            return <Badge color="zinc">Email disabled</Badge>;
        }
    };

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700 p-4 space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                    <Text className="font-medium text-zinc-900 dark:text-zinc-100 truncate">
                        {formatAttributeValue(preference.attribute_value)}
                    </Text>
                    <Text className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                        {getStatusBadge()}
                    </Text>
                </div>
                <Button
                    plain
                    onClick={() => onDelete(preference)}
                    className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    aria-label="Remove preference"
                >
                    <TrashIcon data-slot="icon" className="size-4" />
                </Button>
            </div>

            {/* Email SystemNotification Control */}
            <div className="space-y-3">
                <SwitchField>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {preference.email_notification_enabled ? (
                                <EnvelopeIcon data-slot="icon" className="size-4 text-indigo-600 dark:text-indigo-400" />
                            ) : (
                                <NoSymbolIcon className="size-4 text-zinc-400" />
                            )}
                            <Text className="text-sm font-medium">Email notifications</Text>
                        </div>
                        <Switch
                            color="indigo"
                            checked={preference.email_notification_enabled}
                            onChange={() => onToggleNotification(preference, 'email_notification_enabled')}
                            disabled={updating}
                        />
                    </div>
                </SwitchField>
            </div>

            {/* Footer Info */}
            <div className="pt-2 border-t border-zinc-200 dark:border-zinc-700">
                <Text className="text-xs text-zinc-500 dark:text-zinc-500">
                    Added {new Date(preference.created_at).toLocaleDateString()}
                </Text>
            </div>
        </div>
    );
}