import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from '@ui/primitives/button';
import { Field, FieldGroup, Fieldset, Label } from '@ui/primitives/fieldset';
import { Combobox, ComboboxOption, ComboboxLabel } from '@ui/primitives/combobox';
import { Switch, SwitchField } from '@ui/primitives/switch';
import { Text } from '@ui/primitives/text';
import { EnvelopeIcon } from '@heroicons/react/16/solid';

interface AddPreferenceFormProps {
    availableOptions: Record<string, Array<{value: string, label: string}>>;
    attributeTypes: Record<string, string>;
    onClose: () => void;
}


export default function AddPreferenceForm({
    availableOptions,
    attributeTypes,
    onClose
}: Readonly<AddPreferenceFormProps>) {
    const [selectedAttributeType, setSelectedAttributeType] = useState<{value: string, label: string} | undefined>(undefined);
    const [selectedAttributeValue, setSelectedAttributeValue] = useState<{value: string, label: string} | undefined>(undefined);

    const { data, setData, post, processing, errors, reset } = useForm({
        attribute_type: '',
        attribute_value: '',
        email_notification_enabled: true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        post(route('notification.preferences.store'), {
            onSuccess: () => {
                reset();
                onClose();
            },
            onError: (errors) => {
                console.error('Failed to create preference:', errors);
            }
        });
    };

    const handleAttributeTypeChange = (option: {value: string, label: string}) => {
        setSelectedAttributeType(option);
        setSelectedAttributeValue(undefined); // Reset selected value when type changes
        setData(prev => ({
            ...prev,
            attribute_type: option.value,
            attribute_value: '' // Reset value when type changes
        }));
    };

    const handleAttributeValueChange = (option: {value: string, label: string}) => {
        setSelectedAttributeValue(option);
        setData('attribute_value', option.value);
    };

    // Get available options for the selected attribute type
    const currentOptions = selectedAttributeType ? availableOptions[selectedAttributeType.value] || [] : [];

    // Convert attribute types to options for the first combobox
    const attributeTypeOptions = Object.entries(attributeTypes).map(([key, label]) => ({
        value: key,
        label
    }));

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Fieldset>
                <FieldGroup>
                    {/* Attribute Type Selection */}
                    <Field>
                        <Label>Notification Category</Label>
                        <Combobox
                            value={selectedAttributeType}
                            onChange={handleAttributeTypeChange}
                            displayValue={(value: {value: string, label: string} | null) => {
                                return value?.label ?? '';
                            }}
                            placeholder="Select a category..."
                            options={attributeTypeOptions}
                        >
                            {(option) => (
                                <ComboboxOption key={option.value} value={option}>
                                    <ComboboxLabel>{option.label}</ComboboxLabel>
                                </ComboboxOption>
                            )}
                        </Combobox>
                        {errors.attribute_type && (
                            <Text className="text-sm text-red-600 dark:text-red-400 mt-1">
                                {errors.attribute_type}
                            </Text>
                        )}
                    </Field>

                    {/* Attribute Value Selection */}
                    {selectedAttributeType && (
                        <Field>
                            <Label>Specific Value</Label>
                            <Combobox
                                value={selectedAttributeValue}
                                onChange={handleAttributeValueChange}
                                displayValue={(value: {value: string, label: string} | null) => {
                                    return value?.label ?? '';
                                }}
                                placeholder={`Select ${attributeTypes[selectedAttributeType.value].toLowerCase()}...`}
                                options={currentOptions}
                            >
                                {(option) => (
                                    <ComboboxOption key={option.value} value={option}>
                                        <ComboboxLabel>{option.label}</ComboboxLabel>
                                    </ComboboxOption>
                                )}
                            </Combobox>
                            {errors.attribute_value && (
                                <Text className="text-sm text-red-600 dark:text-red-400 mt-1">
                                    {errors.attribute_value}
                                </Text>
                            )}
                        </Field>
                    )}
                </FieldGroup>

                {/* Email SystemNotification Preference */}
                {data.attribute_type && data.attribute_value && (
                    <FieldGroup>
                        <div className="space-y-4">
                            <Text className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                Email Notifications
                            </Text>

                            <SwitchField>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <EnvelopeIcon data-slot="icon" className="size-4 text-indigo-600 dark:text-indigo-400" />
                                        <div>
                                            <Text className="text-sm font-medium">Enable email notifications</Text>
                                            <Text className="text-xs text-zinc-600 dark:text-zinc-400">
                                                Receive email alerts when matching content is published
                                            </Text>
                                        </div>
                                    </div>
                                    <Switch
                                        color="indigo"
                                        checked={data.email_notification_enabled}
                                        onChange={(checked) => setData('email_notification_enabled', checked as any)}
                                    />
                                </div>
                            </SwitchField>
                        </div>
                    </FieldGroup>
                )}
            </Fieldset>

            {/* Form Actions */}
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                <Button
                    type="button"
                    plain
                    onClick={onClose}
                    disabled={processing}
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    color="indigo"
                    disabled={processing || !data.attribute_type || !data.attribute_value}
                >
                    {processing ? 'Adding...' : 'Add Preference'}
                </Button>
            </div>
        </form>
    );
}
