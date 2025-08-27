import {useForm} from '@inertiajs/react';
import {useEffect, useState, useRef} from 'react';
import {UISettingsForm} from '@/components/forms/UISettingsForm';
import {Settings, CSVUploadResponse} from '@/types';

interface UseSettingsFormProps {
    settings?: Settings;
    isEditing?: boolean;
}

export function useSettingsForm({settings, isEditing = false}: UseSettingsFormProps) {
    // Initialize form data
    const initialFormData = {
        site_name: '',
        site_description: '',
        logo: null,
        homepage_youtube_video: '',
        organizations_csv: null,
        portal_guide: '',
        user_guide: '',
        partner_guide: '',
        successful_matches_metric: '',
        fully_closed_matches_metric: '',
        request_in_implementation_metric: '',
        committed_funding_metric: '',
        open_partner_opportunities_metric: '',
    };

    const form = useForm(initialFormData);

    // Store initial values to track changes
    const initialValues = useRef(initialFormData);

    const [step, setStep] = useState(1);
    const steps = UISettingsForm.map((s) => s.label);
    const [errorSteps, setErrorSteps] = useState<number[]>([]);
    const [uploadResponse, setUploadResponse] = useState<CSVUploadResponse | null>(null);
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

    const handleNext = () => setStep(prev => Math.min(prev + 1, steps.length));
    const handleBack = () => setStep(prev => Math.max(prev - 1, 1));

    const handleSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        form.clearErrors();
        setErrorSteps([]);
        setUploadResponse(null);
        // Get only changed fields to submit
        const changedData = getChangedFieldsData();

        // If no fields have changed, show a message and return
        if (Object.keys(changedData).length === 0) {
            console.log('No changes detected. Skipping form submission.');
            return;
        }

        const submitUrl = isEditing
            ? route('admin.settings.update')
            : route('admin.settings.store');
        const submitMethod = isEditing ? 'post' : 'post';

        form[submitMethod](submitUrl, {
            preserveScroll: false,
            onSuccess: (response: any) => {
                // Handle CSV upload response if present
                if (response?.csv_upload_result) {
                    setUploadResponse(response.csv_upload_result);
                }

                // Reset changed fields tracking and update initial values
                setChangedFields(new Set());

                // Update initial values with the current form data
                Object.keys(form.data).forEach(key => {
                    if (!fileFields.includes(key) || key === 'organizations_csv') {
                        (initialValues.current as any)[key] = (form.data as any)[key];
                    }
                });

                // Reset CSV file after successful upload
                form.setData('organizations_csv', null);
            },
            onError: (errors) => {
                const stepsWithError: number[] = [];
                Object.keys(errors).forEach(field => {
                    const idx = UISettingsForm.findIndex(step => step.fields[field]);
                    if (idx !== -1 && !stepsWithError.includes(idx + 1)) {
                        stepsWithError.push(idx + 1);
                    }
                });
                setErrorSteps(stepsWithError);

                // Jump to first step with error
                if (stepsWithError.length > 0) {
                    setStep(stepsWithError[0]);
                }

                console.error('Settings update failed:', errors);
            },
            onFinish: () => {
                // Handle completion - cleanup, etc.
            }
        });
    };

    type FormDataKeys = keyof typeof form.data;

    useEffect(() => {
        if (settings) {
            // Update initial values and form data with existing settings
            const updatedData: any = {...initialFormData};

            Object.entries(settings).forEach(([key, value]) => {
                if (key in form.data && value !== null && value !== undefined) {
                    updatedData[key] = String(value) || '';
                }
            });

            // Update initial values reference
            initialValues.current = updatedData;

            // Update form data
            form.setData(updatedData);
        }
    }, [settings]);

    const handleFieldChange = (name: string, value: any) => {
        form.setData(name as FormDataKeys, value);

        // Track which fields have changed
        const newChangedFields = new Set(changedFields);
        if (hasFieldChanged(name, value)) {
            newChangedFields.add(name);
        } else {
            newChangedFields.delete(name);
        }
        setChangedFields(newChangedFields);
    };

    // Handle file uploads specifically
    const handleFileChange = (fieldName: string, file: File | null) => {
        handleFieldChange(fieldName, file);
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

        Object.keys(form.data).forEach(key => {
            if (hasFieldChanged(key, (form.data as any)[key])) {
                changedData[key] = (form.data as any)[key];
            }
        });

        return changedData;
    };

    // Function to get existing file info for display
    const getExistingFileInfo = (fieldName: string) => {
        const settingsKey = fieldMappings[fieldName] || fieldName as keyof Settings;
        const existingValue = settings?.[settingsKey];

        if (!existingValue) return null;

        // If it's a URL, extract filename
        if (existingValue.includes('/')) {
            const parts = existingValue.split('/');
            return parts[parts.length - 1];
        }

        return existingValue;
    };

    // Get current step data for easier access in components
    const getCurrentStepFields = () => {
        if (step <= 0 || step > UISettingsForm.length) return {};
        return UISettingsForm[step - 1].fields;
    };

    // Check if current step has any errors
    const currentStepHasErrors = () => {
        return errorSteps.includes(step);
    };

    return {
        form,
        step,
        steps,
        errorSteps,
        uploadResponse,
        changedFields,
        fileFields,
        fieldMappings,
        handleNext,
        handleBack,
        handleSubmit,
        handleFieldChange,
        handleFileChange,
        setStep,
        getCurrentStepFields,
        currentStepHasErrors,
        getExistingFileInfo,
        hasFieldChanged,
        getChangedFieldsData,
        setUploadResponse,
    };
}
