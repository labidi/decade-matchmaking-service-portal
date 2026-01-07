<?php

declare(strict_types=1);

namespace App\Services\Auth;

use App\Contracts\Auth\AuthenticationServiceInterface;
use App\Contracts\Auth\AuthenticationStrategyInterface;
use App\Events\Auth\UserAuthenticated;
use App\Exceptions\Auth\AccountBlockedException;
use App\Exceptions\Auth\OceanExpertAuthenticationException;
use App\Exceptions\Auth\UnsupportedAuthenticationMethodException;
use App\Models\User;
use App\Services\Auth\Strategies\OAuthAuthStrategy;
use App\Services\Auth\Strategies\OceanExpertAuthStrategy;
use App\Services\Auth\Strategies\OtpAuthStrategy;
use Illuminate\Auth\Events\Login;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Laravel\Socialite\Contracts\User as SocialiteUser;

class AuthenticationService implements AuthenticationServiceInterface
{
    /** @var array<AuthenticationStrategyInterface> */
    private array $strategies;

    public function __construct(
        OceanExpertAuthStrategy $oceanExpertStrategy,
        OAuthAuthStrategy $oAuthStrategy,
        OtpAuthStrategy $otpAuthStrategy
    ) {
        $this->strategies = [
            $oceanExpertStrategy,
            $oAuthStrategy,
            $otpAuthStrategy,
        ];
    }

    /**
     * Authenticate user with email/password credentials
     *
     * @throws OceanExpertAuthenticationException
     * @throws ValidationException
     */
    public function authenticateWithCredentials(string $email, string $password): User
    {
        $throttleKey = $this->getThrottleKey($email);

        $this->logAuthenticationAttempt($email, 'credentials');

        // Rate limiting check (Laravel RateLimiter facade)
        if (RateLimiter::tooManyAttempts($throttleKey, 5)) {
            $seconds = RateLimiter::availableIn($throttleKey);

            $this->logAuthenticationFailure($email, 'credentials', 'rate_limited');

            throw ValidationException::withMessages([
                'email' => trans('auth.throttle', [
                    'seconds' => $seconds,
                    'minutes' => ceil($seconds / 60),
                ]),
            ]);
        }

        try {
            $result = $this->authenticate([
                'email' => $email,
                'password' => $password,
            ]);

            // Clear rate limit on success
            RateLimiter::clear($throttleKey);

            $this->completeAuthentication($result['user'], $result['metadata']);

            $this->logAuthenticationSuccess($result['user'], 'credentials');

            return $result['user'];
        } catch (OceanExpertAuthenticationException $e) {
            // Increment rate limit on failure
            RateLimiter::hit($throttleKey);

            $this->logAuthenticationFailure($email, 'credentials', $e->getMessage());

            throw $e;
        }
    }

    /**
     * Authenticate user with OAuth provider
     *
     * @throws \App\Exceptions\Auth\OAuthAuthenticationException
     */
    public function authenticateWithOAuth(SocialiteUser $socialUser, string $provider): User
    {
        $this->logAuthenticationAttempt($socialUser->getEmail() ?? 'unknown', $provider);

        try {
            $result = $this->authenticate([
                'socialite_user' => $socialUser,
                'provider' => $provider,
            ]);

            $this->completeAuthentication($result['user'], $result['metadata']);

            $this->logAuthenticationSuccess($result['user'], $provider);

            return $result['user'];
        } catch (\Exception $e) {
            $this->logAuthenticationFailure(
                $socialUser->getEmail() ?? 'unknown',
                $provider,
                $e->getMessage()
            );

            throw $e;
        }
    }

