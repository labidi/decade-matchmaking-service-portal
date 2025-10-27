export type NotificationEntityType = 'request' | 'opportunity';

import { PageProps } from "@/types/index";

// Simplified notification preference interface
export interface UserNotificationPreference {
    id: number;
    user_id: number;
    entity_type: NotificationEntityType;
    attribute_type: 'subtheme' | 'type';  // Fixed based on entity_type
    attribute_value: string;
    attribute_label?: string;  // Human-readable label
    email_notification_enabled: boolean;
    created_at: string;
    updated_at: string;
}

// Simplified form data for creating preferences
export interface NotificationPreferenceFormData {
    entity_type: NotificationEntityType;
    attribute_value: string;  // subtheme or type value
    email_notification_enabled: boolean;
}

// Simplified pagination interface
export interface NotificationPreferencesPagination {
    current_page: number;
    last_page: number;
    links: Array<{
        active: boolean;
        label: string;
        url: string;
    }>;
    prev_page_url: string | null;
    next_page_url: string | null;
    from: number;
    to: number;
    total: number;
    per_page: number;
    data: UserNotificationPreference[];
}

// Simplified page props
export interface NotificationPreferencesPagePropsWithPagination extends PageProps {
    preferences: NotificationPreferencesPagination;
    availableOptions: {
        request?: {
            subtheme?: Array<{value: string, label: string}>;
        };
        opportunity?: {
            type?: Array<{value: string, label: string}>;
        };
    };
    attributeTypes: Record<string, string>;
    entityTypes: Record<NotificationEntityType, string>;
}

// Entity type constants
export const NOTIFICATION_ENTITY_TYPES = {
    REQUEST: 'request' as const,
    OPPORTUNITY: 'opportunity' as const,
} as const;
