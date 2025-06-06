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
    personnel_expertise: string;
    direct_beneficiaries: string;
    direct_beneficiaries_number: string;
    expected_outcomes: string;
    success_metrics: string;
    long_term_impact: string;
}

export interface UIField {
    id: string;
    type: string;
    label?: string;
    description?: string;
    placeholder?: string;
    options?: { value: string; label: string }[];
    required?: boolean;
    show?: (data: Request) => boolean;
}

export interface UIStep {
    label: string;
    fields: Record<string, UIField>;
}

export const subthemeOptions = [
    'Mapping & modeling ocean-climate interactions',
    'Marine CO2 removal',
    'Ocean acidification',
    'Impact of oceans on human health',
    'Measuring cumulative impacts and multiple stressors',
    'Low-cost technology & infrastructure solutions for data gathering and management',
    'Data management (FAIR and CARE principles)',
    'Mapping and modelling biodiversity',
    'Ecosystem Approach to Fisheries',
    'Implementing the BBNJ Agreement',
    'eDNA techniques',
    'Science communication for policy development',
    'Working with & influencing policymakers',
    'Sustainable Ocean Planning',
    'Stakeholder engagement via transdisciplinary approaches',
    'Engaging Local & Indigenous Knowledge holders',
    'Managing, leading, & financing ocean projects',
    'Other',
];

export const supportOptions = [
    'Funding to organize a workshop ou formation',
    'Technical support for planning and delivering a workshop ou training',
    'Facilitation or coordination support',
    'Participation in an existing training or capacity-building event',
    'Access to training materials or curriculum',
    'Other',
];

