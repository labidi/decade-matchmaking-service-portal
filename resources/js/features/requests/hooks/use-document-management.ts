import { useState, useCallback } from 'react';
import { useForm, router } from '@inertiajs/react';
import axios from 'axios';

interface UseDocumentManagementProps {
    offerId: number;
}

export function useDocumentManagement({ offerId }: UseDocumentManagementProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);

    const uploadForm = useForm<{
        file: File | null;
        document_type: string;
    }>({
        file: null,
        document_type: 'offer_document',
    });

    const handleUpload = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault();

            if (!uploadForm.data.file) {
                setUploadError('Please select a file to upload');
                return;
            }

            // File size validation (10MB max)
            const MAX_FILE_SIZE = 10 * 1024 * 1024;
            if (uploadForm.data.file.size > MAX_FILE_SIZE) {
                setUploadError('File size must be less than 10MB');
                return;
            }

            setUploadError(null);

            uploadForm.post(route('user.offer.document.store', { offer: offerId }), {
                forceFormData: true,
                onSuccess: () => {
                    uploadForm.reset();
                    router.reload({ only: ['request'] });
                },
                onError: (errors) => {
                    const errorMessage = errors.file || 'Failed to upload document. Please try again.';
                    setUploadError(errorMessage);
                    console.error('Upload failed:', errors);
                },
            });
        },
        [uploadForm, offerId]
    );

    const handleDelete = useCallback(async (documentId: number) => {
        if (!confirm('Are you sure you want to delete this document?')) return;

        setIsDeleting(true);
        try {
            await axios.delete(route('user.document.destroy', documentId));
            router.reload({ only: ['request'] });
        } catch (error) {
            console.error('Failed to delete document:', error);
            alert('Failed to delete document. Please try again.');
        } finally {
            setIsDeleting(false);
        }
    }, []);

    return {
        uploadForm,
        handleUpload,
        handleDelete,
        isDeleting,
        uploadError,
    };
}
