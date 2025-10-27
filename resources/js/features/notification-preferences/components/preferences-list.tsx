import React from 'react';
import { UserNotificationPreference, NotificationPreferenceToggleHandler, NotificationPreferenceActionHandler } from '@/types';
import { Heading } from '@ui/primitives/heading';
import { Text } from '@ui/primitives/text';
import { Divider } from '@ui/primitives/divider';
import PreferenceCard from './preference-card';
import EmptyState from './empty-state';

interface PreferencesListProps {
    preferences: Record<string, UserNotificationPreference[]>;
    attributeTypes: Record<string, string>;
    onToggleNotification: NotificationPreferenceToggleHandler;
    onDeletePreference: NotificationPreferenceActionHandler;
    updating?: boolean;
}

export default function PreferencesList({
    preferences,
    attributeTypes,
    onToggleNotification,
    onDeletePreference,
    updating = false
}: PreferencesListProps) {
    const hasPreferences = Object.keys(preferences).length > 0;

    if (!hasPreferences) {
        return <EmptyState />;
    }

    return (
        <div className="space-y-8">
            {Object.entries(preferences).map(([attributeType, prefs]) => {
                const typeLabel = attributeTypes[attributeType] || attributeType;

                return (
                    <div key={attributeType} className="space-y-4">
                        {/* Section Header */}
                        <div>
                            <Heading level={3} className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                                {typeLabel}
                            </Heading>
                            <Text className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                                {prefs.length} {prefs.length === 1 ? 'preference' : 'preferences'}
                            </Text>
                        </div>

                        {/* Preferences Grid */}
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {prefs.map((preference) => (
                                <PreferenceCard
                                    key={preference.id}
                                    preference={preference}
                                    onToggleNotification={onToggleNotification}
                                    onDelete={onDeletePreference}
                                    updating={updating}
                                />
                            ))}
                        </div>

                        <Divider />
                    </div>
                );
            })}
        </div>
    );
}
