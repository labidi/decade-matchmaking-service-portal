export {
    OCDRequest, OCDRequestList, RequestPermissions, OCDRequestStatus,
    RequestSubscription, SubscriptionStats
} from "@/types/request";
export {RequestOffer, RequestOfferList, RequestOfferPermissions} from "@/types/offer";
export {Opportunity, OpportunitiesList, OpportunityFormOptions, OpportunitiesPagination} from "@/types/opportunity";
export {
    UserNotificationPreference,
    NotificationEntityType,
    NotificationPreferencesPagePropsWithPagination,
    NotificationPreferencesList,
    NotificationPreferencesPagination
} from "@/types/notification-preferences";
export {
    UserManagement,
    UserDetailData,
    UsersPagination,
    UserStatus,
    UserStatistics,
    UserActivity,
    UserAction,
    RoleOption,
    StatusOption,
    UserFilters,
    SortFilters
} from "@/types/user-management";

export interface UIStep {
    label: string;
    fields: Record<string, UIField>;
}

export interface UIField {
    id: string;
    type: string;
    label?: string;
    description?: string;
    placeholder?: string;
    options?: { value: string; label: string }[];
    required?: boolean;
    show?: (data: any) => boolean;  // Remove RequestForm dependency
    multiple?: boolean;
    image?: string;
    accept?: string;
    // New additions:
    disabled?: boolean;
    min?: number;
    max?: number;
    step?: number;
    pattern?: string;
    maxLength?: number;
    rows?: number;  // For textarea
    cols?: number;  // For textarea
    autoComplete?: string;
    autoFocus?: boolean;
    readOnly?: boolean;
    className?: string;
    onKeyDown?: (e: React.KeyboardEvent) => void;
    // Keywords field specific properties
    maxKeywords?: number;
    minLength?: number;  // Minimum length for individual keywords
}

export interface User {
    id: number;
    name: string;
    first_name: string;
    last_name: string;
    country: string;
    city: string;
    email: string;
    email_verified_at?: string;
    is_partner: boolean;
    is_admin: boolean;
    is_user: boolean;
}


export interface Role {
    id: number;
    name: string;
}

export interface UserWithRoles extends User {
    roles: Role[];
}


export interface Auth {
    user: User;
}

export interface NavigationItem {
    id: string;
    label: string;
    href?: string;
    route?: string;
    icon?: string;
    badge?: {
        value: number | string;
        variant?: 'primary' | 'danger' | 'warning' | 'info';
    };
    action?: 'sign-out';
    method?: 'GET' | 'POST';
    visible?: boolean;
    divider?: boolean;
}

export interface NavigationConfig {
    items: NavigationItem[];
    user: {
        displayName: string;
        avatar?: string;
    } | null;
}

export interface SharedData {
    name: string;
    auth: Auth;
    ziggy: Config & { location: string };

    unread_notifications?: number;
    navigation?: NavigationConfig;

    [key: string]: unknown;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
    };
};

export interface PortalGuide {
    url: string;
}

export interface Document {
    id: number;
    name: string;
    path: string;
    file_type?: string;
    document_type?: string;
    parent_id?: number;
    parent_type?: string;
    uploader_id: number;
    created_at: string;
    updated_at: string;
}

export interface Organization {
    id: number;
    name: string;
    description: string;
    website: string;
    created_at: string;
    updated_at: string;
}

export type OrganizationsList = Organization[];

export interface IOCPlatform {
    id: number;
    name: string;
    description?: string;
    link?: string;
    contact?: string;
    created_at: string;
    updated_at: string;
}

export type IOCPlatformsList = IOCPlatform[];


export interface Notification {
    id: number;
    title: string;
    description: string;
    is_read: boolean;
    created_at: string;
}

export type NotificationList = Notification[];


export interface Settings {
    site_name: string;
    site_description: string;
    site_logo: string;
    site_favicon: string;
    contact_email: string;
    homepage_youtube_video: string;
    portal_guide: string;
    user_guide: string;
    partner_guide: string;
    organizations_csv: string;
    ioc_platforms_csv: string;
}

export interface PaginationLinkProps {
    active: boolean;
    label: string;
    url: string;
}

export interface FlashMessages {
    success?: string;
    error?: string;
    warning?: string;
    info?: string;
}

export interface ActionButton {
    label: string;
    href: string;
    icon?: string;  // Heroicon component name
    variant?: 'primary' | 'secondary' | 'danger';
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'LINK';
    data?: Record<string, any>;  // Form data for non-GET requests
    confirm?: string;  // Confirmation message for destructive actions
}

export interface PagePropsWithFlash<
    T extends Record<string, unknown> = Record<string, unknown>,
> extends PageProps<T> {
    flash?: FlashMessages;
}

