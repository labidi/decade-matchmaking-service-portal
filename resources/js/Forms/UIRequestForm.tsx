export interface Request {
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

export const UIRequestForm = {
    id:{
        type: 'hidden',
        id: 'id',
    },
    is_partner: {
        type: 'radio',
        options: [
            { value: 'Yes', label: 'Yes' },
            { value: 'No', label: 'No' },
        ],
        required: true,
        label: 'Are you an endorsed partner?',
        id: 'is_partner',
    },
    unique_id: {
        id: 'unique_id',
        type: 'text',
        required: true,
        label: 'Unique Partner ID',
        description: 'This is the unique ID assigned to you as a partner. If you are not a partner, please leave this field blank.',
    },
    first_name: {
        id: 'first_name',
        type: 'text',
        required: true,
        label: 'First Name',
        description: 'Your given name as on official records.',
    },
    last_name: {
        id: 'last_name',
        type: 'text',
        required: true,
        label: 'Last Name',
        description: 'Your family name or surname.',
    },
    email: {
        id: 'email',
        type: 'email',
        required: true,
        label: 'Email',
        description: 'Please provide your contact information',
    },
    capacity_development_title:{
        id: 'capacity_development_title',
        type: 'text',
        required: true,
        label: 'What is the name or title of the capacity development activity you are submitting ?',
    },
    has_significant_changes: {
        id: 'has_significant_changes',
        type: 'radio',
        options: [
            { value: 'Yes', label: 'Yes' },
            { value: 'No', label: 'No' },
        ],
        required: true,
        label: 'Has your Action undergone any significant changes to its activities or framework since its endorsement ?',
    },
    changes_description: {
        id: 'changes_description',
        type: 'textarea',
        required: true,
        label: 'Please explain how this is affecting your Action.',
        description: 'If the capacity development gap/challenge is not affecting the overall implementation of your Action, please enter \'NA\'.',
    },
    change_effect: '',
    request_link_type: '',
    project_stage: '',
    project_url: '',
    activity_name: '',
    related_activity: {
        type: 'select',
        required: true,
        label: 'Is your request related to a training, a workshop, or both ?',
        placeholder: 'Select an option',
        options: [
            { value: 'Training', label: 'Training' },
            { value: 'Workshop', label: 'Workshop' },
            { value: 'Both', label: 'Both' },
        ],
        description: 'Please select the option that best describes your request.',
    },
    subthemes: [] as string[],
    subthemes_other: '',
    support_types: [] as string[],
    support_types_other: '',
    gap_description: '',
    has_partner: '',
    partner_name: '',
    partner_confirmed: '',
    needs_financial_support: '',
    budget_breakdown: '',
    support_months: '',
    completion_date: '',
    risks: '',
    personnel: '',
    direct_beneficiaries: '',
    direct_beneficiaries_number: '',
    expected_outcomes: '',
    success_metrics: '',
    long_term_impact: '',
};