    /**
     * Complete the authentication process (login, session setup)
     *
     * @param  array<string, mixed>  $additionalData
     *
     * @throws AccountBlockedException
     */
    public function completeAuthentication(User $user, array $additionalData = []): void
    {
        // Security check: Ensure user is not blocked
        $this->ensureUserIsActive($user);

        // Regenerate session to prevent fixation attacks (Laravel best practice)
        Session::regenerate();

        // Fire Laravel's built-in Login event
        Event::dispatch(new Login('web', $user, remember: true));

        // Login the user
        Auth::login($user, remember: true);

        // Store additional session data AFTER regeneration
        if (! empty($additionalData['ocean_expert_token'])) {
            Session::put('external_api_token', $additionalData['ocean_expert_token']);
        }

        if (! empty($additionalData['oauth_provider'])) {
            Session::put('oauth_provider', $additionalData['oauth_provider']);
            Session::put('oauth_id', $additionalData['oauth_id']);

            // Store OAuth tokens for potential refresh capability
            if (! empty($additionalData['oauth_token'])) {
                Session::put('oauth_token', $additionalData['oauth_token']);
            }
            if (! empty($additionalData['oauth_refresh_token'])) {
                Session::put('oauth_refresh_token', $additionalData['oauth_refresh_token']);
            }
        }

        // Update last login timestamp
        $user->update(['last_login_at' => now()]);

        // Fire custom authentication event
        $method = $additionalData['auth_method'] ?? 'credentials';
        event(new UserAuthenticated($user, $additionalData, $method));
    }

    /**
     * Logout the authenticated user
     */
    public function logout(): void
    {
        $user = Auth::user();

        // Clear session data
        Session::forget([
            'external_api_token',
            'oauth_provider',
            'oauth_id',
            'oauth_token',
            'oauth_refresh_token',
        ]);

        // Logout
        Auth::logout();

        // Invalidate session and regenerate token (security best practice)
        Session::invalidate();
        Session::regenerateToken();

        if ($user) {
            Log::channel('auth')->info('User logged out', [
                'user_id' => $user->id,
                'email' => $user->email,
                'ip' => request()->ip(),
            ]);
        }
    }

    /**
     * Execute authentication using the appropriate strategy
     *
     * @param  array<string, mixed>  $credentials
     * @return array{user: User, metadata: array<string, mixed>}
     *
     * @throws UnsupportedAuthenticationMethodException
     */
    private function authenticate(array $credentials): array
    {
        foreach ($this->strategies as $strategy) {
            if ($strategy->supports($credentials)) {
                return $strategy->authenticate($credentials);
            }
        }

        throw new UnsupportedAuthenticationMethodException(
            'No authentication strategy available for the provided credentials'
        );
    }

    /**
     * Get rate limiting throttle key (email|ip)
     */
    private function getThrottleKey(string $email): string
    {
        return Str::transliterate(Str::lower($email).'|'.request()->ip());
    }

    /**
     * Ensure user account is active and not blocked
     *
     * @throws AccountBlockedException
     */
    private function ensureUserIsActive(User $user): void
    {
        if ($user->isBlocked()) {
            throw new AccountBlockedException(
                'Your account has been blocked. Please contact support.'
            );
        }
    }

    /**
     * Log authentication attempt
     */
    private function logAuthenticationAttempt(string $email, string $method): void
    {
        Log::channel('auth')->info('Authentication attempt with email : '.$email.' and method : '.$method, [
            'email' => $email,
            'method' => $method,
            'ip' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }

    /**
     * Log successful authentication
     */
    private function logAuthenticationSuccess(User $user, string $method): void
    {
        Log::channel('auth')->info('Authentication successful with email : '.$user->email.' and method : '.$method, [
            'user_id' => $user->id,
            'email' => $user->email,
            'method' => $method,
            'ip' => request()->ip(),
        ]);
    }

    /**
     * Log failed authentication
     */
    private function logAuthenticationFailure(string $email, string $method, string $reason): void
    {
        Log::channel('auth')->warning('Authentication failed', [
            'email' => $email,
            'method' => $method,
            'reason' => $reason,
            'ip' => request()->ip(),
        ]);
    }
}
