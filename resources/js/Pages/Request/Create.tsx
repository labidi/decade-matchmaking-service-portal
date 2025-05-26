import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import FrontendLayout from '@/Layouts/FrontendLayout';
import { UIRequestForm } from '@/Forms/UIRequestForm';
import XHRMessageDialog from '@/Components/Dialog/XHRMessageDialog';
import axios from 'axios';
import { usePage } from '@inertiajs/react';

const subthemeOptions = [
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

const supportOptions = [
  'Funding to organize a workshop ou formation',
  'Technical support for planning and delivering a workshop ou training',
  'Facilitation or coordination support',
  'Participation in an existing training or capacity-building event',
  'Access to training materials or curriculum',
  'Other',
];

type Mode = 'submit' | 'draft';

type ValidationRule = {
  field: string;
  message: string;
  condition?: () => boolean;
};

export default function RequestForm() {
  const form = useForm({
    id: '',
    is_partner: '',
    unique_id: '',
    first_name: '',
    last_name: '',
    email: '',
    capacity_development_title: '',
    has_significant_changes: '',
    changes_description: '',
    change_effect: '',
    request_link_type: '',
    project_stage: '',
    project_url: '',
    activity_name: '',
    related_activity: '',
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
    personnel_expertise: '',
    direct_beneficiaries: '',
    direct_beneficiaries_number: '',
    expected_outcomes: '',
    success_metrics: '',
    long_term_impact: '',
  });

  type FormDataKeys = keyof typeof form.data;

  const [step, setStep] = useState(1);
  const steps = ['Identification', 'Details', 'Capacity & Partners', 'Service', 'Risks'];

  const [xhrdialogOpen, setXhrDialogOpen] = useState(false);
  const [xhrdialogResponseMessage, setXhrDialogResponseMessage] = useState('');
  const [xhrdialogResponseType, setXhrDialogResponseType] = useState<'success' | 'error' | 'info'>('info');

  const isPartner = form.data.is_partner === 'Yes';

  const validationSchema: Record<number, ValidationRule[]> = {
    1: [
      { field: 'is_partner', message: 'This field is required.' },
      { field: 'first_name', message: 'This field is required.' },
      { field: 'last_name', message: 'This field is required.' },
      { field: 'email', message: 'This field is required.' },
      ...(form.data.is_partner === 'Yes'
        ? [
            { field: 'unique_id', message: 'This field is required.' },
          ]
        : []),
    ],
    2: [
      ...(!isPartner
        ? [
            { field: 'request_link_type', message: 'This field is required.' },
            { field: 'project_stage', message: 'This field is required.' },
            { field: 'project_url', message: 'This field is required.' },
            { field: 'activity_name', message: 'This field is required.' },
          ]
        : []),
      ...(isPartner
        ? [
            { field: 'capacity_development_title', message: 'This field is required.' },
            { field: 'has_significant_changes', message: 'This field is required.' },
            { field: 'changes_description', message: 'This field is required.', condition: () => form.data.has_significant_changes === 'Yes' },
          ]
        : []),
    ],
    3: [
      { field: 'related_activity', message: 'This field is required.' },
      { field: 'subthemes', message: 'This field is required.', condition: () => form.data.subthemes.length > 0 },
      { field: 'support_types', message: 'This field is required.', condition: () => form.data.support_types.length > 0 },
      { field: 'gap_description', message: 'This field is required.' },
      ...(form.data.subthemes.includes('Other')
        ? [
            { field: 'subthemes_other', message: 'This field is required.' },
        ]
        : []),
      ...(form.data.support_types.includes('Other')
        ? [
            { field: 'support_types_other', message: 'This field is required.' },
        ]
        : []),
    ],
    4: [
      { field: 'has_partner', message: 'This field is required.' },
      ...(form.data.has_partner === 'Yes'
        ? [
            { field: 'partner_name', message: 'This field is required.' },
            { field: 'partner_confirmed', message: 'This field is required.' },
          ]
        : []),
      { field: 'needs_financial_support', message: 'This field is required.' },
      ...(form.data.needs_financial_support === 'Yes'
        ? [
            { field: 'budget_breakdown', message: 'This field is required.' },
            { field: 'support_months', message: 'This field is required.' },
            { field: 'completion_date', message: 'This field is required.' },
          ]
        : []),
    ],
    5: [
      { field: 'risks', message: 'This field is required.' },
      { field: 'personnel_expertise', message: 'This field is required.' },
      { field: 'direct_beneficiaries', message: 'This field is required.' },
      { field: 'direct_beneficiaries_number', message: 'This field is required.' },
      { field: 'expected_outcomes', message: 'This field is required.' },
      { field: 'success_metrics', message: 'This field is required.' },
      { field: 'long_term_impact', message: 'This field is required.' },
    ],
  };

const validateForm = (currentMode: 'submit' | 'draft' = 'submit'): boolean => {
  form.clearErrors();

  const errors: Record<string, string> = {};

  if (currentMode === 'draft') return true;

  const schema = validationSchema[step as keyof typeof validationSchema];
  if (!schema) return true;

  schema.forEach(({ field, message, condition }) => {
    // if (condition && !condition()) return;
    const value = (form.data as Record<string, any>)[field];
    console.log(field,': ',  value);
    if (
      value === undefined ||
      value === null ||
      (typeof value === 'string' && value.trim() === '') ||
      (Array.isArray(value) && value.length === 0)
    ) {
      errors[field] = message;
    }
  });

  Object.entries(errors).forEach(([key, message]) => {
    form.setError(key as keyof typeof form.data, message);
  });

  return Object.keys(errors).length === 0;
};

const getInputClass = (fieldName: keyof typeof form.errors) => {
  return `mt-2 block w-full border rounded ${form.errors[fieldName] ? 'border-red-600' : 'border-gray-300'}`;
};

const handleNext = () => {
  const isValid = validateForm();
 // if (isValid) {
    setXhrDialogResponseMessage('');
    setXhrDialogResponseType('info');
    setStep(prev => Math.min(prev + 1, steps.length));
 // }
};

const handleBack = () => {
  setStep(prev => Math.max(prev - 1, 1));
};

const handleSubmitV2 = (mode: 'submit' | 'draft') => {

  const isValid = validateForm(mode);
  if (isValid) {
    axios
    .post(
      route(`request.submit`, { mode }),
      { ...form.data },
      {
        headers: {
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
      }
    )
    .then(function (responseXhr) {
      setXhrDialogResponseType('success');
      form.setData('id', responseXhr.data.request_data.id);
      form.setData('unique_id', responseXhr.data.request_data.unique_id);
      setXhrDialogResponseMessage(responseXhr.data.request_data.message);
    })
    .catch(function (responseXhr) {
      setXhrDialogResponseType('error');
      setXhrDialogResponseMessage(responseXhr.response?.data?.error || 'Something went wrong');
    })
    .finally(() => {
      setXhrDialogOpen(true);
    });
  }
};

    const BannerData = usePage().props;
  console.log(BannerData);

return (
    <FrontendLayout>
      <Head title="Submit Request" />
      <XHRMessageDialog
        open={xhrdialogOpen}
        onOpenChange={setXhrDialogOpen}
        message={xhrdialogResponseMessage}
        type={xhrdialogResponseType}
      />
      <form className="mx-auto bg-white">
        {/* Stepper */}
        <div className="flex mb-6">
          {steps.map((label, idx) => (
            <div key={label} className="flex-1">
              <div
                className={`w-8 h-8 mx-auto rounded-full text-center leading-8 ${
                  step === idx + 1 ? 'bg-firefly-600 text-white' : 'bg-firefly-200 text-gray-600'
                }`}
              >
                {idx + 1}
              </div>
              <div className="text-xl text-center mt-2">{label}</div>
            </div>
          ))}
        </div>

        {/* -- contenu étape 1 -- */}
        {step === 1 && (
          <>
            {/* Id */}
            <input
              id={UIRequestForm.id.id}
              type={UIRequestForm.id.type}
              value={form.data.id}
              onChange={(e) => form.setData('id' as keyof typeof form.data, e.currentTarget.value)}
              className={getInputClass('id')}
            />

            {/* is_partner */}
            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2">
              <label className="block font-medium">{UIRequestForm.is_partner.label}</label>
              <div className="mt-2 space-x-6">
                {UIRequestForm.is_partner.options.map((opt) => (
                  <label key={opt.value} className="inline-flex items-center">
                    <input
                      type="radio"
                      name={UIRequestForm.is_partner.id}
                      value={opt.value}
                      checked={form.data.is_partner === opt.value}
                      onChange={(e) => form.setData('is_partner', e.currentTarget.value)}
                      className={`form-radio ${form.errors['is_partner'] ? 'border-red-600' : 'border-gray-300'}`}
                      required
                    />
                    <span className={`ml-2 ${form.errors['is_partner'] ? 'text-red-600' : 'text-gray'}`}>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
            {/* Si partenaire */}
            {isPartner && (
              <div className="mt-8">
                <label htmlFor={UIRequestForm.unique_id.id} className="block font-medium">
                  {UIRequestForm.unique_id.label}
                </label>
                <p className="mt-1 text-sm text-gray-500">{UIRequestForm.unique_id.description}</p>
                <input
                  id={UIRequestForm.unique_id.id}
                  type="text"
                  required
                  className={getInputClass('unique_id')}
                  value={form.data.unique_id}
                  onChange={(e) => form.setData('unique_id', e.currentTarget.value)}
                />
              </div>
            )}

            {/* Nom & email */}
            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2">
              {/* First Name */}
              <div>
                <label htmlFor={UIRequestForm.first_name.id} className="block font-medium">
                  {UIRequestForm.first_name.label}
                </label>
                <p className="mt-1 text-sm text-gray-500">{UIRequestForm.first_name.description}</p>
                <input
                  id={UIRequestForm.first_name.id}
                  type="text"
                  className={getInputClass('first_name')}
                  value={form.data.first_name}
                  onChange={(e) => form.setData('first_name' as keyof typeof form.data, e.currentTarget.value)}
                />
                {form.errors.first_name && (
                  <p className="text-red-600 text-sm mt-1">{form.errors.first_name}</p>
                )}
              </div>
              {/* Last Name */}
              <div>
                <label htmlFor={UIRequestForm.last_name.id} className="block font-medium">
                  {UIRequestForm.last_name.label}
                </label>
                <p className="mt-1 text-sm text-gray-500">{UIRequestForm.last_name.description}</p>
                <input
                  id={UIRequestForm.last_name.id}
                  type="text"
                  className={getInputClass('last_name')}
                  value={form.data.last_name}
                  onChange={(e) => form.setData('last_name' as keyof typeof form.data, e.currentTarget.value)}
                />
                {form.errors.last_name && (
                  <p className="text-red-600 text-sm mt-1">{form.errors.last_name}</p>
                )}
              </div>
            </div>
            {/* Email */}
            <div className="mt-8">
              <label htmlFor="email" className="block font-medium">
                {UIRequestForm.email.label}
              </label>
              <p className="mt-1 text-sm text-gray-500">{UIRequestForm.email.description}</p>
              <input
                id="email"
                type="email"
                className={getInputClass('email')}
                value={form.data.email}
                onChange={(e) => form.setData('email' as keyof typeof form.data, e.currentTarget.value)}
              />
              {form.errors.email && (
                <p className="text-red-600 text-sm mt-1">{form.errors.email}</p>
              )}
            </div>
          </>
        )}

        {/* -- contenu étape 2 -- */}
        {step === 2 && (
          <>
            {/* Link to broader program */}
            {!isPartner ? (
              <>
                <div className="mt-4">
                  <label className="block font-medium">
                    Is this request linked to a broader programme, project, activity or initiative—whether planned, approved, implemented, or closed—or is it an independent capacity development request?
                  </label>
                  <select
                    required
                    className={getInputClass('request_link_type')}
                    value={form.data.request_link_type}
                    onChange={(e) => form.setData('request_link_type' as keyof typeof form.data, e.currentTarget.value)}
                  >
                    <option value="">— Select —</option>
                    <option value="Broader">Part of a Broader Project/Programme/Initiative</option>
                    <option value="Standalone">Standalone Capacity Development Request</option>
                    <option value="Other">Other</option>
                  </select>
                  {form.errors.request_link_type && (
                    <p className="text-red-600 text-sm mt-1">{form.errors.request_link_type}</p>
                )}
                </div>
                {/* Current stage */}
                <div className="mt-4">
                  <label htmlFor="project_stage" className="block font-medium">
                    Could you specify the current stage of the programme, project, activity or initiative?
                  </label>
                  <select
                    required
                    className={getInputClass('project_stage')}
                    value={form.data.project_stage}
                    onChange={(e) => form.setData('project_stage' as keyof typeof form.data, e.currentTarget.value)}
                  >
                    <option value="">— Select —</option>
                    <option value="Planning">Planning</option>
                    <option value="Approved">Approved</option>
                    <option value="Implementation">In implementation</option>
                    <option value="Closed">Closed</option>
                    <option value="Other">Other</option>
                  </select>
                  {form.errors.project_stage && (
                    <p className="text-red-600 text-sm mt-1">{form.errors.project_stage}</p>
                )}
                </div>
                {/* Project URL */}
                <div className="mt-4">
                  <label htmlFor="project_url" className="block font-medium">
                    Please share any URLs related to the project document or information to help us better understand how this request fits within the broader framework.
                  </label>
                  <input
                    id="project_url"
                    type="url"
                    className={getInputClass('project_url')}
                    value={form.data.project_url}
                    onChange={(e) => form.setData('project_url' as keyof typeof form.data, e.currentTarget.value)}
                  />
                  {form.errors.project_url && (
                    <p className="text-red-600 text-sm mt-1">{form.errors.project_url}</p>
                )}
                </div>
                {/* Activity Name */}
                <div className="mt-4">
                  <label htmlFor="activity_name" className="block font-medium">
                    Could you please provide the name of the proposal, programme, or initiative—or, if this is a standalone request, the name of the capacity development activity?
                  </label>
                  <input
                    id="activity_name"
                    type="text"
                    required
                    className={getInputClass('activity_name')}
                    value={form.data.activity_name}
                    onChange={(e) => form.setData('activity_name' as keyof typeof form.data, e.currentTarget.value)}
                  />
                  {form.errors.activity_name && (
                    <p className="text-red-600 text-sm mt-1">{form.errors.activity_name}</p>
                )}
                </div>
              </>
            ) : (
              <>
                {/* Partenaire */}
                <div className="mt-4">
                  <label htmlFor={UIRequestForm.capacity_development_title.id} className="block font-medium">{UIRequestForm.capacity_development_title.label}</label>
                  <input
                    id={UIRequestForm.capacity_development_title.id}
                    type="text"
                    required
                    className={getInputClass('capacity_development_title')}
                    value={form.data.capacity_development_title}
                    onChange={(e) => form.setData('capacity_development_title' as keyof typeof form.data, e.currentTarget.value)}
                  />
                  {form.errors.capacity_development_title && (
                    <p className="text-red-600 text-sm mt-1">{form.errors.capacity_development_title}</p>
                )}
                </div>
                {/* Significative changes */}
                <div className="mt-4">
                  <label htmlFor={UIRequestForm.has_significant_changes.id} className="block font-medium">{UIRequestForm.has_significant_changes.label}</label>
                  <select
                    required
                    className={getInputClass('has_significant_changes')}
                    value={form.data.has_significant_changes}
                    onChange={(e) => form.setData('has_significant_changes' as keyof typeof form.data, e.currentTarget.value)}
                  >
                    <option value="">— Select —</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                  {form.errors.has_significant_changes && (
                    <p className="text-red-600 text-sm mt-1">{form.errors.has_significant_changes}</p>
                )}
                </div>
                {/* Changes description if Yes */}
                {form.data.has_significant_changes === 'Yes' && (
                  <div className="mt-4">
                    <label htmlFor={UIRequestForm.changes_description.id} className="block font-medium">{UIRequestForm.changes_description.label}</label>
                    <p className="mt-1 text-sm text-gray-500">{UIRequestForm.changes_description.description}</p>
                    <textarea
                      id={UIRequestForm.changes_description.id}
                      required
                      className={getInputClass('changes_description')}
                      value={form.data.changes_description}
                      onChange={(e) => form.setData('changes_description' as keyof typeof form.data, e.currentTarget.value)}
                    />
                    {form.errors.changes_description && (
                    <p className="text-red-600 text-sm mt-1">{form.errors.changes_description}</p>
                )}
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* -- contenu étape 3 -- */}
        {step === 3 && (
          <>
            {/* Related activity */}
            <div className="mt-8">
              <label htmlFor="related_activity" className="block font-medium">{UIRequestForm.related_activity.label}</label>
              <p className="mt-1 text-sm text-gray-500">Please select the option that best describes your request.</p>
              <select
                required
                className={getInputClass('related_activity')}
                value={form.data.related_activity}
                onChange={(e) => form.setData('related_activity' as keyof typeof form.data, e.currentTarget.value)}
              >
                <option value="">— Select —</option>
                <option value="Training">Training</option>
                <option value="Workshop">Workshop</option>
                <option value="Both">Both</option>
              </select>
              {form.errors.related_activity && (
                    <p className="text-red-600 text-sm mt-1">{form.errors.related_activity}</p>
                )}
            </div>
            {/* Sub-themes */}
            <fieldset className="mt-8">
              <legend className="block font-medium mb-2">
                Which sub-theme(s) of the Capacity Development Facility priorities does your request fall under?
              </legend>
              <p className="mt-1 text-sm text-gray-500">Please review the umbrella theme carefully before selecting the corresponding sub-themes.</p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
                {subthemeOptions.map((opt) => (
                  <label key={opt} className="inline-flex items-center">
                    <input
                      type="checkbox"
                      className={`form-checkbox ${form.errors['subthemes'] ? 'border-red-600' : 'border-gray-300'}`}
                      checked={form.data.subthemes.includes(opt)}
                      onChange={() => {
                        const arr = [...form.data.subthemes];
                        if (arr.includes(opt)) {
                          form.setData('subthemes' as keyof typeof form.data, arr.filter((i) => i !== opt));
                        } else {
                          form.setData('subthemes' as keyof typeof form.data, [...arr, opt]);
                        }
                      }}
                    />
                    <span className="ml-2">{opt}</span>
                  </label>
                ))}
              </div>
              {form.data.subthemes.includes('Other') && (
                <div className="mt-2">
                  <textarea
                    id="subthemes_other"
                    required
                    className={getInputClass('subthemes_other')}
                    value={form.data.subthemes_other}
                    onChange={(e) => form.setData('subthemes_other' as keyof typeof form.data, e.currentTarget.value)}
                  />
                  {form.errors.subthemes_other && (
                    <p className="text-red-600 text-sm mt-1">{form.errors.subthemes_other}</p>
                )}
                </div>
              )}
            </fieldset>
            {/* Support types */}
            <fieldset className="mt-8">
              <legend className="block font-medium mb-2">
                What type of support related to workshops or training are you seeking?
              </legend>
              <p className="mt-1 text-sm text-gray-500">If you require support outside listed options, specify under 'Other options'.</p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {supportOptions.map((opt) => (
                  <label key={opt} className="inline-flex items-center">
                    <input
                      type="checkbox"
                      className={`form-checkbox ${form.errors['support_types'] ? 'border-red-600' : 'border-gray-300'}`}
                      checked={form.data.support_types.includes(opt)}
                      onChange={() => {
                        const arr = [...form.data.support_types];
                        if (arr.includes(opt)) {
                          form.setData('support_types' as keyof typeof form.data, arr.filter((i) => i !== opt));
                        } else {
                          form.setData('support_types' as keyof typeof form.data, [...arr, opt]);
                        }
                      }}
                    />
                    <span className="ml-2">{opt}</span>
                  </label>
                ))}
              </div>
              {form.data.support_types.includes('Other') && (
                <div className="mt-2">
                  <textarea
                    id="support_types_other"
                    required
                    className={getInputClass('support_types_other')}
                    value={form.data.support_types_other}
                    onChange={(e) => form.setData('support_types_other' as keyof typeof form.data, e.currentTarget.value)}
                  />
                  {form.errors.support_types_other && (
                    <p className="text-red-600 text-sm mt-1">{form.errors.support_types_other}</p>
                )}
                </div>
              )}
            </fieldset>
            {/* Gap description */}
            <div className="mt-8">
              <label htmlFor="gap_description" className="block font-medium">
                Please describe the specific capacity development gap or challenge that this service aims to address.*
              </label>
              <p className="mt-1 text-sm text-gray-500">Be as specific as possible.</p>
              <textarea
                id="gap_description"
                required
                className={getInputClass('gap_description')}
                value={form.data.gap_description}
                onChange={(e) => form.setData('gap_description' as keyof typeof form.data, e.currentTarget.value)}
              />
              {form.errors.gap_description && (
                    <p className="text-red-600 text-sm mt-1">{form.errors.gap_description}</p>
                )}
            </div>
          </>
        )}

        {/* -- contenu étape 4 -- */}
        {step === 4 && (
          <>
            {/* Partner */}
            <div className="mt-8">
              <label className="block font-medium">
                Do you already have a partner/service provider in mind to execute your request?
              </label>
              <p className="mt-1 text-sm text-gray-500">
                You can also check the list of providers on the CDF webpage to explore available options. We also recognize that your organization may serve as both an implementer and executor, and may be seeking support for services you plan to deliver.
              </p>
              <select
                required
                className={getInputClass('has_partner')}
                value={form.data.has_partner}
                onChange={(e) => form.setData('has_partner' as keyof typeof form.data, e.currentTarget.value)}
              >
                <option value="">— Select —</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
              {form.errors.has_partner && (
                    <p className="text-red-600 text-sm mt-1">{form.errors.has_partner}</p>
                )}
            </div>
            {/* Partner details if Yes */}
            {form.data.has_partner === 'Yes' && (
              <>
                <div className="mt-8">
                  <label htmlFor="partner_name" className="block font-medium">
                    What is the name of the partner or service provider you have identified?
                  </label>
                  <p className="mt-1 text-sm text-gray-500">
                    If your organization intends to deliver the services, please indicate the name of your organization.
                  </p>
                  <input
                    id="partner_name"
                    type="text"
                    required
                    className={getInputClass('partner_name')}
                    value={form.data.partner_name}
                    onChange={(e) => form.setData('partner_name' as keyof typeof form.data, e.currentTarget.value)}
                  />
                  {form.errors.partner_name && (
                    <p className="text-red-600 text-sm mt-1">{form.errors.partner_name}</p>
                )}
                </div>
                <div className="mt-8">
                  <label className="block font-medium">Has this partner already been contacted and confirmed?</label>
                  <select
                    required
                    className={getInputClass('partner_confirmed')}
                    value={form.data.partner_confirmed}
                    onChange={(e) => form.setData('partner_confirmed' as keyof typeof form.data, e.currentTarget.value)}
                  >
                    <option value="">— Select —</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                  {form.errors.partner_confirmed && (
                    <p className="text-red-600 text-sm mt-1">{form.errors.partner_confirmed}</p>
                )}
                </div>
              </>
            )}
            {/* Financial support */}
            <div className="mt-8">
              <label className="block font-medium">
                Do you require financial support from the Capacity Development Facility to address this request?
              </label>
              <select
                required
                className={getInputClass('needs_financial_support')}
                value={form.data.needs_financial_support}
                onChange={(e) => form.setData('needs_financial_support' as keyof typeof form.data, e.currentTarget.value)}
              >
                <option value="">— Select —</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
              {form.errors.needs_financial_support && (
                    <p className="text-red-600 text-sm mt-1">{form.errors.needs_financial_support}</p>
                )}
            </div>
            {/* Budget breakdown if Yes */}
            {form.data.needs_financial_support === 'Yes' && (
              <div className="mt-8">
                <label htmlFor="budget_breakdown" className="block font-medium">
                  To better understand the financial requirements for this request, please provide a budget breakdown by category relevant to your needs.
                </label>
                <p className="mt-1 text-sm text-gray-500">
                  Please provide the figures in USD (e.g., Personnel & Staffing: 5,000, Other (Fellowship): 40,000)
                </p>
                <textarea
                  id="budget_breakdown"
                  required
                  className={getInputClass('budget_breakdown')}
                  value={form.data.budget_breakdown}
                  onChange={(e) => form.setData('budget_breakdown' as keyof typeof form.data, e.currentTarget.value)}
                  placeholder="- Personnel & Staffing (e.g., salaries, stipends, consultant fees) ... "
                />
                {form.errors.budget_breakdown && (
                    <p className="text-red-600 text-sm mt-1">{form.errors.budget_breakdown}</p>
                )}
              </div>
            )}
            {/* Timeline & Impact */}
            <div className="mt-8">
              <label htmlFor="support_months" className="block font-medium">
                How many months from the submission date do you need this support?
              </label>
              <p className="mt-1 text-sm text-gray-500">
                Please provide the figures in USD (e.g., Personnel & Staffing: 5,000, Other (Fellowship): 40,000)
              </p>
              <input
                id="support_months"
                type="number"
                min="0"
                className={getInputClass('support_months')}
                value={form.data.support_months}
                onChange={(e) => form.setData('support_months' as keyof typeof form.data, e.currentTarget.value)}
              />
              {form.errors.support_months && (
                    <p className="text-red-600 text-sm mt-1">{form.errors.support_months}</p>
                )}
            </div>

            <div className="mt-8">
              <label htmlFor="completion_date" className="block font-medium">
                By when do you anticipate completing this activity?
              </label>
              <p className="mt-1 text-sm text-gray-500">
                (For example, if you need support within six months, simply reply “6.”)
              </p>
              <input
                id="completion_date"
                type="date"
                className={getInputClass('completion_date')}
                value={form.data.completion_date}
                onChange={(e) => form.setData('completion_date' as keyof typeof form.data, e.currentTarget.value)}
              />
              {form.errors.completion_date && (
                    <p className="text-red-600 text-sm mt-1">{form.errors.completion_date}</p>
                )}
            </div>
          </>
        )}

        {/* -- contenu étape 5 -- */}
        {step === 5 && (
          <>
            {/* Risks */}
            <div className="mt-8">
              <label htmlFor="risks" className="block font-medium">
                Please identify and describe any risks you anticipate in implementing this request and contingency measures to address them during the implementation
              </label>
              <p className="mt-1 text-sm text-gray-500">
                Please be transparent, as this will help us diagnose your needs accurately and provide you with the most appropriate offer.
              </p>
              <textarea
                id="risks"
                className={getInputClass('risks')}
                value={form.data.risks}
                onChange={(e) => form.setData('risks' as keyof typeof form.data, e.currentTarget.value)}
              />
              {form.errors.risks && (
                    <p className="text-red-600 text-sm mt-1">{form.errors.risks}</p>
                )}
            </div>
            {/* Personnel expertise */}
            <div className="mt-8">
              <label htmlFor="personnel_expertise" className="block font-medium">
                What personnel or expertise are available to implement the capacity development request?
              </label>
              <textarea
                id="personnel_expertise"
                className={getInputClass('personnel_expertise')}
                value={form.data.personnel_expertise}
                onChange={(e) => form.setData('personnel_expertise' as keyof typeof form.data, e.currentTarget.value)}
              />
              {form.errors.personnel_expertise && (
                    <p className="text-red-600 text-sm mt-1">{form.errors.personnel_expertise}</p>
                )}
            </div>
            {/* Direct Beneficiaries */}
            <div className="mt-8">
              <label htmlFor="direct_beneficiaries" className="block font-medium">
                Who are the direct beneficiaries of this capacity development request?
              </label>
              <input
                id="direct_beneficiaries"
                type="text"
                className={getInputClass('direct_beneficiaries')}
                value={form.data.direct_beneficiaries}
                onChange={(e) => form.setData('direct_beneficiaries' as keyof typeof form.data, e.currentTarget.value)}
              />
              {form.errors.direct_beneficiaries && (
                    <p className="text-red-600 text-sm mt-1">{form.errors.direct_beneficiaries}</p>
                )}
            </div>
            {/* Beneficiaries Number */}
            <div className="mt-8">
              <label htmlFor="direct_beneficiaries_number" className="block font-medium">
                How many direct beneficiaries do you anticipate once this need is addressed through the service?
              </label>
              <p className="mt-1 text-sm text-gray-500">
                If uncertain, enter '999'. If at national/regional/global level, enter '0'.
              </p>
              <input
                id="direct_beneficiaries_number"
                type="number"
                min="0"
                className={getInputClass('direct_beneficiaries_number')}
                value={form.data.direct_beneficiaries_number}
                onChange={(e) => form.setData('direct_beneficiaries_number' as keyof typeof form.data, e.currentTarget.value)}
              />
              {form.errors.direct_beneficiaries_number && (
                    <p className="text-red-600 text-sm mt-1">{form.errors.direct_beneficiaries_number}</p>
                )}
            </div>
            {/* Expected Outcomes */}
            <div className="mt-8">
              <label htmlFor="expected_outcomes" className="block font-medium">
                What do you hope to achieve through this matchmaking service?
              </label>
              <p className="mt-1 text-sm text-gray-500">
                Describe tangible or intangible outputs.
              </p>
              <textarea
                id="expected_outcomes"
                className={getInputClass('expected_outcomes')}
                value={form.data.expected_outcomes}
                onChange={(e) => form.setData('expected_outcomes' as keyof typeof form.data, e.currentTarget.value)}
              />
              {form.errors.expected_outcomes && (
                    <p className="text-red-600 text-sm mt-1">{form.errors.expected_outcomes}</p>
                )}
            </div>
            {/* Success Metrics */}
            <div className="mt-8">
              <label htmlFor="success_metrics" className="block font-medium">
                How will you measure success or impact?
              </label>
              <p className="mt-1 text-sm text-gray-500">
                Key indicators, milestones, or other measures of progress.
              </p>
              <textarea
                id="success_metrics"
                className={getInputClass('success_metrics')}
                value={form.data.success_metrics}
                onChange={(e) => form.setData('success_metrics' as keyof typeof form.data, e.currentTarget.value)}
              />
              {form.errors.success_metrics && (
                    <p className="text-red-600 text-sm mt-1">{form.errors.success_metrics}</p>
                )}
            </div>
            {/* Long term impact */}
            <div className="mt-8">
              <label htmlFor="long_term_impact" className="block font-medium">
                What is the anticipated long-term impact of the support received through the Capacity Development Facility on your Action and beyond?
              </label>
              <textarea
                id="long_term_impact"
                className={getInputClass('long_term_impact')}
                value={form.data.long_term_impact}
                onChange={(e) => form.setData('long_term_impact' as keyof typeof form.data, e.currentTarget.value)}
              />
              {form.errors.long_term_impact && (
                    <p className="text-red-600 text-sm mt-1">{form.errors.long_term_impact}</p>
                )}
            </div>
          </>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6">
          <button
            type="button"
            onClick={handleBack}
            disabled={step === 1}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Back
          </button>
          <button
            type="button"
            onClick={() => {
                handleSubmitV2('draft');
              }}
            disabled={form.processing}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700"
          >
            {form.processing ? 'Saving...' : 'Save Draft'}
          </button>
          {step < 5 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-4 py-2 bg-firefly-600 text-white rounded hover:bg-firefly-700"
              disabled={form.processing}
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                handleSubmitV2('submit');
              }}
              disabled={form.processing}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              {form.processing ? 'Submitting...' : 'Submit'}
            </button>
          )}
        </div>
      </form>
    </FrontendLayout>
  );
}