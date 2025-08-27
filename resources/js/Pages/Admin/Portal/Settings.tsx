import React from 'react';
import {Head} from '@inertiajs/react';
import {UISettingsForm} from "@/components/forms";
import FieldRenderer from '@/components/ui/forms/field-renderer';
import {Settings} from "@/types";
import {SidebarLayout} from '@/components/ui/layouts/sidebar-layout'
import {Heading} from "@/components/ui/heading";
import {Button} from "@/components/ui/button";
import {Text} from '@/components/ui/text';
import {useSettingsForm} from "@/hooks/useSettingsForm";

interface SettingsFormProps {
    settings: Settings;
}

export default function SettingsForm({settings}: Readonly<SettingsFormProps>) {
    const {
        form,
        changedFields,
        handleSubmit,
        handleFieldChange,
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
                <form onSubmit={handleSubmit}>
                    {UISettingsForm.map((step) => (
                        <div key={step.label}>
                            <h2 className="text-lg font-bold mt-8 mb-2">{step.label}</h2>
                            {Object.entries(step.fields).map(([key, field]) => {
                                // Enhance field with existing file information for file inputs
                                const enhancedField = { ...field } as typeof field;

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
