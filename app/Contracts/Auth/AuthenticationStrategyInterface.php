<?php

declare(strict_types=1);

namespace App\Contracts\Auth;

use App\DTOs\Auth\AuthenticationResult;

interface AuthenticationStrategyInterface
{
    /**
     * Authenticate and return the result.
     *
     * @param array<string, mixed> $credentials Authentication credentials
     * @return AuthenticationResult The authenticated user with metadata
     *
     * @throws \App\Exceptions\Auth\OceanExpertAuthenticationException
     * @throws \App\Exceptions\Auth\OAuthAuthenticationException
     * @throws \App\Exceptions\Auth\OtpAuthenticationException
     */
    public function authenticate(array $credentials): AuthenticationResult;

    /**
     * Determine if this strategy supports the given credentials.
     *
     * @param array<string, mixed> $credentials Credentials to check
     * @return bool True if strategy supports these credentials
     */
    public function supports(array $credentials): bool;
}
