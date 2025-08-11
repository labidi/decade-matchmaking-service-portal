import {UIField} from '@/types';

export interface UIStep {
    label: string;
    fields: Record<string, UIField>;
}

export const UIRequestForm: UIStep[] = [
    {
        label: 'Identification',
        fields: {
            is_related_decade_action: {
                id: 'is_related_decade_action',
                type: 'radio',
                required: true,
                label: 'Is this request related an Ocean Decade Action ?',
                description: 'Only Ocean Decade Programmes, Projects, and Contributions are considered official Decade Actions. Activities are not considered Decade Actions.',
                // Options should be provided via formOptions.yes_no from page props
            },
            unique_related_decade_action_id: {
                id: 'unique_action_id',
                type: 'text',
                required: true,
                label: 'Unique Action ID',
                description: 'Unique Action ID.  If you do not know your unique ID, please provide the title of your Action as submitted for the Call for Decade Action.',
                show: data => data.is_related_decade_action === 'Yes',
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
                label: 'Is this request linked to a broader initiative ?',
                // Options should be provided via formOptions.yes_no_lowercase from page props
                show: data => data.is_related_decade_action !== 'Yes',
            },
            project_stage: {
                id: 'project_stage',
                type: 'select',
                required: true,
                label: 'Could you specify the current stage of the initiative?',
                options: [
                    {value: 'Planning', label: 'Planning'},
                    {value: 'Approved', label: 'Approved'},
                    {value: 'Implementation', label: 'In implementation'},
                    {value: 'Closed', label: 'Closed'},
                    {value: 'Other', label: 'Other'},
                ],
                show: data => data.request_link_type === 'yes' && data.is_related_decade_action !== 'Yes',
            },
            project_url: {
                id: 'project_url',
                type: 'url',
                label: 'Please share any URLs related to the project document or information to help us better understand how this request fits within the broader framework.',
                show: data => data.is_related_decade_action !== 'Yes',
            },
            has_significant_changes: {
                id: 'has_significant_changes',
                type: 'select',
                required: true,
                label: 'Has your Action undergone any significant changes to its activities or framework since its endorsement ?',
                // Options should be provided via formOptions.yes_no from page props
                show: data => data.is_related_decade_action === 'Yes',
            },
            changes_description: {
                id: 'changes_description',
                type: 'textarea',
                required: true,
                label: 'Please explain how this is affecting your Action.',
                description: "If the capacity development gap/challenge is not affecting the overall implementation of your Action, please enter 'NA'.",
                show: data => data.is_related_decade_action === 'Yes' && data.has_significant_changes === 'Yes',
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
                // Options should be provided via formOptions.related_activity from page props
            },
            delivery_format: {
                id: 'delivery_format',
                type: 'select',
                required: true,
                label: 'What is the delivery format of this training/workshop? ',
                // Options should be provided via formOptions.delivery_format from page props
            },
            delivery_countries: {
                  id: 'delivery_countries',
                  type: 'multiselect',
                  // options should be provided by the parent component from backend location data
                  required: false,
                  label: 'What is the delivery country? ',
                  show: data => data.delivery_format !== 'Online',
              },
              target_audience: {
                  id: 'target_audience',
                  type: 'multiselect',
                  required: true,
                  label: 'Who is the target audience (multiple choice allowed)?',
                  // Options should be provided via formOptions.target_audience from page props
              },
              target_audience_other: {
                  id: 'target_audience_other',
                  type: 'text',
                  required: false,
                  show: data => data.target_audience === 'Other (Please Specify)',
                  placeholder: 'Please specify the target audience',
              },
              subthemes: {
                  id: 'subthemes',
                  type: 'checkbox-group',
                  required: true,
                  label: 'Which sub-theme(s) of the Capacity Development Facility priorities does your request fall under?',
                  image : '/assets/img/cdf_subthemes.svg',
                  description: 'Please review the umbrella theme carefully before selecting the corresponding sub-themes.',
                  // Options should be provided via formOptions.subthemes from page props
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
                // Options should be provided via formOptions.support_types from page props
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
                // Options should be provided via formOptions.yes_no from page props
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
                // Options should be provided via formOptions.yes_no from page props
                show: data => data.has_partner === 'Yes',
            },
            needs_financial_support: {
                id: 'needs_financial_support',
                type: 'select',
                required: true,
                label: 'Do you require financial support from the Capacity Development Facility to address this request?',
                // Options should be provided via formOptions.yes_no from page props
            },
            budget_breakdown: {
                id: 'budget_breakdown',
                type: 'textarea',
                required: true,
                label: 'To better understand the financial requirements for this request, please provide a budget breakdown by category relevant to your needs.',
                description: 'Please provide the figures in USD (e.g., Personnel & Staffing: 5,000, Other (Fellowship): 40,000)',
                placeholder: 'Personnel  & Staffing (e.g., salaries, stipends, consultant fees)\n' +
                    'Training & Capacity Building (e.g., workshops, courses, mentoring programs) \n' +
                    'Equipment & Materials (e.g., research instruments,  software, educational materials) Travel & Logistics (e.g., flights, accommodation, local transport)\n' +
                    'Technology  & Digital Infrastructure (e.g., data platforms, software development, online tools) Event & Meeting Costs (e.g., venue rental, catering, interpretation services)\n' +
                    '0utreach  & Communication (e.g., awareness campaigns, publications, media) Monitoring  & Evaluation (e.g., impact assessments, reporting, data collection)\n' +
                    'Administration & Overhead (e.g., office costs, operational expenses, institutional support)\n' +
                    'Other (please specify)',
                show: data => data.needs_financial_support === 'Yes',
            },
            support_months: {
                id: 'support_months',
                type: 'number',
                required: true,
                label: 'How many months from the submission date do you need this support?',
                description: 'For example, if you need support within six months, simply reply "6."'
            },
            completion_date: {
                id: 'completion_date',
                type: 'date',
                required: true,
                label: 'By when do you anticipate completing this activity?'
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
                label: 'How will this activity contribute to or strengthen co-design, co-production, and co-delivery—helping close geographic, generational, and gender gaps?',
            },
        },
    },
];
