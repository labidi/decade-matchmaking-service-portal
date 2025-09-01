import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Field, FieldGroup, Fieldset, Label } from '@/components/ui/fieldset';
import { Combobox, ComboboxOption, ComboboxLabel } from '@/components/ui/combobox';
import { Switch, SwitchField } from '@/components/ui/switch';
import { Text } from '@/components/ui/text';
import { EnvelopeIcon } from '@heroicons/react/16/solid';
import { NotificationEntityType } from '@/types/notification-preferences';

interface AddPreferenceDialogProps {
    open: boolean;
    onClose: () => void;
    availableOptions: Record<string, Array<{value: string, label: string}>>;
}

export default function AddPreferenceDialog({
    open,
    onClose,
    availableOptions
}: AddPreferenceDialogProps) {
    const [selectedEntityType, setSelectedEntityType] = useState<NotificationEntityType | null>(null);
    const [selectedAttributeValue, setSelectedAttributeValue] = useState<{value: string, label: string} | undefined>(undefined);

    const { data, setData, post, processing, errors, reset } = useForm({
        entity_type: 'request',
        attribute_value: '',
        email_notification_enabled: true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        post(route('notification.preferences.store'), {
            onSuccess: () => {
                reset();
                setSelectedEntityType(null);
                setSelectedAttributeValue(undefined);
                onClose();
            },
            onError: (errors) => {
                console.error('Failed to create preference:', errors);
            }
        });
    };

    const handleEntityTypeChange = (option: {value: NotificationEntityType, label: string}) => {
        setSelectedEntityType(option.value);
        setSelectedAttributeValue(undefined); // Reset selected value when entity type changes
        setData(prev => ({
            ...prev,
            entity_type: option.value,
            attribute_value: '' // Reset value when type changes
        }));
    };

    const handleAttributeValueChange = (option: {value: string, label: string}) => {
        setSelectedAttributeValue(option);
        setData('attribute_value', option.value);
    };

    const handleClose = () => {
        reset();
        setSelectedEntityType(null);
        setSelectedAttributeValue(undefined);
        onClose();
    };

    // Get available options based on selected entity type
    const currentOptions = selectedEntityType ? (
        selectedEntityType === 'request' ? availableOptions.request || [] :
        selectedEntityType === 'opportunity' ? availableOptions.opportunity || [] : []
    ) : [];

    // Entity type options
    const entityTypeOptions = [
        { value: 'request' as NotificationEntityType, label: 'Requests' },
        { value: 'opportunity' as NotificationEntityType, label: 'Opportunities' },
    ];

    // Get label for the current selection step
    const attributeLabel = selectedEntityType === 'request' ? 'Select Subtheme' : 
                          selectedEntityType === 'opportunity' ? 'Select Opportunity Type' : 
                          'Select Preference';

    return (
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle>Add Notification Preference</DialogTitle>
            <DialogDescription>
                Choose the type of content you want to receive email notifications about when new items are published.
            </DialogDescription>
            <DialogBody>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <Fieldset>
                        <FieldGroup>
                            {/* Entity Type Selection */}
                            <Field>
                                <Label>Notification Type</Label>
                                <Combobox
                                    value={entityTypeOptions.find(opt => opt.value === selectedEntityType)}
                                    onChange={handleEntityTypeChange}
                                    displayValue={(value: {value: NotificationEntityType, label: string} | null) => {
                                        return value?.label ?? '';
                                    }}
                                    placeholder="Select notification type..."
                                    options={entityTypeOptions}
                                >
                                    {(option) => (
                                        <ComboboxOption key={option.value} value={option}>
                                            <ComboboxLabel>{option.label}</ComboboxLabel>
                                        </ComboboxOption>
                                    )}
                                </Combobox>
                                {errors.entity_type && (
                                    <Text className="text-sm text-red-600 dark:text-red-400 mt-1">
                                        {errors.entity_type}
                                    </Text>
                                )}
                            </Field>

                            {/* Attribute Value Selection */}
                            {selectedEntityType && (
                                <Field>
                                    <Label>{attributeLabel}</Label>
                                    <Combobox
                                        value={selectedAttributeValue}
                                        onChange={handleAttributeValueChange}
                                        displayValue={(value: {value: string, label: string} | null) => {
                                            return value?.label ?? '';
                                        }}
                                        placeholder={`Select ${selectedEntityType === 'request' ? 'subtheme' : 'opportunity type'}...`}
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

                        {/* Email Notification Preference */}
                        {selectedEntityType && data.attribute_value && (
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
                    <DialogActions>
                        <Button
                            type="button"
                            plain
                            onClick={handleClose}
                            disabled={processing}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            color="indigo"
                            disabled={processing || !selectedEntityType || !data.attribute_value}
                        >
                            {processing ? 'Adding...' : 'Add Preference'}
                        </Button>
                    </DialogActions>
                </form>
            </DialogBody>
        </Dialog>
    );
}