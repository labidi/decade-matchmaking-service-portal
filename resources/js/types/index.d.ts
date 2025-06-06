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

export interface Auth {
    user: User;
}

export interface SharedData {
    name: string;
    auth: Auth;
    ziggy: Config & { location: string };
    [key: string]: unknown;
}

export interface BannerData {
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

export interface UserGuideFile {
    url: string;
}

export interface OCDMetrics {
    number_successful_matches: number;
    number_fully_closed_matches: number;
    number_user_requests_in_implementation: number;
    committed_funding_amount: number;
    number_of_open_partner_opertunities: number;
}

export interface OCDRequest {
    id: string;
    type: string;
    submissionDate: string;
    status: {
        id: string;
        status_label: string;
        status_code: string;
        created_at: string;
        updated_at: string;
    }
    request_data: {
        id: string;
        is_partner: 'Yes' | 'No';
        unique_id: string;
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
        activity_name: string;
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
        personnel: string;
        direct_beneficiaries: string;
        direct_beneficiaries_number: string;
        expected_outcomes: string;
        success_metrics: string;
        long_term_impact: string;
    }
    created_at: string;
    matched_partner_id: string | null;
    status_id: string;
    user_id: string;

};

export type OCDRequestList = OCDRequest[];


export interface OCDOpportunity {
    id: string;
    title: string;
    type: string[];
    closing_date: string;
    coverage_activity: string[];
    implementation_location: string[];
    target_audience: string[];
    summary: string;
    url: string;
    created_at: string;
    updated_at: string;
    user_id: string;
    status: string;
    status_label: string;
    can_edit: boolean;
}

export type OCDOpportunitiesList = OCDOpportunity[];

export type OCDRequestGrid = {
    actions: {
        canEdit: boolean;
        canDelete: boolean;
        canView: boolean;
        canCreate: boolean;
        canExpressInterrest: boolean;
    }
}