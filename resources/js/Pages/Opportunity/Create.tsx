import { Head, useForm, usePage } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import FrontendLayout from '@/Layouts/FrontendLayout';
import { OCDOpportunity } from '@/types';
import TagsInput from '@/Components/TagsInput';
import { router } from '@inertiajs/react'
import { Tag } from 'react-tag-input';
import axios from 'axios';
import XHRAlertDialog from '@/Components/Dialog/XHRAlertDialog';
import { FormEventHandler } from 'react';

import { Chips } from 'primereact/chips';

import 'primereact/resources/themes/saga-blue/theme.css'; // ou un autre thème
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

export default function CreateOpportunity() {
    const opportunity = usePage().props.request as OCDOpportunity;

    const { data, setData, post, processing, errors, reset, setError, clearErrors } = useForm({
        id: '',
        title: '',
        type: '',
        closing_date: '',
        coverage_activity: '',
        implementation_location: '',
        target_audience: '',
        target_audience_other: '',
        summary: '',
        url: '',
        created_at: '',
        updated_at: '',
        user_id: '',
        key_words: '',
    });

    const getInputClass = () => {
        return "mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500";
    }


    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        clearErrors()
        axios.post(route('partner.opportunity.store'), data)
            .then(response => {
                setXhrDialogResponseMessage('Opportunity created successfully!');
                setXhrDialogResponseType('redirect');
                setXhrDialogOpen(true);
            }).catch(responseerror => {
                console.error(responseerror.response.data.errors);
                setError(responseerror.response.data.errors);
            })
    };

    const [xhrdialogOpen, setXhrDialogOpen] = useState(false);
    const [xhrdialogResponseMessage, setXhrDialogResponseMessage] = useState('');
    const [xhrdialogResponseType, setXhrDialogResponseType] = useState<'success' | 'error' | 'info' | 'redirect'>('info');
    const [tags, setTags] = useState<string[]>([]);
    
    useEffect(() => {
        setData('key_words', tags.join(','));
    }, [tags]);

    return (

        <FrontendLayout>
            <Head title="Create Opportunity" />
            <XHRAlertDialog
                open={xhrdialogOpen}
                onOpenChange={setXhrDialogOpen}
                message={xhrdialogResponseMessage}
                type={xhrdialogResponseType}
                onConfirm={() => {
                    setXhrDialogOpen(false);
                    if (xhrdialogResponseType === 'redirect') {
                        router.visit(route(`partner.opportunity.list`), { method: 'get' });
                    }
                }}
            />
            <div className="mx-auto p-6 ">
                <form onSubmit={handleSubmit}>
                    <input
                        type="hidden"
                        value={data.id}
                        onChange={(e) => setData('id' as keyof typeof data, e.currentTarget.value)}
                    />
                    <div>
                        <label htmlFor="title" className="block font-medium">
                            Title
                        </label>
                        <p className="mt-1 text-base text-gray-500">Specify the Opportunity title</p>
                        <input
                            id="title"
                            type="text"
                            className={getInputClass()}
                            value={data.title}
                            onChange={(e) => setData('title' as keyof typeof data, e.currentTarget.value)}
                        />
                        {errors.title && (
                            <p className="text-red-600 text-base mt-1">{errors.title}</p>
                        )}
                    </div>
                    <div className="mt-4">
                        <label htmlFor="type" className="block font-medium">
                            Type of Opportunity
                        </label>
                        <p className="mt-1 text-base text-gray-500">Specify the type of your Opportunity</p>
                        <select
                            id="type"

                            className={getInputClass()}
                            value={data.type}
                            onChange={(e) => setData('type' as keyof typeof data, e.currentTarget.value)}
                        >
                            <option value="">— Select —</option>
                            <option value="raining">Training</option>
                            <option value="onboarding-expeditions">Onboarding Expeditions, Research & Training</option>
                            <option value="fellowships">Fellowships</option>
                            <option value="internships-jobs">Internships/Jobs</option>
                            <option value="mentorships">Mentorships</option>
                            <option value="visiting-lecturers">Visiting Lecturers/Scholars</option>
                            <option value="travel-grants">Travel Grants</option>
                            <option value="awards">Awards</option>
                            <option value="research-funding">Research Fundings, Grants & Scholarships</option>
                            <option value="access-infrastructure">Access to Infrastructure</option>
                            <option value="ocean-data">Ocean Data, Information and Documentation</option>
                            <option value="networks-community">Professional Networks & Community Building</option>
                            <option value="ocean-literacy">Ocean Literacy, Public Information and Communication</option>
                        </select>
                        {errors.type && (
                            <p className="text-red-600 text-base mt-1">{errors.type}</p>
                        )}
                    </div>
                    <div className="mt-4">
                        <label htmlFor="closing_date" className="block font-medium">
                            Application closing date (MM/DD/YY)
                        </label>
                        <p className="mt-1 text-base text-gray-500">Specify the type of your Opportunity</p>

                        <input
                            id="closing_date"

                            type="date"
                            className={getInputClass()}
                            value={data.closing_date}
                            onChange={(e) => setData('closing_date' as keyof typeof data, e.currentTarget.value)}
                        />
                        {errors.closing_date && (
                            <p className="text-red-600 text-base mt-1">{errors.closing_date}</p>
                        )}
                    </div>

                    <div className="mt-4">
                        <label htmlFor="coverage_activity" className="block font-medium">
                            Coverage of CD Activity
                        </label>
                        <select
                            id="coverage_activity"

                            className={getInputClass()}
                            value={data.coverage_activity}
                            onChange={(e) => setData('coverage_activity' as keyof typeof data, e.currentTarget.value)}
                        >
                            <option value="">— Select —</option>
                            <option value="country">Country</option>
                            <option value="Regions">Regions</option>
                            <option value="Global">Global</option>
                            <option value="Ocean-based">Ocean Based</option>
                        </select>
                        {errors.coverage_activity && (
                            <p className="text-red-600 text-base mt-1">{errors.coverage_activity}</p>
                        )}
                    </div>

                    <div className="mt-4">
                        <label htmlFor="implementation_location" className="block font-medium">
                            Implementation Location
                        </label>
                        <select
                            id="implementation_location"
                            className={getInputClass()}
                            value={data.implementation_location}
                            onChange={(e) => setData('implementation_location' as keyof typeof data, e.currentTarget.value)}
                        >
                            <option value="">— Select —</option>
                            <option value="test">Test</option>

                        </select>
                        {errors.implementation_location && (
                            <p className="text-red-600 text-base mt-1">{errors.implementation_location}</p>
                        )}
                    </div>

                    <div className="mt-4">
                        <label htmlFor="target_audience" className="block font-medium">
                            Target Audience
                        </label>
                        <select
                            id="target_audience"
                            className={getInputClass()}
                            value={data.target_audience}
                            onChange={(e) => setData('target_audience' as keyof typeof data, e.currentTarget.value)}
                        >
                            <option value="">— Select —</option>
                            <option value="academic">Academic</option>
                            <option value="alumni">Alumni</option>
                            <option value="civil-society">Civil Society</option>
                            <option value="sids">Small Island Developing States (SIDS)</option>
                            <option value="decision-makers">Decision Makers</option>
                            <option value="developing-countries">Developing Countries</option>
                            <option value="early-career">Early Career Professionals</option>
                            <option value="researchers">Researchers</option>
                            <option value="doctoral-postdoctoral">Doctoral or Postdoctoral</option>
                            <option value="scientists">Scientists</option>
                            <option value="executives">Executives</option>
                            <option value="technicians">Technicians</option>
                            <option value="general-public">General Public</option>
                            <option value="women">Women</option>
                            <option value="government">Government</option>
                            <option value="youth">Youth</option>
                            <option value="other">Other (Please Specify)</option>
                        </select>
                        {errors.target_audience && (
                            <p className="text-red-600 text-base mt-1">{errors.target_audience}</p>
                        )}
                    </div>

                    {data.target_audience === 'other' && (
                        <div className="mt-4">
                            <label htmlFor="target_audience_other" className="block font-medium">
                                Please specify the target audience
                            </label>
                            <input
                                id="target_audience_other"
                                type="text"
                                className={getInputClass()}
                                value={data.target_audience_other}
                                onChange={(e) => setData('target_audience_other' as keyof typeof data, e.currentTarget.value)}
                            />
                            {errors.target_audience_other && (
                                <p className="text-red-600 text-base mt-1">{errors.target_audience_other}</p>
                            )}
                        </div>
                    )}

                    <div className="mt-4">
                        <label htmlFor="summary" className="block font-medium">
                            Summary of the Opportunity
                        </label>
                        <textarea
                            id="summary"
                            className={getInputClass()}
                            value={data.summary}
                            maxLength={500}
                            rows={4}
                            onChange={(e) => setData('summary' as keyof typeof data, e.currentTarget.value)}
                        />
                        {errors.summary && (
                            <p className="text-red-600 text-base mt-1">{errors.summary}</p>
                        )}
                    </div>

                    <div className="mt-4">
                        <label htmlFor="url" className="block font-medium">
                            Url
                        </label>
                        <input
                            id="url"
                            type="text"
                            className={getInputClass()}
                            value={data.url}
                            onChange={(e) => setData('url' as keyof typeof data, e.currentTarget.value)}
                        />
                        {errors.url && (
                            <p className="text-red-600 text-base mt-1">{errors.url}</p>
                        )}
                    </div>

                    <div className="mt-4">
                        <label htmlFor="url" className="block font-medium">
                            Url
                        </label>
                        <input
                            id="url"
                            type="text"
                            className={getInputClass()}
                            value={data.url}
                            onChange={(e) => setData('url' as keyof typeof data, e.currentTarget.value)}
                        />
                        {errors.url && (
                            <p className="text-red-600 text-base mt-1">{errors.url}</p>
                        )}
                    </div>

                    <div className="mt-4">
                        <label htmlFor="tags" className="block font-medium">
                            Three key words
                        </label>
                        <p className="mt-1 text-base text-gray-500">Add comma (,) to seperate key words or press enter</p>
                        <Chips
                            value={tags}
                            onChange={(e) => setTags(e.value ?? [])}
                            separator=","
                            max={3}
                            allowDuplicate={false}
                            className="w-full"
                            />
                            <input type="hidden" name="key_words" value={data.key_words} />
                    </div>

                    <div className="flex justify-end mt-6">
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-4 py-2 bg-firefly-600 text-white rounded hover:bg-firefly-700"
                        >
                            {processing ? 'Create Opportunity...' : 'Create Opportunity'}
                        </button>
                    </div>
                </form>
            </div>
        </FrontendLayout>
    );
}