// Data table interfaces for notification preferences
export interface NotificationPreferenceTableColumn {
    key: string;
    label: string;
    sortable?: boolean;
    sortField?: NotificationPreferenceSortField;
    render: (preference: UserNotificationPreference) => React.ReactNode;
    className?: string;
    headerClassName?: string;
}

// Preference actions dropdown props
export interface PreferenceActionsDropdownProps {
    preference: UserNotificationPreference;
    onEdit?: NotificationPreferenceActionHandler;
    onDelete: NotificationPreferenceActionHandler;
    disabled?: boolean;
}

// Service response interfaces for notification preferences
export interface NotificationPreferencesServiceResponse {
    preferences: NotificationPreferencesPagination;
    availableOptions: Record<string, Array<{ value: string, label: string }>>;
    attributeTypes: Record<string, string>;
    entityTypes: Record<NotificationEntityType, string>;
}

// Form interfaces for notification preferences
export interface NotificationPreferenceFormData {
    entity_type: NotificationEntityType;
    attribute_type: string;
    attribute_value: string;
    email_notification_enabled: boolean;
}

// Filter and search interfaces
export interface NotificationPreferenceFilters {
    entity_type?: NotificationEntityType;
    attribute_type?: string;
    search?: string;
    sort?: string;
    order?: 'asc' | 'desc';
    page?: number;
}

// Column configuration props interface
export interface NotificationPreferenceColumnConfigProps {
    onToggle: NotificationPreferenceToggleHandler;
    updating?: boolean;
}

// Dialog and modal interfaces for notification preferences
export interface NotificationPreferenceDialogProps {
    preference?: UserNotificationPreference;
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: NotificationPreferenceFormData) => void;
    availableOptions: Record<string, Array<{ value: string, label: string }>>;
    attributeTypes: Record<string, string>;
    entityTypes: Record<NotificationEntityType, string>;
    mode: 'create' | 'edit';
}

// Bulk operations interface
export interface NotificationPreferenceBulkActions {
    selectedPreferences: UserNotificationPreference[];
    onBulkDelete: NotificationPreferenceBulkActionHandler;
    onBulkToggleEmailNotifications: (preferences: UserNotificationPreference[], enabled: boolean) => void;
}

// Statistics interface for notification preferences
export interface NotificationPreferenceStats {
    total_preferences: number;
    active_notifications: number;
    active_email_notifications: number;
    preferences_by_entity_type: Record<NotificationEntityType, number>;
    preferences_by_attribute_type: Record<string, number>;
}

// API response interfaces for notification preferences
export interface NotificationPreferenceApiResponse {
    success: boolean;
    message?: string;
    data?: UserNotificationPreference;
    errors?: Record<string, string[]>;
}

export interface NotificationPreferenceBulkApiResponse {
    success: boolean;
    message?: string;
    data?: {
        updated: number;
        failed: number;
        errors?: Array<{
            id: number;
            error: string;
        }>;
    };
}

// Validation interfaces for notification preferences
export interface NotificationPreferenceValidationErrors {
    entity_type?: string[];
    attribute_type?: string[];
    attribute_value?: string[];
    email_notification_enabled?: string[];
}

// Hook return types for notification preferences
export interface UseNotificationPreferencesReturn {
    preferences: NotificationPreferencesPagination;
    loading: boolean;
    error: string | null;
    refetch: () => void;
    updatePreference: (id: number, data: Partial<UserNotificationPreference>) => Promise<void>;
    deletePreference: (id: number) => Promise<void>;
    createPreference: (data: NotificationPreferenceFormData) => Promise<void>;
}

// Table state interface for data table components
export interface NotificationPreferencesTableState {
    loading: boolean;
    error: string | null;
    selectedPreferences: number[];
    filters: NotificationPreferenceFilters;
    sort: {
        field: string;
        order: 'asc' | 'desc';
    };
}

// Utility types for notification preferences
export type NotificationPreferenceToggleType = 'email_notification_enabled';

export type NotificationPreferenceSortField =
    'entity_type'
    | 'attribute_type'
    | 'attribute_value'
    | 'created_at'
    | 'updated_at';

// Entity attribute mapping utility type
export type EntityAttributeMapping = {
    readonly [K in NotificationEntityType]: {
        readonly [key: string]: string;
    };
};

// Type guards for notification preferences
export interface NotificationPreferenceTypeGuards {
    isValidEntityType: (value: string) => value is NotificationEntityType;
    isValidToggleType: (value: string) => value is NotificationPreferenceToggleType;
    isValidSortField: (value: string) => value is NotificationPreferenceSortField;
}

// Event handler types for notification preferences
export type NotificationPreferenceToggleHandler = (
    preference: UserNotificationPreference,
    type: NotificationPreferenceToggleType
) => void;

export type NotificationPreferenceActionHandler = (preference: UserNotificationPreference) => void;

export type NotificationPreferenceBulkActionHandler = (preferences: UserNotificationPreference[]) => void;

export type Context = 'admin' | 'user_own' | 'public';
