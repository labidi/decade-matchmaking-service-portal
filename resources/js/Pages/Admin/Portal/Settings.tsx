import React, {useState, useRef} from 'react';
import {Head, useForm} from '@inertiajs/react';
import {UISettingsForm} from "@/components/forms";
import FieldRenderer from '@/components/ui/forms/field-renderer';
import {Settings, CSVUploadResponse} from "@/types";
import {SidebarLayout} from '@/components/ui/layouts/sidebar-layout'
import {Heading} from "@/components/ui/heading";
import {Button} from "@/components/ui/button";
import {Text} from '@/components/ui/text';
import {CheckCircleIcon, XCircleIcon} from '@heroicons/react/16/solid';

interface SettingsFormProps {
    settings: Settings;
}

export default function SettingsForm({settings}: Readonly<SettingsFormProps>) {
    const [uploadResponse, setUploadResponse] = useState<CSVUploadResponse | null>(null);

    // Store initial values to track changes
    const initialValues = useRef({
        site_name: settings.site_name ?? '',
        site_description: settings.site_description ?? '',
        logo: null,
        homepage_youtube_video: settings.homepage_youtube_video ?? '',
        organizations_csv: null,
        portal_guide: settings.portal_guide ?? '',
        user_guide: settings.user_guide ?? '',
        partner_guide: settings.partner_guide ?? '',
    });

    const {data, setData, post, processing, errors, clearErrors} = useForm(initialValues.current);

    // Track changed fields
    const [changedFields, setChangedFields] = useState<Set<string>>(new Set());

    // File fields that should display existing values
    const fileFields = ['logo', 'portal_guide', 'user_guide', 'partner_guide', 'organizations_csv'];

    // Create a mapping of form field names to settings property names
    const fieldMappings: Record<string, keyof Settings> = {
        logo: 'site_logo',
        portal_guide: 'portal_guide',
        user_guide: 'user_guide',
        partner_guide: 'partner_guide',
        organizations_csv: 'organizations_csv'
    };

    // Function to get existing file info for display
    const getExistingFileInfo = (fieldName: string) => {
        const settingsKey = fieldMappings[fieldName] || fieldName as keyof Settings;
        const existingValue = settings[settingsKey];

        if (!existingValue) return null;

        // If it's a URL, extract filename
        if (existingValue.includes('/')) {
            const parts = existingValue.split('/');
            return parts[parts.length - 1];
        }

        return existingValue;
    };

    // Function to detect if a field has changed
    const hasFieldChanged = (fieldName: string, currentValue: any): boolean => {
        const initialValue = (initialValues.current as any)[fieldName];

        // For file fields, consider them changed if a new file is selected
        if (fileFields.includes(fieldName)) {
            return currentValue !== null && currentValue !== initialValue;
        }

        // For regular fields, compare string values
        return currentValue !== initialValue;
    };

    // Function to get only changed fields for submission
    const getChangedFieldsData = () => {
        const changedData: Record<string, any> = {};

        Object.keys(data).forEach(key => {
            if (hasFieldChanged(key, (data as any)[key])) {
                changedData[key] = (data as any)[key];
            }
        });

        return changedData;
    };

    type FormDataKeys = keyof typeof data;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        clearErrors();
        setUploadResponse(null);

        // Get only changed fields to submit
        const changedData = getChangedFieldsData();

        // If no fields have changed, show a message and return
        if (Object.keys(changedData).length === 0) {
            console.log('No changes detected. Skipping form submission.');
            return;
        }

        console.log('Submitting changed fields:', changedData);

        // For now, submit the full form but mark which fields were changed
        // The backend can optionally use this information for optimization
        console.log('Changed fields for submission:', Array.from(changedFields));

        post(route('admin.settings.update'), {
            onSuccess: (response: any) => {
                // Handle CSV upload response if present
                if (response?.csv_upload_result) {
                    setUploadResponse(response.csv_upload_result);
                }

                // Reset changed fields tracking and update initial values
                setChangedFields(new Set());

                // Update initial values with the current form data
                Object.keys(data).forEach(key => {
                    if (!fileFields.includes(key) || key === 'organizations_csv') {
                        (initialValues.current as any)[key] = (data as any)[key];
                    }
                });

                // Reset CSV file after successful upload
                setData('organizations_csv', null);
            },
            onError: (errors: any) => {
                // Errors are automatically handled by Inertia
                console.error('Settings update failed:', errors);
            }
        });
    };

    const handleFieldChange = (name: string, value: any) => {
        setData(name as FormDataKeys, value);

        // Track which fields have changed
        const newChangedFields = new Set(changedFields);
        if (hasFieldChanged(name, value)) {
            newChangedFields.add(name);
        } else {
            newChangedFields.delete(name);
        }
        setChangedFields(newChangedFields);
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
            <div className="">
                {/* Upload Response Messages */}
                {uploadResponse && (
                    <div className={`mb-6 p-4 rounded-md border flex items-start gap-3 ${
                        uploadResponse.success
                            ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800'
                            : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
                    }`}>
                        {uploadResponse.success ? (
                            <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5 shrink-0" data-slot="icon"/>
                        ) : (
                            <XCircleIcon className="h-5 w-5 text-red-500 mt-0.5 shrink-0" data-slot="icon"/>
                        )}
                        <div className="flex-1">
                            <Text className={`font-medium ${
                                uploadResponse.success
                                    ? 'text-green-800 dark:text-green-400'
                                    : 'text-red-800 dark:text-red-400'
                            }`}>
                                {uploadResponse.message}
                            </Text>
                            {uploadResponse.success && uploadResponse.imported_count && (
                                <Text className="text-sm text-green-700 dark:text-green-300 mt-1">
                                    Successfully imported {uploadResponse.imported_count} organizations.
                                </Text>
                            )}
                            {uploadResponse.errors && uploadResponse.errors.length > 0 && (
                                <div className="mt-2">
                                    <Text className="text-sm text-red-700 dark:text-red-300 font-medium">
                                        Errors encountered:
                                    </Text>
                                    <ul className="mt-1 text-sm text-red-600 dark:text-red-400">
                                        {uploadResponse.errors.slice(0, 5).map((error) => (
                                            <li key={error} className="ml-4">• {error}</li>
                                        ))}
                                        {uploadResponse.errors.length > 5 && (
                                            <li className="ml-4 text-red-500 dark:text-red-400">
                                                • ... and {uploadResponse.errors.length - 5} more errors
                                            </li>
                                        )}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {UISettingsForm.map((step) => (
                        <div key={step.label}>
                            <h2 className="text-lg font-bold mt-8 mb-2">{step.label}</h2>
                            {Object.entries(step.fields).map(([key, field]) => {
                                // Enhance field with existing file information for file inputs
                                const enhancedField = { ...field } as typeof field;

                                if (fileFields.includes(key)) {
                                    const existingFile = getExistingFileInfo(key);
                                    if (existingFile) {
                                        const currentDescription = field.description ?? '';
                                        enhancedField.description = `${currentDescription}${currentDescription ? ' | ' : ''}Current file: ${existingFile}`;
                                    }
                                }

                                return (
                                    <FieldRenderer
                                        key={key}
                                        name={key}
                                        field={enhancedField}
                                        value={(data as any)[key as FormDataKeys]}
                                        error={errors[key as FormDataKeys]}
                                        onChange={handleFieldChange}
                                        formData={data}
                                    />
                                );
                            })}
                        </div>
                    ))}
                    <div className="flex justify-between items-center mt-6">
                        {changedFields.size > 0 && (
                            <Text className="text-sm text-amber-600 dark:text-amber-400">
                                {changedFields.size} field{changedFields.size > 1 ? 's' : ''} modified
                            </Text>
                        )}
                        <div className="flex-1"></div>
                        <Button
                            type="submit"
                            disabled={processing || changedFields.size === 0}
                            className="bg-firefly-600 hover:bg-firefly-700 text-white disabled:opacity-50"
                        >
{(() => {
                                if (processing) return 'Saving...';
                                if (changedFields.size === 0) return 'No Changes';
                                return `Save ${changedFields.size} Change${changedFields.size > 1 ? 's' : ''}`;
                            })()}
                        </Button>
                    </div>
                </form>
            </div>
        </SidebarLayout>
    )
}
