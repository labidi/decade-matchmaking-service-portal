import {User} from "@/types/index";

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
