import { useState, useRef, useEffect, FormEvent, KeyboardEvent, ClipboardEvent } from 'react';
import { Head, router } from '@inertiajs/react';
import { FrontendLayout } from '@layouts/index';
import { Button } from '@ui/primitives/button';
import { Input } from '@ui/primitives/input';
import { Text } from '@ui/primitives/text';
import { Link } from '@ui/primitives/link';
import { Heading } from '@ui/primitives/heading';
import { ChevronLeftIcon, EnvelopeIcon } from '@heroicons/react/20/solid';
import axios from 'axios';

interface OtpVerifyProps {
    email: string;
    maskedEmail: string;
}

export default function OtpVerify({ email, maskedEmail }: Readonly<OtpVerifyProps>) {
    const [digits, setDigits] = useState<string[]>(['', '', '', '', '']);
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);
    const [resendCooldown, setResendCooldown] = useState(0);
    const [autoSubmitting, setAutoSubmitting] = useState(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        inputRefs.current[0]?.focus();
    }, []);

    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    const handleDigitChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;

        const newDigits = [...digits];
        newDigits[index] = value.slice(-1);
        setDigits(newDigits);

        if (value && index < 4) {
            inputRefs.current[index + 1]?.focus();
        }

        if (newDigits.every(d => d) && newDigits.join('').length === 5) {
            handleSubmit(newDigits.join(''));
        }
    };

    const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !digits[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 5);

        if (pastedData.length === 5) {
            const newDigits = pastedData.split('');
            setDigits(newDigits);
            inputRefs.current[4]?.focus();
            setAutoSubmitting(true);
            handleSubmit(pastedData);
        }
    };

    const handleSubmit = async (code?: string) => {
        const otpCode = code || digits.join('');

        if (otpCode.length !== 5) {
            setError('Please enter all 5 digits');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await axios.post(route('otp.verify.submit'), {
                code: otpCode,
            });

            if (response.data.success && response.data.redirect) {
                setShowSuccess(true);
                setTimeout(() => router.visit(response.data.redirect), 800);
            }
        } catch (err: any) {
            const data = err.response?.data;

            if (data?.remaining_attempts !== undefined) {
                setRemainingAttempts(data.remaining_attempts);
            }

            if (data?.error_code === 'expired' || data?.error_code === 'max_attempts') {
                setError(data.message);
            } else if (data?.error_code === 'not_found' || data?.error_code === 'no_email') {
                router.visit(route('otp.request'));
            } else {
                setError(data?.message || 'Invalid code');
            }

            setDigits(['', '', '', '', '']);
            setAutoSubmitting(false);
            inputRefs.current[0]?.focus();
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        setIsResending(true);
        setError(null);

        try {
            await axios.post(route('otp.resend'));
            setResendCooldown(60);
            setRemainingAttempts(null);
        } catch (err: any) {
            if (err.response?.status === 429) {
                const retryAfter = err.response.data.retry_after;
                setResendCooldown(retryAfter);
                setError(err.response.data.message);
            } else {
                setError('Failed to resend OTP. Please try again.');
            }
        } finally {
            setIsResending(false);
        }
    };

    const handleFormSubmit = (e: FormEvent) => {
        e.preventDefault();
        handleSubmit();
    };

    return (
        <FrontendLayout>
            <Head title="Verify OTP" />

            <div className="max-w-lg mx-auto mt-8 p-6">
                {/* Back Navigation */}
                <Link
                    href={route('otp.request')}
                    className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-6"
                >
                    <ChevronLeftIcon className="h-4 w-4 mr-1" />
                    Back
                </Link>

                <div className="text-center mb-8">
                    <Heading level={1}>Enter Verification Code</Heading>
                    <div className="flex items-center justify-center gap-2 mt-2">
                        <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                        <Text className="text-gray-600 dark:text-gray-400">
                            We sent a 5-digit code to {maskedEmail}
                        </Text>
                    </div>
                </div>

                <form onSubmit={handleFormSubmit} className="space-y-6">
                    {/* Success State */}
                    {showSuccess && (
                        <div
                            role="status"
                            className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-center transition-opacity duration-200"
                        >
                            <Text className="text-sm text-green-600 dark:text-green-400">
                                Verified! Redirecting...
                            </Text>
                        </div>
                    )}

                    {/* OTP Input Fields */}
                    <div className="flex justify-center gap-2 sm:gap-3">
                        {digits.map((digit, index) => (
                            <Input
                                key={index}
                                ref={(el) => { inputRefs.current[index] = el; }}
                                type="text"
                                inputMode="numeric"
                                pattern="\d*"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleDigitChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                onPaste={handlePaste}
                                className={`w-12 h-12 sm:w-14 sm:h-14 text-center text-xl sm:text-2xl font-mono ${
                                    error ? 'border-red-500' : ''
                                } ${autoSubmitting && !error ? 'border-green-500 ring-2 ring-green-200' : ''}`}
                                disabled={isLoading || showSuccess}
                                aria-label={`Digit ${index + 1}`}
                            />
                        ))}
                    </div>

                    {/* Paste Hint */}
                    <Text className="text-xs text-gray-500 text-center">
                        Tip: You can paste the entire code
                    </Text>

                    {/* Error Message */}
                    {error && (
                        <div
                            role="alert"
                            aria-live="polite"
                            className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-center transition-opacity duration-200"
                        >
                            <Text className="text-sm text-red-600 dark:text-red-400">
                                {error}
                            </Text>
                        </div>
                    )}

                    {/* Remaining Attempts Warning */}
                    {remainingAttempts !== null && remainingAttempts > 0 && (
                        <Text
                            className={`text-sm text-center ${
                                remainingAttempts <= 2
                                    ? 'text-red-600 dark:text-red-400 font-medium'
                                    : 'text-amber-600 dark:text-amber-400'
                            }`}
                        >
                            {remainingAttempts} attempt{remainingAttempts !== 1 ? 's' : ''} remaining
                        </Text>
                    )}

                    {/* Submit Button */}
                    <div className="flex justify-center">
                        <Button
                            type="submit"
                            disabled={isLoading || digits.some(d => !d) || showSuccess}
                            color="firefly"
                        >
                            {isLoading ? (
                                <>
                                    <svg
                                        className="animate-spin -ml-1 mr-2 h-4 w-4"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        />
                                    </svg>
                                    Verifying...
                                </>
                            ) : (
                                'Verify Code'
                            )}
                        </Button>
                    </div>

                    {/* Footer Links */}
                    <div className="text-center space-y-3 mt-8">
                        <div>
                            <Text className="text-sm text-gray-600 dark:text-gray-400">
                                Didn&apos;t receive the code?{' '}
                            </Text>
                            {resendCooldown > 0 ? (
                                <Text className="text-sm text-gray-500">
                                    Resend in {resendCooldown}s
                                </Text>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleResend}
                                    disabled={isResending}
                                    className="text-sm text-firefly-600 hover:text-firefly-500 disabled:opacity-50"
                                >
                                    {isResending ? 'Sending...' : 'Resend code'}
                                </button>
                            )}
                        </div>

                        <div>
                            <Link
                                href={route('otp.request')}
                                className="text-sm text-gray-600 hover:text-gray-500"
                            >
                                Use a different email
                            </Link>
                        </div>

                        <div className="pt-4">
                            <Link
                                href={route('sign.in')}
                                className="text-sm text-firefly-600 hover:text-firefly-500"
                            >
                                Sign in with password instead
                            </Link>
                        </div>
                    </div>
                </form>
            </div>
        </FrontendLayout>
    );
}
