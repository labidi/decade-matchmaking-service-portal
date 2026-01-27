import React, {useMemo, useCallback} from 'react';
import {useForm} from '@inertiajs/react';
import {Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle} from '@ui/primitives/dialog';
import {Button} from '@ui/primitives/button';
import {Field, FieldGroup, Fieldset, Label} from '@ui/primitives/fieldset';
import {Combobox, ComboboxOption, ComboboxLabel} from '@ui/primitives/combobox';
import {Text} from '@ui/primitives/text';
import {NotificationEntityType} from '../types/notification-preferences.types';


interface AddPreferenceDialogProps {
    open: boolean;
    onClose: () => void;
    availableOptions: {
        request?: {
            subtheme?: Array<{ value: string, label: string }>;
        };
        opportunity?: {
            type?: Array<{ value: string, label: string }>;
        };
    };
    entityTypes: Record<string, string>;
}

export default function AddPreferenceDialog({
                                                open,
                                                onClose,
                                                availableOptions,
                                                entityTypes
                                            }: Readonly<AddPreferenceDialogProps>) {
    const {data, setData, post, processing, errors, reset} = useForm({
        entity_type: '',
        attribute_value: '',
    });

    // Memoized computations
    const entityTypeOptions = useMemo(() =>
            Object.entries(entityTypes).map(([value, label]) => ({
                value: value as NotificationEntityType,
                label: String(label),
            })),
        [entityTypes]
    );

    const currentOptions = useMemo(() => {
        if (!data.entity_type) return [];
        return data.entity_type === 'request'
            ? availableOptions.request?.subtheme ?? []
            : availableOptions.opportunity?.type ?? [];
    }, [data.entity_type, availableOptions]);

    const attributeLabel = useMemo(() => {
        if (!data.entity_type) return 'Select Preference';
        return data.entity_type === 'request' ? 'Select Subtheme' : 'Select Opportunity Type';
    }, [data.entity_type]);

    // Derive selected options from form data
    const selectedEntityOption = entityTypeOptions.find(opt => opt.value === data.entity_type);
    const selectedAttributeOption = currentOptions.find(opt => opt.value === data.attribute_value);

    // Handlers
    const handleEntityTypeChange = useCallback((option: { value: NotificationEntityType; label: string }) => {
        setData({
            entity_type: option.value,
            attribute_value: '',
        });
    }, [setData]);

    const handleAttributeValueChange = useCallback((option: { value: string; label: string }) => {
        setData('attribute_value', option.value);
    }, [setData]);

    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        post(route('notification.preferences.store'), {
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    }, [post, reset, onClose]);

    const handleClose = useCallback(() => {
        reset();
        onClose();
    }, [reset, onClose]);

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
                                    value={selectedEntityOption}
                                    onChange={handleEntityTypeChange}
                                    displayValue={(option) => option?.label ?? ''}
                                    placeholder="Select notification type..."
                                    options={entityTypeOptions}
                                    portal={true}
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
                            {data.entity_type && (
                                <Field>
                                    <Label>{attributeLabel}</Label>
                                    <Combobox
                                        value={selectedAttributeOption}
                                        onChange={handleAttributeValueChange}
                                        displayValue={(option) => option?.label ?? ''}
                                        placeholder={`Select ${data.entity_type === 'request' ? 'subtheme' : 'opportunity type'}...`}
                                        options={currentOptions}
                                        portal={true}
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
                            disabled={processing || !data.entity_type || !data.attribute_value}
                        >
                            {processing ? 'Adding...' : 'Add Preference'}
                        </Button>
                    </DialogActions>
                </form>
            </DialogBody>
        </Dialog>
    );
}
