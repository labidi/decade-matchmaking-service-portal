export type NotificationEntityType = 'request' | 'opportunity';

import {
    NotificationPreferenceFilters,
    NotificationPreferenceStats,
    PageProps,
    UserNotificationPreference
} from "@/types/index";

export interface NotificationPreferencesPageProps extends PageProps {
    preferences: Record<string, UserNotificationPreference[]>; // Grouped by attribute_type
    availableOptions: Record<string, Array<{ value: string, label: string }>>;
    attributeTypes: Record<string, string>; // e.g., {'subtheme': 'Subtheme', 'coverage_activity': 'Coverage Activity'}
}

// Entity types for notification preferences

// Entity type constants
export const NOTIFICATION_ENTITY_TYPES = {
    REQUEST: 'request' as const,
    OPPORTUNITY: 'opportunity' as const,
} as const;


// Notification preferences list with pagination
export interface NotificationPreferencesList extends Array<UserNotificationPreference> {
}
// Pagination interfaces for notification preferences
export interface NotificationPreferencesPagination {
    current_page: number;
    last_page: number;
    links: PaginationLinkProps[];
    prev_page_url: string | null;
    next_page_url: string | null;
    from: number;
    to: number;
    total: number;
    per_page: number;
    data: UserNotificationPreference[];
}

// Enhanced page props with pagination support
export interface NotificationPreferencesPagePropsWithPagination extends PageProps {
    preferences: NotificationPreferencesPagination;
    availableOptions: Record<string, Array<{ value: string, label: string }>>;
    attributeTypes: Record<string, string>;
    entityTypes: Record<NotificationEntityType, string>;
    currentFilters: NotificationPreferenceFilters;
    currentSort: {
        field: string;
        order: 'asc' | 'desc';
    };
    stats?: NotificationPreferenceStats;
}


export interface UserNotificationPreference {
    id: number;
    user_id: number;
    entity_type: string; // 'request' | 'opportunity'
    attribute_type: string;
    attribute_value: string;
    email_notification_enabled: boolean;
    created_at: string;
    updated_at: string;
}
