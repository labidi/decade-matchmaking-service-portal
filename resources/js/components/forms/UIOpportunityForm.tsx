import {UIStep} from '@/types';

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
            },
            coverage_activity: {
                id: 'coverage_activity',
                type: 'select',
                required: true,
                label: 'Coverage of CD Activity',
            },
            implementation_location: {
                id: 'implementation_location',
                type: 'multiselect',
                required: true,
                label: 'Implementation Location',
                // options will be set dynamically based on coverage_activity
            },
            target_audience: {
                id: 'target_audience',
                type: 'multiselect',
                required: true,
                label: 'Target Audience',
                // options will be provided by the parent component from FormOptions
            },
            target_audience_other: {
                id: 'target_audience_other',
                type: 'text',
                required: false,
                label: 'Please specify the target audience',
                show: data => data.target_audience?.includes('Other')
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
                type: 'keywords',
                required: false,
                label: 'Three key words',
                description: 'Add comma (,) to separate key words or press enter',
                maxKeywords: 3
            },
        },
    }
];
