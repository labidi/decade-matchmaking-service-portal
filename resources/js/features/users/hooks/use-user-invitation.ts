import { useState, useCallback, FormEvent } from 'react';
import axios from 'axios';
import { InvitationResult, InvitationErrorResponse } from '../types/user.types';

interface UseUserInvitationOptions {
    inviteRoute?: string;
    onSuccess?: (result: InvitationResult) => void;
    onError?: (error: InvitationResult) => void;
}

interface UseUserInvitationReturn {
    email: string;
    setEmail: (email: string) => void;
    isInviting: boolean;
    error: string | null;
    success: string | null;
    handleSubmit: (e: FormEvent) => Promise<void>;
    reset: () => void;
    clearMessages: () => void;
}

export function useUserInvitation(options: UseUserInvitationOptions = {}): UseUserInvitationReturn {
    const {
        inviteRoute = 'admin.users.invite',
        onSuccess,
        onError
    } = options;

    const [email, setEmail] = useState('');
    const [isInviting, setIsInviting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const clearMessages = useCallback(() => {
        setError(null);
        setSuccess(null);
    }, []);

    const reset = useCallback(() => {
        setEmail('');
        setIsInviting(false);
        clearMessages();
    }, [clearMessages]);

    const handleSubmit = useCallback(async (e: FormEvent) => {
        e.preventDefault();

        const trimmedEmail = email.trim();
        if (!trimmedEmail) {
            return;
        }

        setIsInviting(true);
        clearMessages();

        try {
            await axios.post(route(inviteRoute), { email: trimmedEmail });

            const successMessage = `Invitation sent to ${trimmedEmail}`;
            setSuccess(successMessage);
            setEmail('');

            const result: InvitationResult = {
                success: true,
                message: successMessage,
                email: trimmedEmail
            };
            onSuccess?.(result);
        } catch (err: unknown) {
            const axiosError = err as InvitationErrorResponse;
            let errorMessage: string;

            if (axiosError.response?.status === 422) {
                errorMessage = axiosError.response.data?.errors?.email?.[0] || 'Invalid email address';
            } else {
                errorMessage = axiosError.response?.data?.message
                    || axiosError.response?.data?.error
                    || 'Failed to send invitation';
            }

            setError(errorMessage);

            const result: InvitationResult = {
                success: false,
                message: errorMessage,
                email: trimmedEmail
            };
            onError?.(result);
        } finally {
            setIsInviting(false);
        }
    }, [email, inviteRoute, onSuccess, onError, clearMessages]);

    return {
        email,
        setEmail,
        isInviting,
        error,
        success,
        handleSubmit,
        reset,
        clearMessages
    };
}