import { Head, useForm, usePage } from '@inertiajs/react';
import FrontendLayout from '@/Layouts/FrontendLayout';
import { OCDOpportunity } from '@/types';


type ValidationRule = {
    field: string;
    message: string;
    condition?: () => boolean;
};

export default function CreateOpportunity() {
    const opportunity = usePage().props.request as OCDOpportunity;

    const form = useForm({
        id: '',
        title: '',
        type: '',
        closing_date: '',
        coverage_activity: '',
        implementation_location: '',
        target_audience: '',
        target_audience_other: '',
        summary: '',
        url: '',
        created_at: '',
        updated_at: '',
        user_id: '',        
      });
    
    const getInputClass = (field: keyof typeof form.data) => {
        return `mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
            form.errors[field] ? 'border-red-500' : ''
        }`;
    }

    const isValidUrl = (url: string) => {
        try {
            new URL(url);
            return true;
        } catch (_) {
            return false;
        }
    };
    
    const validationSchema: ValidationRule[] = [
        { field: 'title', message: 'Title is required.' },
        { field: 'type', message: 'Type is required.' },
        { field: 'closing_date', message: 'Closing date is required.' },
        { field: 'coverage_activity', message: 'Coverage activity is required.' },
        { field: 'implementation_location', message: 'Implementation location is required.' },
        { field: 'target_audience', message: 'Target audience is required.' },
        { field: 'summary', message: 'Summary is required.' },
        { field: 'url', message: 'URL is required.' },
        {
            field: 'url',
            message: 'URL format is invalid.',
            condition: () => !!form.data.url && !isValidUrl(form.data.url),
        },
        {
            field: 'target_audience_other',
            message: 'This field is required.',
            condition: () => form.data.target_audience === 'other' && !form.data.target_audience_other,
        }
    ];

    const validateForm = (): boolean => {
        let hasErrors = false;
        form.clearErrors();

        validationSchema.forEach(({ field, message, condition }) => {
            const value = form.data[field as keyof typeof form.data];

            // Validation url format
            if (condition && condition()) {
                form.setError(field as keyof typeof form.data, message);
                hasErrors = true;
            }

            // Sinon, on fait un check "required"
            if (!condition && (!value || (Array.isArray(value) && value.length === 0))) {
                form.setError(field as keyof typeof form.data, message);
                hasErrors = true;
            }
        });

        return !hasErrors;
    };

    const handleSubmit = () => {
        if (!validateForm()) return;
        console.log('Form data is valid:', form.data);
        form.post(route('opportunity.store'), {
            onSuccess: () => form.reset(),
            onError: (errors) => console.error('Submission errors:', errors),
        });
    };
    
    return (
        <FrontendLayout>
            <Head title="Create Opportunity" />
            <div className="max-w-4xl mx-auto p-6 ">
                <form method="POST" action={route('opportunity.store')}>
                    <input
                        type="hidden"
                        value={form.data.id}
                        onChange={(e) => form.setData('id' as keyof typeof form.data, e.currentTarget.value)}
                    />
                    <div>
                        <label htmlFor="title" className="block font-medium">
                            Title
                        </label>
                        <input
                            id="title"
                            type="text"
                            className={getInputClass('title')}
                            value={form.data.title}
                            onChange={(e) => form.setData('title' as keyof typeof form.data, e.currentTarget.value)}
                        />
                        {form.errors.title && (
                            <p className="text-red-600 text-sm mt-1">{form.errors.title}</p>
                        )}
                    </div>
                    <div className="mt-4">
                        <label htmlFor="type" className="block font-medium">
                            Type of Opportunity
                        </label>
                        <select
                            id="type"
                            required
                            className={getInputClass('type')}
                            value={form.data.type}
                            onChange={(e) => form.setData('type' as keyof typeof form.data, e.currentTarget.value)}
                        >
                            <option value="">— Select —</option>
                            <option value="training">Training</option>
                            <option value="onboarding-expeditions">Onboarding Expeditions, Research & Training</option>
                            <option value="fellowships">Fellowships</option>
                            <option value="internships-jobs">Internships/Jobs</option>
                            <option value="mentorships">Mentorships</option>
                            <option value="visiting-lecturers">Visiting Lecturers/Scholars</option>
                            <option value="travel-grants">Travel Grants</option>
                            <option value="awards">Awards</option>
                            <option value="research-funding">Research Fundings, Grants & Scholarships</option>
                            <option value="access-infrastructure">Access to Infrastructure</option>
                            <option value="ocean-data">Ocean Data, Information and Documentation</option>
                            <option value="networks-community">Professional Networks & Community Building</option>
                            <option value="ocean-literacy">Ocean Literacy, Public Information and Communication</option>
                        </select>
                        {form.errors.type && (
                            <p className="text-red-600 text-sm mt-1">{form.errors.type}</p>
                        )}
                    </div>
                    <div className="mt-4">
                        <label htmlFor="closing_date" className="block font-medium">
                            Application closing date (MM/DD/YY)
                        </label>
                        <input
                            id="closing_date"
                            required
                            type="date"
                            className={getInputClass('closing_date')}
                            value={form.data.closing_date}
                            onChange={(e) => form.setData('closing_date' as keyof typeof form.data, e.currentTarget.value)}
                        />
                        {form.errors.closing_date && (
                                <p className="text-red-600 text-sm mt-1">{form.errors.closing_date}</p>
                            )}
                    </div>

                    <div className="mt-4">
                        <label htmlFor="coverage_activity" className="block font-medium">
                            Coverage of CD Activity
                        </label>
                        <select
                            id="coverage_activity"
                            required
                            className={getInputClass('coverage_activity')}
                            value={form.data.coverage_activity}
                            onChange={(e) => form.setData('coverage_activity' as keyof typeof form.data, e.currentTarget.value)}
                        >
                            <option value="">— Select —</option>
                            <option value="country">Country</option>
                            <option value="regions">Regions</option>
                            <option value="global">Global</option>
                            <option value="ocean-based">Ocean Based</option>
                        </select>
                        {form.errors.coverage_activity && (
                            <p className="text-red-600 text-sm mt-1">{form.errors.coverage_activity}</p>
                        )}
                    </div>

                    <div className="mt-4">
                        <label htmlFor="implementation_location" className="block font-medium">
                            Implementation Location
                        </label>
                        <select
                            id="implementation_location"
                            required
                            className={getInputClass('implementation_location')}
                            value={form.data.implementation_location}
                            onChange={(e) => form.setData('implementation_location' as keyof typeof form.data, e.currentTarget.value)}
                        >
                            <option value="">— Select —</option>
                            <option value="test">Test</option>
    
                        </select>
                        {form.errors.implementation_location && (
                            <p className="text-red-600 text-sm mt-1">{form.errors.implementation_location}</p>
                        )}
                    </div>

                    <div className="mt-4">
                        <label htmlFor="target_audience" className="block font-medium">
                            Target Audience
                        </label>
                        <select
                            id="target_audience"
                            required
                            className={getInputClass('target_audience')}
                            value={form.data.target_audience}
                            onChange={(e) => form.setData('target_audience' as keyof typeof form.data, e.currentTarget.value)}
                        >
                            <option value="">— Select —</option>
                            <option value="academic">Academic</option>
                            <option value="alumni">Alumni</option>
                            <option value="civil-society">Civil Society</option>
                            <option value="sids">Small Island Developing States (SIDS)</option>
                            <option value="decision-makers">Decision Makers</option>
                            <option value="developing-countries">Developing Countries</option>
                            <option value="early-career">Early Career Professionals</option>
                            <option value="researchers">Researchers</option>
                            <option value="doctoral-postdoctoral">Doctoral or Postdoctoral</option>
                            <option value="scientists">Scientists</option>
                            <option value="executives">Executives</option>
                            <option value="technicians">Technicians</option>
                            <option value="general-public">General Public</option>
                            <option value="women">Women</option>
                            <option value="government">Government</option>
                            <option value="youth">Youth</option>
                            <option value="other">Other (Please Specify)</option>
                        </select>
                        {form.errors.target_audience && (
                            <p className="text-red-600 text-sm mt-1">{form.errors.target_audience}</p>
                        )}
                    </div>

                    {form.data.target_audience === 'other' && (
                        <div className="mt-4">
                        <label htmlFor="target_audience_other" className="block font-medium">
                            Please specify the target audience
                        </label>
                        <input
                            id="target_audience_other"
                            type="text"
                            className={getInputClass('target_audience_other')}
                            value={form.data.target_audience_other}
                            onChange={(e) => form.setData('target_audience_other' as keyof typeof form.data, e.currentTarget.value)}
                        />
                        {form.errors.target_audience_other && (
                            <p className="text-red-600 text-sm mt-1">{form.errors.target_audience_other}</p>
                        )}
                        </div>
                    )}

                    <div className="mt-4">
                        <label htmlFor="summary" className="block font-medium">
                            Summary of the Opportunity
                        </label>
                        <textarea
                            id="summary"
                            className={getInputClass('summary')}
                            value={form.data.summary}
                            maxLength={500}
                            rows={4}
                            onChange={(e) => form.setData('summary' as keyof typeof form.data, e.currentTarget.value)}
                        />
                        {form.errors.summary && (
                                <p className="text-red-600 text-sm mt-1">{form.errors.summary}</p>
                            )}
                    </div>

                    <div className="mt-4">
                        <label htmlFor="url" className="block font-medium">
                            Url
                        </label>
                        <input
                            id="url"
                            required
                            type="text"
                            className={getInputClass('url')}
                            value={form.data.url}
                            onChange={(e) => form.setData('url' as keyof typeof form.data, e.currentTarget.value)}
                        />
                        {form.errors.url && (
                                <p className="text-red-600 text-sm mt-1">{form.errors.url}</p>
                            )}
                    </div>

                    <div className="flex justify-end mt-6">
                        <button
                            type="button"
                            onClick={() => {
                                handleSubmit();
                            }}
                            disabled={form.processing}
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                            >
                            {form.processing ? 'Create Opportunity...' : 'Create Opportunity'}
                        </button>
                    </div>
                </form>
            </div>
        </FrontendLayout>
    );
}
