import { countryOptions, regionOptions, oceanOptions } from '@/data/locations';

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

export const opportunityTypeOptions = [
    { value: 'training', label: 'Training' },
    { value: 'onboarding-expeditions', label: 'Onboarding Expeditions, Research & Training' },
    { value: 'fellowships', label: 'Fellowships' },
    { value: 'internships-jobs', label: 'Internships/Jobs' },
    { value: 'mentorships', label: 'Mentorships' },
    { value: 'visiting-lecturers', label: 'Visiting Lecturers/Scholars' },
    { value: 'travel-grants', label: 'Travel Grants' },
    { value: 'awards', label: 'Awards' },
    { value: 'research-funding', label: 'Research Fundings, Grants & Scholarships' },
    { value: 'access-infrastructure', label: 'Access to Infrastructure' },
    { value: 'ocean-data', label: 'Ocean Data, Information and Documentation' },
    { value: 'networks-community', label: 'Professional Networks & Community Building' },
    { value: 'ocean-literacy', label: 'Ocean Literacy, Public Information and Communication' },
];

export const coverageActivityOptions = [
    { value: 'country', label: 'Country' },
    { value: 'Regions', label: 'Regions' },
    { value: 'Global', label: 'Global' },
    { value: 'Ocean-based', label: 'Ocean Based' },
];

export const targetAudienceOptions = [
    { value: 'academic', label: 'Academic' },
    { value: 'alumni', label: 'Alumni' },
    { value: 'civil-society', label: 'Civil Society' },
    { value: 'sids', label: 'Small Island Developing States (SIDS)' },
    { value: 'decision-makers', label: 'Decision Makers' },
    { value: 'developing-countries', label: 'Developing Countries' },
    { value: 'early-career', label: 'Early Career Professionals' },
    { value: 'researchers', label: 'Researchers' },
    { value: 'doctoral-postdoctoral', label: 'Doctoral or Postdoctoral' },
    { value: 'scientists', label: 'Scientists' },
    { value: 'executives', label: 'Executives' },
    { value: 'technicians', label: 'Technicians' },
    { value: 'general-public', label: 'General Public' },
    { value: 'women', label: 'Women' },
    { value: 'government', label: 'Government' },
    { value: 'youth', label: 'Youth' },
    { value: 'other', label: 'Other (Please Specify)' },
];

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
                options: opportunityTypeOptions,
            },
            closing_date: {
                id: 'closing_date',
                type: 'date',
                required: true,
                label: 'Application closing date (MM/DD/YY)',
            },
        },
    },
    {
        label: 'Details',
        fields: {
            coverage_activity: {
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
            },
            url: {
                id: 'url',
                type: 'text',
                required: false,
                label: 'Application site URL',
            },
            key_words: {
                id: 'key_words',
                type: 'tags',
                required: false,
                label: 'Three key words',
                description: 'Add comma (,) to separate key words or press enter',
            },
        },
    },
];
