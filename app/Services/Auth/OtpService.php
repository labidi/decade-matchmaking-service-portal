<?php

declare(strict_types=1);

namespace App\Services\Auth;

use App\Exceptions\Auth\OtpAuthenticationException;
use App\Jobs\Email\SendTransactionalEmail;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class OtpService
{
    private const CACHE_PREFIX = 'otp:';
    private const REQUEST_LIMIT_PREFIX = 'otp:request_limit:';
    private const COOLDOWN_PREFIX = 'otp:cooldown:';

    private int $codeLength;
    private int $expirationMinutes;
    private int $maxRequestsPerHour;
    private int $maxAttempts;
    private int $cooldownSeconds;

    public function __construct()
    {
        $this->codeLength = (int) config('auth.otp.code_length', 5);
        $this->expirationMinutes = (int) config('auth.otp.expiration_minutes', 10);
        $this->maxRequestsPerHour = (int) config('auth.otp.max_requests_per_hour', 5);
        $this->maxAttempts = (int) config('auth.otp.max_attempts', 5);
        $this->cooldownSeconds = (int) config('auth.otp.cooldown_seconds', 60);
    }

    /**
     * Generate and send OTP to the user's email
     *
     * @return array{success: bool, message: string, error?: string, retry_after?: int}
     */
    public function sendOtp(string $email, ?string $ipAddress = null): array
    {
        $normalizedEmail = $this->normalizeEmail($email);
        $hashedEmail = $this->hashEmail($normalizedEmail);

        // Check rate limiting
        if (!$this->canRequestOtp($hashedEmail)) {
            $retryAfter = $this->getRetryAfterSeconds($hashedEmail);
            $this->logOtpAction($normalizedEmail, 'rate_limited', $ipAddress);

            return [
                'success' => false,
                'message' => 'Too many OTP requests. Please try again later.',
                'error' => 'rate_limited',
                'retry_after' => $retryAfter,
            ];
        }

        // Find user
        $user = User::where('email', $normalizedEmail)->first();

        if (!$user) {
            $this->logOtpAction($normalizedEmail, 'user_not_found', $ipAddress);

            // Return success to prevent email enumeration
            return [
                'success' => true,
                'message' => 'If an account exists with this email, an OTP has been sent.',
            ];
        }

        // Check if user is blocked
        if ($user->is_blocked) {
            $this->logOtpAction($normalizedEmail, 'user_blocked', $ipAddress);

            return [
                'success' => false,
                'message' => 'This account has been blocked. Please contact support.',
                'error' => 'user_blocked',
            ];
        }

        // Generate OTP
        $code = $this->generateCode();

        // Store OTP in cache
        $this->storeOtp($hashedEmail, $code, $ipAddress);

        // Record request for rate limiting
        $this->recordOtpRequest($hashedEmail);

        // Send email
        $this->sendOtpEmail($user, $code);

        $this->logOtpAction($normalizedEmail, 'requested', $ipAddress);

        return [
            'success' => true,
            'message' => 'If an account exists with this email, an OTP has been sent.',
        ];
    }

    /**
     * Verify OTP code and return the user
     *
     * @throws OtpAuthenticationException
     */
    public function verifyOtp(string $email, string $code, ?string $ipAddress = null): User
    {
        $normalizedEmail = $this->normalizeEmail($email);
        $hashedEmail = $this->hashEmail($normalizedEmail);

        // Validate code format
        if (!$this->isValidCodeFormat($code)) {
            $remainingAttempts = $this->recordVerificationAttempt($hashedEmail);
            $this->logOtpAction($normalizedEmail, 'invalid_format', $ipAddress);

            throw OtpAuthenticationException::invalidCode($remainingAttempts);
        }

        // Get stored OTP
        $otpData = $this->getOtp($hashedEmail);

        if ($otpData === null) {
            $this->logOtpAction($normalizedEmail, 'not_found', $ipAddress);
            throw OtpAuthenticationException::notFound();
        }

        // Check if max attempts exceeded
        if ($otpData['attempts'] >= $this->maxAttempts) {
            $this->invalidateOtp($hashedEmail);
            $this->logOtpAction($normalizedEmail, 'max_attempts', $ipAddress);

            throw OtpAuthenticationException::maxAttemptsExceeded();
        }

        // Verify code using timing-safe comparison
        if (!hash_equals($otpData['code'], $code)) {
            $this->incrementAttempts($hashedEmail, $otpData);
            $remainingAttempts = $this->maxAttempts - ($otpData['attempts'] + 1);
            $this->logOtpAction($normalizedEmail, 'invalid_code', $ipAddress, [
                'remaining_attempts' => $remainingAttempts,
            ]);

            if ($remainingAttempts <= 0) {
                $this->invalidateOtp($hashedEmail);
                throw OtpAuthenticationException::maxAttemptsExceeded();
            }

            throw OtpAuthenticationException::invalidCode($remainingAttempts);
        }

        // Find user
        $user = User::where('email', $normalizedEmail)->first();

        if (!$user) {
            $this->logOtpAction($normalizedEmail, 'user_not_found_on_verify', $ipAddress);
            throw OtpAuthenticationException::notFound();
        }

        // Invalidate OTP after successful verification
        $this->invalidateOtp($hashedEmail);
        $this->clearRateLimits($hashedEmail);
        $this->logOtpAction($normalizedEmail, 'verified', $ipAddress);

        return $user;
    }

    /**
     * Resend OTP to the user's email
     *
     * @return array{success: bool, message: string, error?: string, retry_after?: int}
     */
    public function resendOtp(string $email, ?string $ipAddress = null): array
    {
        return $this->sendOtp($email, $ipAddress);
    }

    /**
     * Check if OTP request is allowed (rate limiting)
     */
    private function canRequestOtp(string $hashedEmail): bool
    {
        // Check cooldown
        if (Cache::has(self::COOLDOWN_PREFIX . $hashedEmail)) {
            return false;
        }

        // Check hourly limit
        $requestCount = (int) Cache::get(self::REQUEST_LIMIT_PREFIX . $hashedEmail, 0);

        return $requestCount < $this->maxRequestsPerHour;
    }

    /**
     * Record OTP request for rate limiting
     */
    private function recordOtpRequest(string $hashedEmail): void
    {
        $key = self::REQUEST_LIMIT_PREFIX . $hashedEmail;
        $current = (int) Cache::get($key, 0);

        Cache::put($key, $current + 1, 3600); // 1 hour
        Cache::put(self::COOLDOWN_PREFIX . $hashedEmail, true, $this->cooldownSeconds);
    }

    /**
     * Get retry after seconds for rate limiting
     */
    private function getRetryAfterSeconds(string $hashedEmail): int
    {
        if (Cache::has(self::COOLDOWN_PREFIX . $hashedEmail)) {
            return $this->cooldownSeconds;
        }

        return 3600; // 1 hour
    }

    /**
     * Record verification attempt
     */
    private function recordVerificationAttempt(string $hashedEmail): int
    {
        $otpData = $this->getOtp($hashedEmail);

        if ($otpData === null) {
            return 0;
        }

        $this->incrementAttempts($hashedEmail, $otpData);

        return max(0, $this->maxAttempts - ($otpData['attempts'] + 1));
    }

    /**
     * Increment OTP attempts
     *
     * @param array{code: string, attempts: int, created_at: string, ip_address: ?string} $otpData
     */
    private function incrementAttempts(string $hashedEmail, array $otpData): void
    {
        $otpData['attempts']++;

        $remainingTtl = $this->expirationMinutes * 60 -
            (time() - strtotime($otpData['created_at']));

        if ($remainingTtl > 0) {
            Cache::put(self::CACHE_PREFIX . $hashedEmail, $otpData, $remainingTtl);
        }
    }

    /**
     * Generate a secure 5-digit OTP code
     */
    private function generateCode(): string
    {
        $min = (int) pow(10, $this->codeLength - 1);
        $max = (int) pow(10, $this->codeLength) - 1;

        return (string) random_int($min, $max);
    }

    /**
     * Validate OTP code format
     */
    private function isValidCodeFormat(string $code): bool
    {
        return preg_match('/^\d{' . $this->codeLength . '}$/', $code) === 1;
    }

    /**
     * Store OTP in cache
     */
    private function storeOtp(string $hashedEmail, string $code, ?string $ipAddress): void
    {
        $data = [
            'code' => $code,
            'attempts' => 0,
            'created_at' => now()->toDateTimeString(),
            'ip_address' => $ipAddress,
        ];

        Cache::put(
            self::CACHE_PREFIX . $hashedEmail,
            $data,
            $this->expirationMinutes * 60
        );
    }

    /**
     * Get stored OTP data
     *
     * @return array{code: string, attempts: int, created_at: string, ip_address: ?string}|null
     */
    private function getOtp(string $hashedEmail): ?array
    {
        return Cache::get(self::CACHE_PREFIX . $hashedEmail);
    }

    /**
     * Invalidate OTP
     */
    private function invalidateOtp(string $hashedEmail): void
    {
        Cache::forget(self::CACHE_PREFIX . $hashedEmail);
    }

    /**
     * Clear rate limiting data
     */
    private function clearRateLimits(string $hashedEmail): void
    {
        Cache::forget(self::REQUEST_LIMIT_PREFIX . $hashedEmail);
        Cache::forget(self::COOLDOWN_PREFIX . $hashedEmail);
    }

    /**
     * Send OTP email to user
     */
    private function sendOtpEmail(User $user, string $code): void
    {
        SendTransactionalEmail::dispatch(
            'auth.otp',
            $user,
            [
                'user_name' => $user->name ?? 'User',
                'otp_code' => $code,
                'expires_in_minutes' => $this->expirationMinutes,
            ]
        );
    }

    /**
     * Normalize email address
     */
    private function normalizeEmail(string $email): string
    {
        return strtolower(trim($email));
    }

    /**
     * Hash email for cache key
     */
    private function hashEmail(string $email): string
    {
        return hash('sha256', $email);
    }

    /**
     * Log OTP action
     *
     * @param array<string, mixed> $metadata
     */
    private function logOtpAction(
        string $email,
        string $action,
        ?string $ipAddress = null,
        array $metadata = []
    ): void {
        Log::channel('auth')->info('OTP action', array_merge([
            'email_hash' => $this->hashEmail($email),
            'action' => $action,
            'ip_address' => $ipAddress,
        ], $metadata));
    }
}
