import React, {useState} from 'react';
import {Head, useForm, usePage} from '@inertiajs/react';
import BackendLayout from '@/Layouts/BackendLayout';
import {UISettingsForm} from "@/Forms";
import FieldRenderer from '@/Components/Forms/FieldRenderer';
import {Settings} from "@/types";
import { useDialog } from '@/Components/Dialogs';

export default function SettingsForm() {
    const page = usePage();
    const SettingsData = page.props.request as Settings || {};
    const { showDialog } = useDialog();

    const {data, setData, post, processing, errors, setError, clearErrors} = useForm({
        site_name: SettingsData.site_name || '',
        site_description: SettingsData.site_description || '',
        logo: null,
        homepage_youtube_video: SettingsData.homepage_youtube_video || '',
    });

    type FormDataKeys = keyof typeof data;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        clearErrors();
        showDialog('Saving Settings', 'loading');
        post(route('partner.opportunity.store'), {
            onSuccess: () => {
                showDialog('Settings saved successfully!', 'success');
            },
            onError: (err) => {
                setError(err as any);
                showDialog('Failed to save settings.', 'error');
            },
        });
    };

    const handleFieldChange = (name: string, value: any) => {
        setData(name as FormDataKeys, value);
    };

    return (
        <BackendLayout>
            <Head title="Admin Requests List"/>
            <div className="bg-white rounded-lg shadow">
                <div className="mx-auto p-6 ">
                    <form onSubmit={handleSubmit}>
                        {UISettingsForm.map((step, idx) => (
                            <div key={step.label}>
                                <h2 className="text-lg font-bold mt-8 mb-2">{step.label}</h2>
                                {Object.entries(step.fields).map(([key, field]) =>
                                    <FieldRenderer
                                        key={key}
                                        name={key}
                                        field={field}
                                        value={(data as any)[key as FormDataKeys]}
                                        error={errors[key as FormDataKeys]}
                                        onChange={handleFieldChange}
                                        formData={data}
                                    />)}
                            </div>
                        ))}
                        <div className="flex justify-end mt-6">
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-4 py-2 bg-firefly-600 text-white rounded hover:bg-firefly-700"
                            >
                                {processing ? 'Saving...' : 'Save Settings'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </BackendLayout>
    )
}
