// resources/js/Pages/RequestForm.tsx
import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import FrontendLayout from '@/Layouts/FrontendLayout';

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
        has_changed: '',
        change_description: '',
        change_effect: '',
        request_link_type: '',
        project_stage: '',
        project_url: '',
        activity_name: '',
        subthemes: [] as string[],
        support_types: [] as string[],
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
    });

    const [step, setStep] = useState(1);
    const steps = ['Identification', 'Details', 'Capacity & Partners', 'Service','Risks','Review'];

    const isPartner = form.data.is_partner === 'Yes';
    const showChange = isPartner && (form.data.has_changed === 'Yes' || form.data.has_changed === 'Maybe');

    const next = () => setStep(prev => Math.min(prev + 1, steps.length));
    const back = () => setStep(prev => Math.max(prev - 1, 1));
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); form.post(route('requests.store')); };

    return (
        <FrontendLayout>
            <Head title="Submit Request" />
            <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-6 bg-white shadow rounded">
                {/* Stepper */}
                <div className="flex mb-6">
                    {steps.map((label, idx) => (
                        <div key={label} className="flex-1">
                            <div className={`w-8 h-8 mx-auto rounded-full text-center leading-8 ${step === idx + 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>{idx + 1}</div>
                            <div className="text-xs text-center mt-2">{label}</div>
                        </div>
                    ))}
                </div>

                {/* Step 1: Identification */}
                {step === 1 && (
                    <>
                        <div class="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                            <label className="block font-medium">Are you an endorsed partner? *</label>
                            <div className="mt-2 space-x-6">
                                {['Yes', 'No'].map(opt => (
                                    <label key={opt} className="inline-flex items-center">
                                        <input type="radio" name="is_partner" value={opt}
                                            checked={form.data.is_partner === opt}
                                            onChange={e => form.setData('is_partner', e.currentTarget.value)}
                                            className="form-radio" required />
                                        <span className="ml-2">{opt}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        {isPartner && (
                            <div>
                                <label htmlFor="unique_id" className="block font-medium">Unique Partner ID *</label>
                                <input id="unique_id" type="text" required
                                    className="mt-1 block w-full border-gray-300 rounded"
                                    value={form.data.unique_id}
                                    onChange={e => form.setData('unique_id', e.currentTarget.value)} />
                            </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="first_name" className="block font-medium">First Name *</label>
                                <input id="first_name" type="text" required
                                    className="mt-1 block w-full border-gray-300 rounded"
                                    value={form.data.first_name}
                                    onChange={e => form.setData('first_name', e.currentTarget.value)} />
                            </div>
                            <div>
                                <label htmlFor="last_name" className="block font-medium">Last Name *</label>
                                <input id="last_name" type="text" required
                                    className="mt-1 block w-full border-gray-300 rounded"
                                    value={form.data.last_name}
                                    onChange={e => form.setData('last_name', e.currentTarget.value)} />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="email" className="block font-medium">Email *</label>
                            <input id="email" type="email" required
                                className="mt-1 block w-full border-gray-300 rounded"
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
                                <div>
                                    <label className="block font-medium">Linked to broader programme? *</label>
                                    <select required className="mt-1 block w-full border-gray-300 rounded"
                                        value={form.data.request_link_type}
                                        onChange={e => form.setData('request_link_type', e.currentTarget.value)}>
                                        <option value="">— Select —</option>
                                        <option value="Broader">Broader Project/Programme</option>
                                        <option value="Standalone">Standalone Request</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block font-medium">Current project stage: *</label>
                                    <select required className="mt-1 block w-full border-gray-300 rounded"
                                        value={form.data.project_stage}
                                        onChange={e => form.setData('project_stage', e.currentTarget.value)}>
                                        <option value="">— Select —</option>
                                        <option value="Planning">Planning</option>
                                        <option value="Approved">Approved</option>
                                        <option value="Implementation">Implementation</option>
                                        <option value="Closed">Closed</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="project_url" className="block font-medium">Related project URL</label>
                                    <input id="project_url" type="url"
                                        className="mt-1 block w-full border-gray-300 rounded"
                                        value={form.data.project_url}
                                        onChange={e => form.setData('project_url', e.currentTarget.value)} />
                                </div>
                                <div>
                                    <label htmlFor="activity_name" className="block font-medium">Activity/Programme name *</label>
                                    <input id="activity_name" type="text" required
                                        className="mt-1 block w-full border-gray-300 rounded"
                                        value={form.data.activity_name}
                                        onChange={e => form.setData('activity_name', e.currentTarget.value)} />
                                </div>
                            </>
                        ) : (
                            // Partner
                            <>
                                <div>
                                    <label className="block font-medium">Has your Action changed? *</label>
                                    <select required className="mt-1 block w-full border-gray-300 rounded"
                                        value={form.data.has_changed}
                                        onChange={e => form.setData('has_changed', e.currentTarget.value)}>
                                        <option value="">— Select —</option>
                                        <option value="Yes">Yes</option>
                                        <option value="No">No</option>
                                        <option value="Maybe">Maybe</option>
                                    </select>
                                </div>
                                {showChange && (
                                    <>
                                        <div>
                                            <label htmlFor="change_description" className="block font-medium">Describe changes *</label>
                                            <textarea id="change_description" required
                                                className="mt-1 block w-full border-gray-300 rounded"
                                                value={form.data.change_description}
                                                onChange={e => form.setData('change_description', e.currentTarget.value)} />
                                        </div>
                                        <div>
                                            <label htmlFor="change_effect" className="block font-medium">How is this affecting your Action? *</label>
                                            <textarea id="change_effect" required
                                                className="mt-1 block w-full border-gray-300 rounded"
                                                value={form.data.change_effect}
                                                onChange={e => form.setData('change_effect', e.currentTarget.value)} />
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
                        <fieldset>
                            <legend className="block font-medium mb-2">Sub-theme(s) *</legend>
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                        </fieldset>
                        <fieldset>
                            <legend className="block font-medium mb-2">Type of support you need *</legend>
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
                        </fieldset>
                        <div>
                            <label htmlFor="gap_description" className="block font-medium">Describe capacity gap *</label>
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
                        <div>
                            <label className="block font-medium">Do you have a partner in mind? *</label>
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
                                <div>
                                    <label htmlFor="partner_name" className="block font-medium">Partner name *</label>
                                    <input id="partner_name" type="text" required
                                        className="mt-1 block w-full border-gray-300 rounded"
                                        value={form.data.partner_name}
                                        onChange={e => form.setData('partner_name', e.currentTarget.value)} />
                                </div>
                                <div>
                                    <label className="block font-medium">Partner confirmed? *</label>
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
                        <div>
                            <label className="block font-medium">Require financial support? *</label>
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
                            <div>
                                <label htmlFor="budget_breakdown" className="block font-medium">
                                    Budget breakdown by category (USD) *
                                </label>
                                <textarea
                                    id="budget_breakdown"
                                    required
                                    className="mt-1 block w-full border-gray-300 rounded"
                                    value={form.data.budget_breakdown}
                                    onChange={e => form.setData('budget_breakdown', e.target.value)}
                                />
                                {form.errors.budget_breakdown && <p className="text-red-600 mt-1">{form.errors.budget_breakdown}</p>}
                            </div>
                        )}

                        {/* Timeline & Impact */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="support_months" className="block font-medium">
                                    Months needed from submission *
                                </label>
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
                            <div>
                                <label htmlFor="completion_date" className="block font-medium">
                                    Anticipated completion date *
                                </label>
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
                        </div>
                    </>
                )}
                {/* Step 4: Review & Submit */}
                {step === 5 && (
                    <>
                    <div>
                    <label htmlFor="risks" className="block font-medium">
                        Risks and contingency measures *
                    </label>
                    <textarea
                        id="risks"
                        required
                        className="mt-1 block w-full border-gray-300 rounded"
                        value={form.data.risks}
                        onChange={e => form.setData('risks', e.target.value)}
                    />
                    {form.errors.risks && <p className="text-red-600 mt-1">{form.errors.risks}</p>}
                </div>

                <div>
                    <label htmlFor="personnel" className="block font-medium">
                        Available personnel/expertise *
                    </label>
                    <textarea
                        id="personnel"
                        required
                        className="mt-1 block w-full border-gray-300 rounded"
                        value={form.data.personnel}
                        onChange={e => form.setData('personnel', e.target.value)}
                    />
                    {form.errors.personnel && <p className="text-red-600 mt-1">{form.errors.personnel}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="direct_beneficiaries" className="block font-medium">
                            Direct beneficiaries description *
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
                    <div>
                        <label htmlFor="direct_beneficiaries_number" className="block font-medium">
                            Number of direct beneficiaries *
                        </label>
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
                </div>

                <div>
                    <label htmlFor="hoped_outcomes" className="block font-medium">
                        What do you hope to achieve? *
                    </label>
                    <textarea
                        id="expected_outcomes"
                        required
                        className="mt-1 block w-full border-gray-300 rounded"
                        value={form.data.expected_outcomes}
                        onChange={e => form.setData('expected_outcomes', e.target.value)}
                    />
                    {form.errors.expected_outcomes && <p className="text-red-600 mt-1">{form.errors.expected_outcomes}</p>}
                </div>

                <div>
                    <label htmlFor="success_metrics" className="block font-medium">
                        How will you measure success? *
                    </label>
                    <textarea
                        id="success_metrics"
                        required
                        className="mt-1 block w-full border-gray-300 rounded"
                        value={form.data.success_metrics}
                        onChange={e => form.setData('success_metrics', e.target.value)}
                    />
                    {form.errors.success_metrics && <p className="text-red-600 mt-1">{form.errors.success_metrics}</p>}
                </div>

                <div>
                    <label htmlFor="long_term_impact" className="block font-medium">
                        Anticipated long-term impact *
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
