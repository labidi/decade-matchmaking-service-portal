import React from 'react';
import { Button } from '@ui/primitives/button';
import { Field, Label } from '@ui/primitives/fieldset';
import { DocumentArrowUpIcon } from '@heroicons/react/16/solid';
import { InertiaFormProps } from '@inertiajs/react';

interface DocumentUploadFormProps {
    form: InertiaFormProps<{
        file: File | null;
        document_type: string;
    }>;
    onSubmit: (e: React.FormEvent) => void;
    isVisible?: boolean;
}

export function DocumentUploadForm({ form, onSubmit, isVisible = true }: DocumentUploadFormProps) {
    if (!isVisible) return null;

    return (
        <form
            onSubmit={onSubmit}
            className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-blue-700"
        >
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
                <div className="flex-1 w-full">
                    <Field>
                        <Label htmlFor="document-upload">Upload Document</Label>
                        <input
                            id="document-upload"
                            type="file"
                            accept=".pdf,.doc,.docx,.txt"
                            className="mt-1 block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-white dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600"
                            onChange={(e) =>
                                form.setData('file', e.currentTarget.files ? e.currentTarget.files[0] : null)
                            }
                            aria-describedby={form.errors.file ? 'file-error' : undefined}
                        />
                    </Field>
                    {form.errors.file && (
                        <p id="file-error" role="alert" className="mt-1 text-sm text-red-600 dark:text-red-400">
                            {form.errors.file}
                        </p>
                    )}
                </div>

                <Button type="submit" disabled={form.processing || !form.data.file} className="shrink-0 w-full sm:w-auto">
                    <DocumentArrowUpIcon data-slot="icon" />
                    {form.processing ? 'Uploading...' : 'Upload'}
                </Button>
            </div>
        </form>
    );
}
