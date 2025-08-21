import {RequestForm} from "@/components/forms/UIRequestForm";

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

export interface RequestSubscription {
    id: number;
    user_id: number;
    request_id: number;
    subscribed_by_admin: boolean;
    admin_user_id?: number;
    created_at: string;
    updated_at: string;
    user?: User;
    request?: OCDRequest;
    admin_user?: User;
}

export interface SubscriptionStats {
    total_subscriptions: number;
    admin_created_subscriptions: number;
    user_created_subscriptions: number;
    unique_subscribers: number;
    unique_subscribed_requests: number;
}

export interface Role {
    id: number;
    name: string;
}

export interface UserWithRoles extends User {
    roles: Role[];
}

export type UserWithRolesList = UserWithRoles[];

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

export type DocumentList = Document[];

export interface RequestOffer {
    id: number;
    description: string;
    matched_partner_id: number;
    request_id: number;
    status: number;
    status_label: string;
    created_at: string;
    updated_at: string;
    is_accepted: boolean;
    can_edit: boolean;
    can_view: boolean;
    can_delete: boolean;
    documents?: Document[];
    request?: OCDRequest;
    matched_partner?: User;
}

export type RequestOfferList = RequestOffer[];
export interface OCDRequestStatus {
    id: string;
    status_label: string;
    status_code: string;
    created_at: string;
    updated_at: string;
}

export interface RequestPermissions {
    can_view?: boolean;
    can_delete?: boolean;
    can_edit?: boolean;
    can_manage_offers?: boolean;
    can_update_status?: boolean;
    can_accept_offer?: boolean;
    can_request_clarifications?: boolean;
}

export interface OCDRequest {
    id: number;
    type: string;
    submission_date: string;
    detail: {
        id: string;
        is_related_decade_action: 'Yes' | 'No';
        unique_related_decade_action_id: string;
        first_name: string;
        last_name: string;
        email: string;
        capacity_development_title: string;
        has_significant_changes: 'Yes' | 'No';
        changes_description: string;
        change_effect: string;
        request_link_type: string;
        project_stage: string;
        project_url: string;
        related_activity: 'Training' | 'Workshop' | 'Both';
        subthemes: string[];
        subthemes_other: string;
        support_types: string[];
        support_types_other: string;
        gap_description: string;
        has_partner: string;
        partner_name: string;
        partner_confirmed: string;
        needs_financial_support: string;
        budget_breakdown: string;
        support_months: string;
        completion_date: string;
        risks: string;
        personnel_expertise: string;
        direct_beneficiaries: string;
        direct_beneficiaries_number: string;
        expected_outcomes: string;
        success_metrics: string;
        long_term_impact: string;
        delivery_countries:string[];
        target_audience: string[];
        target_audience_other: string;
        target_languages: string[];
        target_languages_other: string;
    }
    created_at: string;
    user_id: string;
    status: OCDRequestStatus,
    user: User;
    offers?: RequestOfferList
    active_offer?: RequestOffer;
    permissions: RequestPermissions;
    matched_partner?: User;
}

export type OCDRequestList = OCDRequest[];

export interface OpportunityStatus {
    label: string;
    code: string;
}

export interface Opportunity {
    id: string;
    title: string;
    type: string;
    type_label: string;
    closing_date: string;
    coverage_activity: string;
    implementation_location: string;
    target_audience: Array<{ value: string; label: string }>;
    target_audience_other: string;
    summary: string;
    url: string;
    created_at: string;
    updated_at: string;
    user_id: string;
    status:  { value: string; label: string };
    can_edit: boolean;
    keywords: string;
    user?: User;
}

export type OpportunitiesList = Opportunity[];

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

export type UserNotificationPreferenceList = UserNotificationPreference[];

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
    availableOptions: Record<string, Array<{value: string, label: string}>>;
    attributeTypes: Record<string, string>; // e.g., {'subtheme': 'Subtheme', 'coverage_activity': 'Coverage Activity'}
}

export type OpportunityTypeOptions = Record<string, string>;

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
