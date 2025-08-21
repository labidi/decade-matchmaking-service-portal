export {
    OCDRequest, OCDRequestList, RequestOffer, RequestOfferList, RequestPermissions, OCDRequestStatus,
    RequestSubscription, SubscriptionStats
} from "@/types/request";
export {Opportunity, OpportunitiesList} from "@/types/opportunity";

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

export interface SharedData {
    name: string;
    auth: Auth;
    ziggy: Config & { location: string };

    unread_notifications?: number;

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


export interface OfferProps {
    OcdRequest: OCDRequest;
}

export interface Notification {
    id: number;
    title: string;
    description: string;
    is_read: boolean;
    created_at: string;
}

export type NotificationList = Notification[];

export interface UserNotificationPreference {
    id: number;
    user_id: number;
    attribute_type: string;
    attribute_value: string;
    notification_enabled: boolean;
    email_notification_enabled: boolean;
    created_at: string;
    updated_at: string;
}


// Common form options interface for consistent structure across forms
export interface RequestFormOptions {
    delivery_countries?: Array<{ value: string; label: string }>;
    regions?: Array<{ value: string; label: string }>;
    oceans?: Array<{ value: string; label: string }>;
    subthemes?: Array<{ value: string; label: string }>;
    support_types?: Array<{ value: string; label: string }>;
    target_audience?: Array<{ value: string; label: string }>;
    target_languages?: Array<{ value: string; label: string }>;
    delivery_format?: Array<{ value: string; label: string }>;
    opportunity_types?: Array<{ value: string; label: string }>;
    related_activity?: Array<{ value: string; label: string }>;
    yes_no?: Array<{ value: string; label: string }>;
    project_stage?: Array<{ value: string; label: string }>;
}

// Common form options interface for consistent structure across forms
export interface FormOptions {
    delivery_countries?: Array<{ value: string; label: string }>;
    countries?: Array<{ value: string; label: string }>;
    regions?: Array<{ value: string; label: string }>;
    oceans?: Array<{ value: string; label: string }>;
    subthemes?: Array<{ value: string; label: string }>;
    support_types?: Array<{ value: string; label: string }>;
    target_audience?: Array<{ value: string; label: string }>;
    delivery_format?: Array<{ value: string; label: string }>;
    opportunity_types?: Array<{ value: string; label: string }>;
    related_activity?: Array<{ value: string; label: string }>;
    yes_no?: Array<{ value: string; label: string }>;
    project_stage?: Array<{ value: string; label: string }>;
}

export interface NotificationPreferencesPageProps extends PageProps {
    preferences: Record<string, UserNotificationPreference[]>; // Grouped by attribute_type
    availableOptions: Record<string, Array<{ value: string, label: string }>>;
    attributeTypes: Record<string, string>; // e.g., {'subtheme': 'Subtheme', 'coverage_activity': 'Coverage Activity'}
}

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
}

export interface CSVUploadResponse {
    success: boolean;
    message: string;
    imported_count?: number;
    errors?: string[];
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

export interface PagePropsWithFlash<
    T extends Record<string, unknown> = Record<string, unknown>,
> extends PageProps<T> {
    flash?: FlashMessages;
}
