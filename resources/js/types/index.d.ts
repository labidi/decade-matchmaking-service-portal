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
