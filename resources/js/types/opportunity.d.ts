import {User} from "@/types/index";

export interface OpportunityPermissions {
    can_view?: boolean;
    can_delete?: boolean;
    can_edit?: boolean;
    can_manage_offers?: boolean;
    can_update_status?: boolean;
    can_accept_offer?: boolean;
    can_request_clarifications?: boolean;
    can_express_interest?: boolean;
}

export interface Opportunity {
    id: string;
    title: string;
    type: { value: string; label: string };
    status:  { value: string; label: string };
    closing_date: string;
    coverage_activity: { value: string; label: string };
    implementation_location:  Array<{ value: string; label: string }>;
    target_audience: Array<{ value: string; label: string }>;
    target_audience_other: string;
    summary: string;
    url: string;
    created_at: string;
    updated_at: string;
    user_id: string;
    can_edit: boolean;
    key_words: string[];
    user?: User;
    permissions?: OpportunityPermissions;
}

export type OpportunitiesList = Opportunity[];

export interface OpportunityFormOptions {
    countries?: Array<{ value: string; label: string }>;
    regions?: Array<{ value: string; label: string }>;
    oceans?: Array<{ value: string; label: string }>;
    target_audience?: Array<{ value: string; label: string }>;
    opportunity_types?: Array<{ value: string; label: string }>;
    coverage_activity?: Array<{ value: string; label: string }>;
    yes_no?: Array<{ value: string; label: string }>;
}
