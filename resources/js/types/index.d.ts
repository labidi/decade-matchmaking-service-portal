export interface User {
    id: number;
    name: string;
    first_name: string;
    last_name: string;
    country: string;
    city: string;
    email: string;
    email_verified_at?: string;
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
    request_data: any;
    status: {
        id: string;
        status_label: string;
        status_code: string;
        created_at: string;
        updated_at: string;
    }
    created_at: string;
    matched_partner_id: string | null;
    status_id: string;
    user_id: string;

};

export type OCDRequestList = OCDRequest[];



