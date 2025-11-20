<?php

declare(strict_types=1);

namespace App\Contracts\Auth;

use App\Exceptions\Auth\OAuthAuthenticationException;
use App\Exceptions\Auth\OceanExpertAuthenticationException;
use App\Models\User;
use Illuminate\Validation\ValidationException;
use Laravel\Socialite\Contracts\User as SocialiteUser;

interface AuthenticationServiceInterface
{
    /**
     * Authenticate user with email/password credentials
     *
     * @param string $email User email address
     * @param string $password User password
     * @return User Authenticated user instance
     * @throws OceanExpertAuthenticationException
     * @throws ValidationException When rate limited
     */
    public function authenticateWithCredentials(string $email, string $password): User;

    /**
     * Authenticate user with OAuth provider
     *
     * @param SocialiteUser $socialUser Socialite user instance from provider
     * @param string $provider OAuth provider name (google, linkedin)
     * @return User Authenticated user instance
     * @throws OAuthAuthenticationException
     */
    public function authenticateWithOAuth(SocialiteUser $socialUser, string $provider): User;

    /**
     * Complete the authentication process (login, session setup)
     *
     * @param User $user User to authenticate
     * @param array<string, mixed> $additionalData Additional metadata to store in session
     * @return void
     */
    public function completeAuthentication(User $user, array $additionalData = []): void;

    /**
     * Logout the authenticated user
     *
     * @return void
     */
    public function logout(): void;
}