export const UIRequestForm: UIStep[] = [
    {
        label: 'Identification',
        fields: {
            id: { id: 'id', type: 'hidden' },
            is_partner: {
                id: 'is_partner',
                type: 'radio',
                required: true,
                label: 'Is this request related an Ocean Decade Action ?',
                description: 'Only Ocean Decade Programmes, Projects, and Contributions are considered official Decade Actions. Activities are not considered Decade Actions.',
                options: [
                    { value: 'Yes', label: 'Yes' },
                    { value: 'No', label: 'No' },
                ],
            },
            unique_id: {
                id: 'unique_id',
                type: 'text',
                required: true,
                label: 'Unique Partner ID',
                description: 'This is the unique ID assigned to you as a partner. If you are not a partner, please leave this field blank.',
                show: data => data.is_partner === 'Yes',
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
        },
    },
    {
        label: 'Details',
        fields: {
            capacity_development_title: {
                id: 'capacity_development_title',
                type: 'text',
                required: true,
                label: 'What is the name or title of the capacity development activity you are submitting ?',
            },
            request_link_type: {
                id: 'request_link_type',
                type: 'select',
                required: true,
                label: 'Is this request linked to a broader programme, project, activity or initiative—whether planned, approved, implemented, or closed—or is it an independent capacity development request?',
                options: [
                    { value: 'Broader', label: 'Part of a Broader Project/Programme/Initiative' },
                    { value: 'Standalone', label: 'Standalone Capacity Development Request' },
                    { value: 'Other', label: 'Other' },
                ],
                show: data => data.is_partner !== 'Yes',
            },
            project_stage: {
                id: 'project_stage',
                type: 'select',
                required: true,
                label: 'Could you specify the current stage of the programme, project, activity or initiative?',
                options: [
                    { value: 'Planning', label: 'Planning' },
                    { value: 'Approved', label: 'Approved' },
                    { value: 'Implementation', label: 'In implementation' },
                    { value: 'Closed', label: 'Closed' },
                    { value: 'Other', label: 'Other' },
                ],
                show: data => data.is_partner !== 'Yes',
            },
            project_url: {
                id: 'project_url',
                type: 'url',
                label: 'Please share any URLs related to the project document or information to help us better understand how this request fits within the broader framework.',
                show: data => data.is_partner !== 'Yes',
            },
            activity_name: {
                id: 'activity_name',
                type: 'text',
                required: true,
                label: 'Could you please provide the name of the proposal, programme, or initiative—or, if this is a standalone request, the name of the capacity development activity?',
                show: data => data.is_partner !== 'Yes',
            },
            has_significant_changes: {
                id: 'has_significant_changes',
                type: 'select',
                required: true,
                label: 'Has your Action undergone any significant changes to its activities or framework since its endorsement ?',
                options: [
                    { value: 'Yes', label: 'Yes' },
                    { value: 'No', label: 'No' },
                ],
                show: data => data.is_partner === 'Yes',
            },
            changes_description: {
                id: 'changes_description',
                type: 'textarea',
                required: true,
                label: 'Please explain how this is affecting your Action.',
                description: "If the capacity development gap/challenge is not affecting the overall implementation of your Action, please enter 'NA'.",
                show: data => data.is_partner === 'Yes' && data.has_significant_changes === 'Yes',
            },
        },
    },
    {
        label: 'Capacity & Partners',
        fields: {
            related_activity: {
                id: 'related_activity',
                type: 'select',
                required: true,
                label: 'Is your request related to a training, a workshop, or both ?',
                description: 'Please select the option that best describes your request.',
                options: [
                    { value: 'Training', label: 'Training' },
                    { value: 'Workshop', label: 'Workshop' },
                    { value: 'Both', label: 'Both' },
                ],
            },
            subthemes: {
                id: 'subthemes',
                type: 'checkbox-group',
                required: true,
                label: 'Which sub-theme(s) of the Capacity Development Facility priorities does your request fall under?',
                description: 'Please review the umbrella theme carefully before selecting the corresponding sub-themes.',
                options: subthemeOptions.map(v => ({ value: v, label: v })),
            },
            subthemes_other: {
                id: 'subthemes_other',
                type: 'textarea',
                required: true,
                show: data => data.subthemes.includes('Other'),
            },
            support_types: {
                id: 'support_types',
                type: 'checkbox-group',
                required: true,
                label: 'What type of support related to workshops or training are you seeking?',
                description: "If you require support outside listed options, specify under 'Other options'.",
                options: supportOptions.map(v => ({ value: v, label: v })),
            },
            support_types_other: {
                id: 'support_types_other',
                type: 'textarea',
                required: true,
                show: data => data.support_types.includes('Other'),
            },
            gap_description: {
                id: 'gap_description',
                type: 'textarea',
                required: true,
                label: 'Please describe the specific capacity development gap or challenge that this service aims to address.*',
                description: 'Be as specific as possible.',
            },
        },
    },
    {
        label: 'Service',
        fields: {
            has_partner: {
                id: 'has_partner',
                type: 'select',
                required: true,
                label: 'Do you already have a partner/service provider in mind to execute your request?',
                options: [
                    { value: 'Yes', label: 'Yes' },
                    { value: 'No', label: 'No' },
                ],
            },
            partner_name: {
                id: 'partner_name',
                type: 'text',
                required: true,
                label: 'What is the name of the partner or service provider you have identified?',
                description: 'If your organization intends to deliver the services, please indicate the name of your organization.',
                show: data => data.has_partner === 'Yes',
            },
            partner_confirmed: {
                id: 'partner_confirmed',
                type: 'select',
                required: true,
                label: 'Has this partner already been contacted and confirmed?',
                options: [
                    { value: 'Yes', label: 'Yes' },
                    { value: 'No', label: 'No' },
                ],
                show: data => data.has_partner === 'Yes',
            },
            needs_financial_support: {
                id: 'needs_financial_support',
                type: 'select',
                required: true,
                label: 'Do you require financial support from the Capacity Development Facility to address this request?',
                options: [
                    { value: 'Yes', label: 'Yes' },
                    { value: 'No', label: 'No' },
                ],
            },
            budget_breakdown: {
                id: 'budget_breakdown',
                type: 'textarea',
                required: true,
                label: 'To better understand the financial requirements for this request, please provide a budget breakdown by category relevant to your needs.',
                description: 'Please provide the figures in USD (e.g., Personnel & Staffing: 5,000, Other (Fellowship): 40,000)',
                placeholder: '- Personnel & Staffing (e.g., salaries, stipends, consultant fees) ... ',
                show: data => data.needs_financial_support === 'Yes',
            },
            support_months: {
                id: 'support_months',
                type: 'number',
                required: true,
                label: 'How many months from the submission date do you need this support?',
                description: 'Please provide the figures in USD (e.g., Personnel & Staffing: 5,000, Other (Fellowship): 40,000)',
                show: data => data.needs_financial_support === 'Yes',
            },
            completion_date: {
                id: 'completion_date',
                type: 'date',
                required: true,
                label: 'By when do you anticipate completing this activity?',
                description: '(For example, if you need support within six months, simply reply “6.”)',
                show: data => data.needs_financial_support === 'Yes',
            },
        },
    },
    {
        label: 'Risks',
        fields: {
            risks: {
                id: 'risks',
                type: 'textarea',
                required: true,
                label: 'Please identify and describe any risks you anticipate in implementing this request and contingency measures to address them during the implementation',
                description: 'Please be transparent, as this will help us diagnose your needs accurately and provide you with the most appropriate offer.',
            },
            personnel_expertise: {
                id: 'personnel_expertise',
                type: 'textarea',
                required: true,
                label: 'What personnel or expertise are available to implement the capacity development request?',
            },
            direct_beneficiaries: {
                id: 'direct_beneficiaries',
                type: 'text',
                required: true,
                label: 'Who are the direct beneficiaries of this capacity development request?',
            },
            direct_beneficiaries_number: {
                id: 'direct_beneficiaries_number',
                type: 'number',
                required: true,
                label: 'How many direct beneficiaries do you anticipate once this need is addressed through the service?',
                description: "If uncertain, enter '999'. If at national/regional/global level, enter '0'.",
            },
            expected_outcomes: {
                id: 'expected_outcomes',
                type: 'textarea',
                required: true,
                label: 'What do you hope to achieve through this matchmaking service?',
                description: 'Describe tangible or intangible outputs.',
            },
            success_metrics: {
                id: 'success_metrics',
                type: 'textarea',
                required: true,
                label: 'How will you measure success or impact?',
                description: 'Key indicators, milestones, or other measures of progress.',
            },
            long_term_impact: {
                id: 'long_term_impact',
                type: 'textarea',
                required: true,
                label: 'What is the anticipated long-term impact of the support received through the Capacity Development Facility on your Action and beyond?',
            },
        },
    },
];
