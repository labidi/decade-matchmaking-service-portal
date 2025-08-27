import React from 'react';
import {Head} from '@inertiajs/react';
import {UISettingsForm} from "@/components/forms";
import FieldRenderer from '@/components/ui/forms/field-renderer';
import {Settings} from "@/types";
import {SidebarLayout} from '@/components/ui/layouts/sidebar-layout'
import {Heading} from "@/components/ui/heading";
import {Button} from "@/components/ui/button";
import {Text} from '@/components/ui/text';
import {CheckCircleIcon, XCircleIcon} from '@heroicons/react/16/solid';
import {useSettingsForm} from "@/hooks/useSettingsForm";

interface SettingsFormProps {
    settings: Settings;
}

export default function SettingsForm({settings}: Readonly<SettingsFormProps>) {
    const {
        form,
        uploadResponse,
        changedFields,
        fileFields,
        handleSubmit,
        handleFieldChange,
        getExistingFileInfo,
    } = useSettingsForm({settings, isEditing: true});

    const {data, processing, errors} = form;

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
                                        value={(data as any)[key]}
                                        error={(errors as any)[key]}
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