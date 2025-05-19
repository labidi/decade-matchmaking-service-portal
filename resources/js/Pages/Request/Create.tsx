import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import FrontendLayout from '@/Layouts/FrontendLayout';
import { UIRequestForm } from '@/Forms/UIRequestForm';

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
    'Funding to organize a workshop or training',
    'Technical support for planning and delivering a workshop or training',
    'Facilitation or coordination support',
    'Participation in an existing training or capacity-building event',
    'Access to training materials or curriculum',
    'Other',
];

export default function RequestForm() {
    const form = useForm({
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
    const [step, setStep] = useState(1);
    const steps = ['Identification', 'Details', 'Capacity & Partners', 'Service', 'Risks', 'Review'];

    const isPartner = form.data.is_partner === 'Yes';
    const showChange = isPartner && form.data.has_significant_changes === 'Yes';

    const next = () => setStep(prev => Math.min(prev + 1, steps.length));
    const back = () => setStep(prev => Math.max(prev - 1, 1));
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); form.post(route('requests.store')); };

    return (
        <FrontendLayout>
            <Head title="Submit Request" />

            <form onSubmit={handleSubmit} className="mx-auto bg-white">
                {/* Stepper */}
                <div className="flex mb-6">
                    {steps.map((label, idx) => (
                        <div key={label} className="flex-1">
                            <div className={`w-8 h-8 mx-auto rounded-full text-center leading-8 ${step === idx + 1 ? 'bg-firefly-600 text-white' : 'bg-firefly-200 text-gray-600'}`}>{idx + 1}</div>
                            <div className="text-xl text-center mt-2">{label}</div>
                        </div>
                    ))}
                </div>

                {/* Step 1: Identification */}
                {step === 1 && (
                    <>
                        <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2">
                            <label className="block font-medium">{ UIRequestForm.is_partner.label}</label>
                            <div className="mt-2 space-x-6">
                                {UIRequestForm.is_partner.options.map(opt => (
                                    <label key={opt.value} className="inline-flex items-center">
                                        <input type="radio" name={ UIRequestForm.is_partner.id} value={opt.value}
                                            checked={form.data.is_partner === opt.value}
                                            onChange={e => form.setData('is_partner', e.currentTarget.value)}
                                            className="form-radio" required />
                                        <span className="ml-2">{opt.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        {isPartner && (
                            <div className='mt-8'>
                                <label htmlFor={UIRequestForm.unique_id.id} className="block font-medium">{UIRequestForm.unique_id.label}</label>
                                <p className="mt-1 text-sm text-gray-500">{ UIRequestForm.unique_id.description}</p>
                                <input id={UIRequestForm.unique_id.id} type="text" required
                                    className="mt-1 block w-full border-gray-300 rounded"
                                    value={form.data.unique_id}
                                    onChange={e => form.setData('unique_id', e.currentTarget.value)} />
                            </div>
                        )}
                        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label htmlFor={UIRequestForm.first_name.id} className="block font-medium">{UIRequestForm.first_name.label}</label>
                                <p className="mt-1 text-sm text-gray-500">{UIRequestForm.first_name.description}</p>
                                <input id={UIRequestForm.first_name.id} type="text" required
                                    className="mt-2 block w-full border-gray-300 rounded"
                                    value={form.data.first_name}
                                    onChange={e => form.setData('first_name', e.currentTarget.value)} />
                            </div>
                            <div>
                                <label htmlFor={UIRequestForm.last_name.id} className="block font-medium">{UIRequestForm.last_name.label}</label>
                                <p className="mt-1 text-sm text-gray-500">{UIRequestForm.last_name.description}</p>
                                <input id={UIRequestForm.last_name.id} type="text" required
                                    className="mt-2 block w-full border-gray-300 rounded"
                                    value={form.data.last_name}
                                    onChange={e => form.setData('last_name', e.currentTarget.value)} />
                            </div>
                        </div>
                        <div className='mt-8'>
                            <label htmlFor="email" className="block font-medium">{UIRequestForm.email.label}</label>
                            <p className="mt-1 text-sm text-gray-500">{UIRequestForm.email.description}</p>
                            <input id="email" type="email" required
                                className="mt-2 block w-full border-gray-300 rounded"
                                value={form.data.email}
                                onChange={e => form.setData('email', e.currentTarget.value)} />
                        </div>
                    </>
                )}

                {/* Step 2: Details */}
                {step === 2 && (
                    <>
                        {!isPartner ? (
                            // Prospective
                            <>
                                <div className='mt-4'>
                                    <label className="block font-medium">Is this request linked to a broader programme, project, activity or initiative—whether planned, approved, implemented, or closed—or is it an independent capacity development request? </label>
                                    <select required className="mt-1 block w-full border-gray-300 rounded"
                                        value={form.data.request_link_type}
                                        onChange={e => form.setData('request_link_type', e.currentTarget.value)}>
                                        <option value="">— Select —</option>
                                        <option value="Broader">Part of a Broader Project/Programme/Initiative</option>
                                        <option value="Standalone">Standalone Capacity Development Request</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div className='mt-4'>
                                    <label htmlFor="project_stage" className="block font-medium">Could you please specify the current stage of the programme, project, activity or
                                        initiative? </label>
                                    <select required className="mt-1 block w-full border-gray-300 rounded"
                                        value={form.data.project_stage}
                                        onChange={e => form.setData('project_stage', e.currentTarget.value)}>
                                        <option value="">— Select —</option>
                                        <option value="Planning">Planning</option>
                                        <option value="Approved">Approved</option>
                                        <option value="Implementation">In implementation</option>
                                        <option value="Closed">Closed</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div className='mt-4'>
                                    <label htmlFor="project_url" className="block font-medium">Please share any URLs related to the project document or information to help us
                                        better understand how this request fits within the broader framework.</label>
                                    <input id="project_url" type="url"
                                        className="mt-1 block w-full border-gray-300 rounded"
                                        value={form.data.project_url}
                                        onChange={e => form.setData('project_url', e.currentTarget.value)} />
                                </div>
                                <div className='mt-4'>
                                    <label htmlFor="activity_name" className="block font-medium">Could you please provide the name of the proposal, programme, or initiative—or, if this is a standalone request, the name of the capacity development activity?</label>
                                    <input id="activity_name" type="text" required
                                        className="mt-1 block w-full border-gray-300 rounded"
                                        value={form.data.activity_name}
                                        onChange={e => form.setData('activity_name', e.currentTarget.value)} />
                                </div>
                            </>
                        ) : (
                            // Partner
                            <>
                                <div className='mt-4'>
                                    <label htmlFor={UIRequestForm.capacity_development_title.id} className="block font-medium">{UIRequestForm.capacity_development_title.label}</label>
                                    <input id={UIRequestForm.capacity_development_title.id} type="text" required
                                        className="mt-1 block w-full border-gray-300 rounded"
                                        value={form.data.capacity_development_title}
                                        onChange={e => form.setData('capacity_development_title', e.currentTarget.value)} />
                                </div>
                                <div className='mt-4'>
                                    <label htmlFor={UIRequestForm.has_significant_changes.id} className="block font-medium">{UIRequestForm.has_significant_changes.label}</label>
                                    <select required className="mt-1 block w-full border-gray-300 rounded"
                                        value={form.data.has_significant_changes}
                                        onChange={e => form.setData('has_significant_changes', e.currentTarget.value)}>
                                        <option value="">— Select —</option>
                                        <option value="Yes">Yes</option>
                                        <option value="No">No</option>
                                    </select>
                                </div>
                                {showChange && (
                                    <>
                                        <div className='mt-4'>
                                            <label htmlFor={UIRequestForm.changes_description.id} className="block font-medium">{UIRequestForm.changes_description.label}</label>
                                            <p className="mt-1 text-sm text-gray-500">{UIRequestForm.changes_description.description}</p>
                                            <textarea id={UIRequestForm.changes_description.id} required
                                                className="mt-1 block w-full border-gray-300 rounded"
                                                value={form.data.changes_description}
                                                onChange={e => form.setData('changes_description', e.currentTarget.value)} />
                                        </div>
                                    </>
                                )}
                            </>
                        )}
                    </>
                )}

                {/* Step 3: Capacity & Partners */}
                {step === 3 && (
                    <>
                        <div className='mt-8'>
                            <label htmlFor="related_activity" className="block font-medium">{ UIRequestForm.related_activity.label}</label>
                            <p className="mt-1 text-sm text-gray-500">Please select the option that best describes your request.</p>
                            <select required className="mt-1 block w-full border-gray-300 rounded"
                                value={form.data.related_activity}
                                onChange={e => form.setData('related_activity', e.currentTarget.value)}>
                                <option value="">— Select —</option>
                                <option value="Training">Training</option>
                                <option value="Workshop">Workshop</option>
                                <option value="Both">Both</option>
                            </select>
                        </div>
                        <fieldset className='mt-8'>
                            <legend className="block font-medium mb-2">Which sub-theme(s) of the Capacity Development Facility
                                priorities does your request fall under? </legend>
                            <p className="mt-1 text-sm text-gray-500">Please review the umbrella theme carefully before selecting the
                                corresponding sub-themes.</p>
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
                                {subthemeOptions.map(opt => (
                                    <label key={opt} className="inline-flex items-center">
                                        <input type="checkbox" className="form-checkbox"
                                            checked={form.data.subthemes.includes(opt)}
                                            onChange={() => {
                                                const arr = form.data.subthemes;
                                                form.setData('subthemes', arr.includes(opt) ? arr.filter(i => i !== opt) : [...arr, opt]);
                                            }} required={form.data.subthemes.length === 0} />
                                        <span className="ml-2">{opt}</span>
                                    </label>
                                ))}
                            </div>
                            {form.data.subthemes.includes('Other') && (
                                <div className="mt-2">
                                    <textarea id="subthemes_other" required
                                        className="mt-1 block w-full border-gray-300 rounded"
                                        value={form.data.subthemes_other}
                                        onChange={e => form.setData('subthemes_other', e.currentTarget.value)} />
                                </div>
                            )}
                        </fieldset>
                        <fieldset className='mt-8'>
                            <legend className="block font-medium mb-2">What type of support related to workshops or training are you
                                seeking? </legend>
                            <p className="mt-1 text-sm text-gray-500">If you require another type Agreement of support than what is listed, please specify your needs under 'Other options'.</p>
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {supportOptions.map(opt => (
                                    <label key={opt} className="inline-flex items-center">
                                        <input type="checkbox" className="form-checkbox"
                                            checked={form.data.support_types.includes(opt)}
                                            onChange={() => {
                                                const arr = form.data.support_types;
                                                form.setData('support_types', arr.includes(opt) ? arr.filter(i => i !== opt) : [...arr, opt]);
                                            }} required={form.data.support_types.length === 0} />
                                        <span className="ml-2">{opt}</span>
                                    </label>
                                ))}
                            </div>
                            {form.data.support_types.includes('Other') && (
                                <div className="mt-2">
                                    <textarea id="support_types_other" required
                                        className="mt-1 block w-full border-gray-300 rounded"
                                        value={form.data.support_types_other}
                                        onChange={e => form.setData('support_types_other', e.currentTarget.value)} />
                                </div>
                            )}
                        </fieldset>
                        <div className='mt-8'>
                            <label htmlFor="gap_description" className="block font-medium">Please describe the specific capacity development gap or
                                challenge that this service aims to address.*</label>
                            <p className="mt-1 text-sm text-gray-500">What specific competencies, skills, or resources are you seeking to
                                enhance? Please be as specific as possible.</p>
                            <textarea id="gap_description" required
                                className="mt-1 block w-full border-gray-300 rounded"
                                value={form.data.gap_description}
                                onChange={e => form.setData('gap_description', e.currentTarget.value)} />
                        </div>
                    </>
                )}

                {/* Step 4: Service */}
                {step === 4 && (
                    <>
                        <div className='mt-8'>
                            <label className="block font-medium">Do you already have a partner/service provider in mind to
                                execute your request ?</label>
                            <p className="mt-1 text-sm text-gray-500">You can also check the list of providers on the CDF webpage to explore available options. We also recognize that your organization may serve as both an implementer and executor, and may be seeking support for services you plan to deliver.</p>
                            <select required className="mt-1 block w-full border-gray-300 rounded"
                                value={form.data.has_partner}
                                onChange={e => form.setData('has_partner', e.currentTarget.value)}>
                                <option value="">— Select —</option>
                                <option value="Yes">Yes</option>
                                <option value="No">No</option>
                            </select>
                        </div>
                        {form.data.has_partner === 'Yes' && (
                            <>
                                <div className='mt-8'>
                                    <label htmlFor="partner_name" className="block font-medium">What is the name of the partner or service provider you have
                                        identified ?</label>
                                    <p className="mt-1 text-sm text-gray-500">If your organization intends to deliver the services, please indicate the name of your organization.</p>
                                    <input id="partner_name" type="text" required
                                        className="mt-1 block w-full border-gray-300 rounded"
                                        value={form.data.partner_name}
                                        onChange={e => form.setData('partner_name', e.currentTarget.value)} />
                                </div>
                                <div className='mt-8'>
                                    <label className="block font-medium">Has this partner already been contacted and confirmed ?</label>
                                    <select required className="mt-1 block w-full border-gray-300 rounded"
                                        value={form.data.partner_confirmed}
                                        onChange={e => form.setData('partner_confirmed', e.currentTarget.value)}>
                                        <option value="">— Select —</option>
                                        <option value="Yes">Yes</option>
                                        <option value="No">No</option>
                                    </select>
                                </div>
                            </>
                        )}
                        {/* Financial Support */}
                        <div className='mt-8'>
                            <label className="block font-medium">Do you require financial support from the Capacity Development Facility to address this request ?</label>
                            <select
                                required
                                className="mt-1 block w-full border-gray-300 rounded"
                                value={form.data.needs_financial_support}
                                onChange={e => form.setData('needs_financial_support', e.target.value)}
                            >
                                <option value="">— Select —</option>
                                <option value="Yes">Yes</option>
                                <option value="No">No</option>
                            </select>
                            {form.errors.needs_financial_support && <p className="text-red-600 mt-1">{form.errors.needs_financial_support}</p>}
                        </div>

                        {form.data.needs_financial_support === 'Yes' && (
                            <div className='mt-8'>
                                <label htmlFor="budget_breakdown" className="block font-medium">
                                    To better understand the financial requirements for this request, please provide a budget breakdown by category relevant to your needs.
                                </label>
                                <p className="mt-1 text-sm text-gray-500">Please provide the figures in USD (e.g., Personnel & Staffing: 5,000,
                                    Other (Fellowship): 40,000)</p>
                                <textarea
                                    id="budget_breakdown"
                                    required
                                    className="mt-1 block w-full resize-y border-gray-300 rounded field-sizing-content"
                                    value={form.data.budget_breakdown}
                                    onChange={e => form.setData('budget_breakdown', e.target.value)}
                                    placeholder="- Personnel & Staffing (e.g., salaries, stipends, consultant fees) &#10;- Training & Capacity Building (e.g., workshops, courses, mentoring programs) &#10;- Equipment & Materials (e.g., research instruments, software, educational
materials) Travel &amp; Logistics (e.g., flights, accommodation, local transport)  &#10;-Technology & Digital Infrastructure (e.g., data platforms, software development,
online tools) Event &amp; Meeting Costs (e.g., venue rental, catering, interpretation
services) &#10;-0utreach & Communication (e.g., awareness campaigns, publications, media)
Monitoring &amp;-Evaluation (e.g., impact assessments, reporting, data collection)&#10;-Administration & Overhead (e.g., office costs, operational expenses, institutional
support)  &#10;  Other (please specify)  "
                                />
                                {form.errors.budget_breakdown && <p className="text-red-600 mt-1">{form.errors.budget_breakdown}</p>}
                            </div>
                        )}

                        {/* Timeline & Impact */}
                        <div className='mt-8'>
                            <label htmlFor="support_months" className="block font-medium">
                                How many months from the submission date do you need this support?
                            </label>
                            <p className="mt-1 text-sm text-gray-500">
                                Please provide the figures in USD (e.g., Personnel &amp; Staffing: 5,000, Other (Fellowship): 40,000)
                            </p>
                            <input
                                id="support_months"
                                type="number"
                                required
                                min="0"
                                className="mt-1 block w-full border-gray-300 rounded"
                                value={form.data.support_months}
                                onChange={e => form.setData('support_months', e.target.value)}
                            />
                            {form.errors.support_months && <p className="text-red-600 mt-1">{form.errors.support_months}</p>}
                        </div>

                        <div className='mt-8'>
                            <label htmlFor="completion_date" className="block font-medium">
                                By when do you anticipate completing this activity?
                            </label>
                            <p className="mt-1 text-sm text-gray-500">
                                (For example, if you need support within six months, simply reply “6.”)
                            </p>
                            <input
                                id="completion_date"
                                type="date"
                                required
                                className="mt-1 block w-full border-gray-300 rounded"
                                value={form.data.completion_date}
                                onChange={e => form.setData('completion_date', e.target.value)}
                            />
                            {form.errors.completion_date && <p className="text-red-600 mt-1">{form.errors.completion_date}</p>}
                        </div>
                    </>
                )}
                {/* Step 4: Review & Submit */}
                {step === 5 && (
                    <>
                        <div className='mt-8'>
                            <label htmlFor="risks" className="block font-medium">
                                Please identify and describe any risks you anticipate in implementing this request and contingency measures to address them during the implementation
                            </label>
                            <p className="mt-1 text-sm text-gray-500">Please be transparent, as this will help us diagnose your needs accurately and provide you with the most appropriate offer.</p>
                            <textarea
                                id="risks"
                                required
                                className="mt-1 block w-full border-gray-300 rounded"
                                value={form.data.risks}
                                onChange={e => form.setData('risks', e.target.value)}
                            />
                            {form.errors.risks && <p className="text-red-600 mt-1">{form.errors.risks}</p>}
                        </div>

                        <div className='mt-8'>
                            <label htmlFor="personnel_expertise" className="block font-medium">
                                What personnel or expertise are available to implement the capacity development request ?
                            </label>
                            <textarea
                                id="personnel_expertise"
                                required
                                className="mt-1 block w-full border-gray-300 rounded"
                                value={form.data.personnel_expertise}
                                onChange={e => form.setData('personnel_expertise', e.target.value)}
                            />
                            {form.errors.personnel_expertise && <p className="text-red-600 mt-1">{form.errors.personnel_expertise}</p>}
                        </div>

                        <div className='mt-8'>
                            <label htmlFor="direct_beneficiaries" className="block font-medium">
                                Who are the direct beneficiaries of this capacity development request ?
                            </label>
                            <input
                                id="direct_beneficiaries"
                                type="text"
                                required
                                className="mt-1 block w-full border-gray-300 rounded"
                                value={form.data.direct_beneficiaries}
                                onChange={e => form.setData('direct_beneficiaries', e.target.value)}
                            />
                            {form.errors.direct_beneficiaries && <p className="text-red-600 mt-1">{form.errors.direct_beneficiaries}</p>}
                        </div>
                        <div className='mt-8'>
                            <label htmlFor="direct_beneficiaries_number" className="block font-medium">
                                How many direct beneficiaries do you anticipate once this need is addressed through the service ?
                            </label>
                            <p className="mt-1 text-sm text-gray-500">If you are uncertain of the number of direct beneficiaries at this stage, please enter '999'. If estimating the number is challenging because the program operates at national, regional, or global levels, please enter '0'</p>
                            <input
                                id="direct_beneficiaries_number"
                                type="number"
                                required
                                min="0"
                                className="mt-1 block w-full border-gray-300 rounded"
                                value={form.data.direct_beneficiaries_number}
                                onChange={e => form.setData('direct_beneficiaries_number', e.target.value)}
                            />
                            {form.errors.direct_beneficiaries_number && <p className="text-red-600 mt-1">{form.errors.direct_beneficiaries_number}</p>}
                        </div>
                        <div className='mt-8'>
                            <label htmlFor="expected_outcomes" className="block font-medium">
                                What do you hope to achieve through this matchmaking service ?
                            </label>
                            <p className="mt-1 text-sm text-gray-500">If the output is tangible or intangible, please describe it. For example, tangible outputs could include policy documents or a specific number of individuals trained, while intangible outputs might involve enhanced skills or increased awareness.</p>
                            <textarea
                                id="expected_outcomes"
                                required
                                className="mt-1 block w-full border-gray-300 rounded"
                                value={form.data.expected_outcomes}
                                onChange={e => form.setData('expected_outcomes', e.target.value)}
                            />
                            {form.errors.expected_outcomes && <p className="text-red-600 mt-1">{form.errors.expected_outcomes}</p>}
                        </div>

                       <div className='mt-8'>
                            <label htmlFor="success_metrics" className="block font-medium">
                                How will you measure success or impact ?
                            </label>
                            <p className="mt-1 text-sm text-gray-500">Key indicators, milestones, or other measures of progress.</p>
                            <textarea
                                id="success_metrics"
                                required
                                className="mt-1 block w-full border-gray-300 rounded"
                                value={form.data.success_metrics}
                                onChange={e => form.setData('success_metrics', e.target.value)}
                            />
                            {form.errors.success_metrics && <p className="text-red-600 mt-1">{form.errors.success_metrics}</p>}
                        </div>

                        <div className='mt-8'>
                            <label htmlFor="long_term_impact" className="block font-medium">
                                What is the anticipated long-term impact of the support received through the Capacity Development Facility on your Action and beyond?
                            </label>
                            <textarea
                                id="long_term_impact"
                                required
                                className="mt-1 block w-full border-gray-300 rounded"
                                value={form.data.long_term_impact}
                                onChange={e => form.setData('long_term_impact', e.target.value)}
                            />
                            {form.errors.long_term_impact && <p className="text-red-600 mt-1">{form.errors.long_term_impact}</p>}
                        </div>
                    </>
                )}
                {/* Step 4: Review & Submit */}
                {step === 6 && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Review your entries and submit.</h3>
                        {/* Optionally render a summary here */}
                    </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-6">
                    <button type="button" onClick={back} disabled={step === 1}
                        className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300" >Back</button>
                    {step < 6 ? (
                        <button type="button" onClick={next}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" >Next</button>
                    ) : (
                        <button type="submit" disabled={form.processing}
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                            {form.processing ? 'Submitting...' : 'Submit'}
                        </button>
                    )}
                </div>
            </form>
        </FrontendLayout>
    );
}
