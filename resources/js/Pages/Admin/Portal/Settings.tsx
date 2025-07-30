import React from 'react';
import {Head, useForm, usePage} from '@inertiajs/react';
import {UISettingsForm} from "@/Forms";
import FieldRenderer from '@/Components/Forms/FieldRenderer';
import {Settings} from "@/types";
import {Description, Field, FieldGroup, Fieldset, Label, Legend} from '@/components/ui/fieldset'
import {SidebarLayout} from '@/components/ui/layouts/sidebar-layout'
import {Heading} from "@/components/ui/heading";

export default function SettingsForm() {
    const page = usePage();
    const SettingsData = page.props.request as Settings || {};

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
        
        post(route('admin.settings.update'), {
            onSuccess: () => {
                // Handle success - maybe show a success message
            },
            onError: (errors) => {
                // Errors are automatically handled by Inertia
                console.error('Settings update failed:', errors);
            }
        });
    };

    const handleFieldChange = (name: string, value: any) => {
        setData(name as FormDataKeys, value);
    };

    return (
        <SidebarLayout>
            <Head title="Admin Requests List"/>
            <div className="mx-auto">
                <Heading level={1}>
                    Portal Settings
                </Heading>
                <hr className="my-2 border-zinc-200 dark:border-zinc-700"/>
            </div>
            <div className=" ">
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
        </SidebarLayout>
    )
}
