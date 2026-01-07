import { useForm } from '@inertiajs/react';
import { useState, useCallback, useEffect } from 'react';

type OtpStep = 'email' | 'verify';
type StepDirection = 'forward' | 'backward';

export function useOtpAuthForm() {
    const form = useForm({
        email: '',
        code: '',
    });

    const [step, setStep] = useState<OtpStep>('email');
    const [stepDirection, setStepDirection] = useState<StepDirection>('forward');
    const [maskedEmail, setMaskedEmail] = useState('');
    const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);
    const [resendCooldown, setResendCooldown] = useState(0);

    // Countdown timer for resend cooldown
    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    const handleSendOtp = useCallback(() => {
        form.post(route('otp.send'), {
            preserveState: true,
            preserveScroll: true,
            onSuccess: (page: any) => {
                // Get masked email from response
                const responseData = page.props?.flash?.data || {};
                if (responseData.maskedEmail) {
                    setMaskedEmail(responseData.maskedEmail);
                } else {
                    // Fallback: mask the email ourselves
                    const email = form.data.email;
                    const [local, domain] = email.split('@');
                    const maskedLocal = local.length > 2
                        ? local[0] + '***' + local[local.length - 1]
                        : '***';
                    setMaskedEmail(`${maskedLocal}@${domain}`);
                }
                setStepDirection('forward');
                setStep('verify');
                setResendCooldown(60);
            },
        });
    }, [form]);

    const handleVerifyOtp = useCallback((onSuccess: () => void) => {
        form.post(route('otp.verify.submit'), {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                onSuccess();
            },
            onError: (errors: any) => {
                if (errors.remaining_attempts) {
                    setRemainingAttempts(parseInt(errors.remaining_attempts, 10));
                }
                // Clear code on error
                form.setData('code', '');
            },
        });
    }, [form]);

    const handleResend = useCallback(() => {
        form.post(route('otp.resend'), {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                setResendCooldown(60);
                setRemainingAttempts(null);
                form.setData('code', '');
                form.clearErrors();
            },
        });
    }, [form]);

    const handleBack = useCallback(() => {
        setStepDirection('backward');
        setStep('email');
        form.setData('code', '');
        form.clearErrors();
        setRemainingAttempts(null);
    }, [form]);

    const reset = useCallback(() => {
        setStep('email');
        setStepDirection('forward');
        setMaskedEmail('');
        setRemainingAttempts(null);
        setResendCooldown(0);
        form.reset();
        form.clearErrors();
    }, [form]);

    return {
        form,
        step,
        stepDirection,
        maskedEmail,
        remainingAttempts,
        resendCooldown,
        setResendCooldown,
        handleSendOtp,
        handleVerifyOtp,
        handleResend,
        handleBack,
        reset,
    };
}
