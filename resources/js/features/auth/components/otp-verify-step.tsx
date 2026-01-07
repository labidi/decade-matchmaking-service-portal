import React, { useState, useRef, useEffect, KeyboardEvent, ClipboardEvent, FormEvent } from 'react';
import { Button } from '@ui/primitives/button';
import { Input } from '@ui/primitives/input';
import { Text } from '@ui/primitives/text';
import { EnvelopeIcon } from '@heroicons/react/20/solid';

interface OtpVerifyStepProps {
    maskedEmail: string;
    code: string;
    onCodeChange: (code: string) => void;
    onSubmit: () => void;
    onResend: () => void;
    onBack: () => void;
    isProcessing: boolean;
    error?: string;
    remainingAttempts: number | null;
    resendCooldown: number;
}

export function OtpVerifyStep({
    maskedEmail,
    code,
    onCodeChange,
    onSubmit,
    onResend,
    onBack,
    isProcessing,
    error,
    remainingAttempts,
    resendCooldown,
}: Readonly<OtpVerifyStepProps>) {
    const [digits, setDigits] = useState<string[]>(['', '', '', '', '']);
    const [showSuccess, setShowSuccess] = useState(false);
    const [autoSubmitting, setAutoSubmitting] = useState(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Focus first input on mount
    useEffect(() => {
        inputRefs.current[0]?.focus();
    }, []);

    // Sync digits from external code prop
    useEffect(() => {
        if (code === '') {
            setDigits(['', '', '', '', '']);
            setAutoSubmitting(false);
            inputRefs.current[0]?.focus();
        }
    }, [code]);

    const handleDigitChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;

        const newDigits = [...digits];
        newDigits[index] = value.slice(-1);
        setDigits(newDigits);

        // Update parent code
        const newCode = newDigits.join('');
        onCodeChange(newCode);

        // Move to next input
        if (value && index < 4) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto-submit when all 5 digits entered
        if (newDigits.every(d => d) && newDigits.join('').length === 5) {
            setAutoSubmitting(true);
            onSubmit();
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
            onCodeChange(pastedData);
            inputRefs.current[4]?.focus();
            setAutoSubmitting(true);
            onSubmit();
        }
    };

    const handleFormSubmit = (e: FormEvent) => {
        e.preventDefault();
        onSubmit();
    };

    return (
        <form onSubmit={handleFormSubmit} className="space-y-6">
            {/* Email indicator */}
            <div className="flex items-center justify-center gap-2">
                <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                <Text className="text-gray-600 dark:text-gray-400">
                    {maskedEmail}
                </Text>
            </div>

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
                        disabled={isProcessing || showSuccess}
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

            {/* Verify Button */}
            <div className="flex justify-center">
                <Button
                    type="submit"
                    disabled={isProcessing || digits.some(d => !d) || showSuccess}
                    color="firefly"
                >
                    {isProcessing ? (
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

            {/* Footer Actions */}
            <div className="text-center space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
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
                            onClick={onResend}
                            disabled={isProcessing}
                            className="text-sm text-firefly-600 hover:text-firefly-500 disabled:opacity-50"
                        >
                            Resend code
                        </button>
                    )}
                </div>

                <div>
                    <button
                        type="button"
                        onClick={onBack}
                        disabled={isProcessing}
                        className="text-sm text-gray-600 hover:text-gray-500 disabled:opacity-50"
                    >
                        Use a different email
                    </button>
                </div>
            </div>
        </form>
    );
}
