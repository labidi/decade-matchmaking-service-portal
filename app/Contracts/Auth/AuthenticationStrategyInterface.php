<?php

declare(strict_types=1);

namespace App\Contracts\Auth;

use App\Models\User;

interface AuthenticationStrategyInterface
{
    /**
     * Authenticate and return user data
     *
     * @param array<string, mixed> $credentials Authentication credentials
     * @return array{user: User, metadata: array<string, mixed>} User and authentication metadata
     * @throws \App\Exceptions\Auth\OceanExpertAuthenticationException
     * @throws \App\Exceptions\Auth\OAuthAuthenticationException
     */
    public function authenticate(array $credentials): array;

    /**
     * Determine if this strategy supports the given credentials
     *
     * @param array<string, mixed> $credentials Credentials to check
     * @return bool True if strategy supports these credentials
     */
    public function supports(array $credentials): bool;
}
