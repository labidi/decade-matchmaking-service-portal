import {RequestForm} from "@/Forms/UIRequestForm";

export interface UIField {
    id: string;
    type: string;
    label?: string;
    description?: string;
    placeholder?: string;
    options?: { value: string; label: string }[];
    required?: boolean;
    show?: (data: RequestForm) => boolean;
    multiple?: boolean;
    image?: string;
    accept?: string;
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

export interface Banner {
    title: string;
    description: string;
    image: string;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
    };
};

export interface YoutubeEmbed {
    title: string;
    src: string;
}

export interface PortalGuide {
    url: string;
}

export interface OCDMetrics {
    number_successful_matches: number;
    number_fully_closed_matches: number;
    number_user_requests_in_implementation: number;
    committed_funding_amount: number;
    number_of_open_partner_opportunities: number;
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

export interface RequestStatus {
    id: number;
    status_code: string;
    status_label: string;
}
export interface OCDRequest {
    id: number;
    type: string;
    submissionDate: string;
    status: OCDRequestStatus,
    title: string;
    can_edit: boolean;
    can_view: boolean;
    can_manage_offers: boolean;
    can_update_status: boolean;
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
        direct_beneficiaries: string;
        direct_beneficiaries_number: string;
        expected_outcomes: string;
        success_metrics: string;
        long_term_impact: string;
        delivery_countries:string[];
    }
    created_at: string;
    matched_partner_id: string | null;
    status_id: string;
    user_id: string;
    user: User;
    offers?: RequestOfferList
    active_offer?: RequestOffer;
};

export type OCDRequestList = OCDRequest[];


export interface OCDOpportunity {
    id: string;
    title: string;
    type: string;
    type_label: string;
    closing_date: string;
    coverage_activity: string;
    implementation_location: string;
    target_audience: string;
    target_audience_other: string;
    summary: string;
    url: string;
    created_at: string;
    updated_at: string;
    user_id: string;
    status: number;
    status_label: string;
    can_edit: boolean;
    keywords: string
    user?: User;
}

export type OCDOpportunitiesList = OCDOpportunity[];

export type OCDRequestGrid = {
    actions: {
        canEdit: boolean;
        canDelete: boolean;
        canView: boolean;
        canCreate?: boolean;
        canExpressInterest?: boolean;
        canExportPdf?: boolean;
        canAcceptOffer?: boolean;
        canRequestClarificationForOffer?: boolean,
        canChangeStatus?: boolean,
        canPreview?: boolean
    }
}

export type OCDOpportunitiesListPageActions = {
    canEdit?: boolean;
    canDelete?: boolean;
    canView?: boolean;
    canChangeStatus?: boolean;
    canCreate?: boolean;
    canExpressInterest?: boolean;
    canExportPdf?: boolean;
    canSubmitNew?: boolean;
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

export type OpportunityTypeOptions = Record<string, string>;

export interface Settings {
    site_name: string;
    site_description: string;
    site_logo: string;
    site_favicon: string;
    contact_email: string;
    homepage_youtube_video:string;
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
