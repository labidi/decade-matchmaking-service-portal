export interface Opportunity {
    id: string;
    title: string;
    type: string;
    closing_date: string;
    coverage_activity: string;
    implementation_location: string;
    target_audience: string;
    target_audience_other: string;
    summary: string;
    url: string;
    key_words: string[];
}

export interface UIField {
    id: string;
    type: string;
    label?: string;
    description?: string;
    placeholder?: string;
    options?: { value: string; label: string }[];
    required?: boolean;
    show?: (data: Opportunity) => boolean;
    multiple?: boolean;
    maxLength?: number;
}

export interface UIStep {
    label: string;
    fields: Record<string, UIField>;
}

// opportunityTypeOptions should be provided by the parent component from backend
export const coverageActivityOptions = [
    {value: 'country', label: 'Country'},
    {value: 'Regions', label: 'Regions'},
    {value: 'Global', label: 'Global'},
    {value: 'Ocean-based', label: 'Ocean Based'},
];

// Target audience options will be provided by the backend
export const targetAudienceOptions: { value: string; label: string }[] = [];

export const UIOpportunityForm: UIStep[] = [
    {
        label: 'Basic Info',
        fields: {
            title: {
                id: 'title',
                type: 'text',
                required: true,
                label: 'Opportunity Title',
                placeholder: 'Enter the title',
            },
            type: {
                id: 'type',
                type: 'select',
                required: true,
                label: 'Type of Opportunity',
                // options should be provided by the parent component from backend
            },
            closing_date: {
                id: 'closing_date',
                type: 'date',
                required: true,
                label: 'Application closing date (MM/DD/YY)',
            }, coverage_activity: {
                id: 'coverage_activity',
                type: 'select',
                required: true,
                label: 'Coverage of CD Activity',
                options: coverageActivityOptions,
            },
            implementation_location: {
                id: 'implementation_location',
                type: 'select',
                required: true,
                label: 'Implementation Location',
                // options will be set dynamically based on coverage_activity
            },
            target_audience: {
                id: 'target_audience',
                type: 'select',
                required: true,
                label: 'Target Audience',
                options: targetAudienceOptions,
            },
            target_audience_other: {
                id: 'target_audience_other',
                type: 'text',
                required: false,
                label: 'Please specify the target audience',
                show: data => data.target_audience === 'other',
            },
            summary: {
                id: 'summary',
                type: 'textarea',
                required: true,
                label: 'Summary of the Opportunity',
                maxLength: 500,
                placeholder: 'Summary of the Opportunity (please include any prerequisites so that interested applicants are aware).'
            },
            url: {
                id: 'url',
                type: 'text',
                required: false,
                label: 'Application site URL',
            },
            key_words: {
                id: 'key_words',
                type: 'text',
                required: false,
                label: 'Three key words',
                description: 'Add comma (,) to separate key words or press enter',
            },
        },
    }
];
