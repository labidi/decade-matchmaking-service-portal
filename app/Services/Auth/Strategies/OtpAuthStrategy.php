<?php

declare(strict_types=1);

namespace App\Services\Auth\Strategies;

use App\Contracts\Auth\AuthenticationStrategyInterface;
use App\Exceptions\Auth\OtpAuthenticationException;
use App\Models\User;
use App\Services\Auth\OtpService;
use Illuminate\Support\Facades\Log;

class OtpAuthStrategy implements AuthenticationStrategyInterface
{
    public function __construct(
        private readonly OtpService $otpService
    ) {}

    /**
     * Authenticate user with OTP credentials
     *
     * @param array{email: string, otp_code: string, ip_address?: string} $credentials
     * @return array{user: User, metadata: array<string, mixed>}
     * @throws OtpAuthenticationException
     */
    public function authenticate(array $credentials): array
    {
        if (!isset($credentials['email'], $credentials['otp_code'])) {
            throw OtpAuthenticationException::notFound();
        }

        $email = $credentials['email'];
        $otpCode = $credentials['otp_code'];
        $ipAddress = $credentials['ip_address'] ?? null;

        $user = $this->otpService->verifyOtp($email, $otpCode, $ipAddress);

        Log::channel('auth')->info('OTP authentication successful', [
            'user_id' => $user->id,
            'email' => $user->email,
            'ip_address' => $ipAddress,
        ]);

        return [
            'user' => $user,
            'metadata' => [
                'auth_method' => 'otp',
            ],
        ];
    }

    /**
     * Check if this strategy supports the given credentials
     *
     * @param array<string, mixed> $credentials Credentials to check
     */
    public function supports(array $credentials): bool
    {
        return isset($credentials['email'], $credentials['otp_code'])
            && !isset($credentials['password'])
            && !isset($credentials['socialite_user']);
    }
}
