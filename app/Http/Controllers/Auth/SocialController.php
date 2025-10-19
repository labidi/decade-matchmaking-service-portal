<?php

declare(strict_types=1);

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Exception;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Laravel\Socialite\Contracts\User as SocialiteUser;
use Laravel\Socialite\Facades\Socialite;

class SocialController extends Controller
{
    /**
     * Redirect to LinkedIn for authentication
     */
    public function linkedinRedirect(): RedirectResponse
    {
        return $this->redirectToProvider('linkedin-openid', 'LinkedIn');
    }

    /**
     * Handle LinkedIn callback
     */
    public function linkedinCallback(): RedirectResponse
    {
        return $this->handleProviderCallback('linkedin-openid', 'linkedin');
    }

    /**
     * Redirect to Google for authentication
     */
    public function googleRedirect(): RedirectResponse
    {
        return $this->redirectToProvider('google', 'Google');
    }

    /**
     * Handle Google callback
     */
    public function googleCallback(): RedirectResponse
    {
        return $this->handleProviderCallback('google', 'google');
    }

    /**
     * Generic redirect to OAuth provider
     */
    protected function redirectToProvider(string $driver, string $providerName): RedirectResponse
    {
        try {
            Log::info("Redirecting to {$providerName} OAuth", [
                'driver' => $driver,
            ]);

            return Socialite::driver($driver)
                ->stateless()
                ->redirect();
        } catch (Exception $e) {
            Log::error("{$providerName} redirect error", [
                'driver' => $driver,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return redirect()->route('sign.in')
                ->with('error', "Unable to redirect to {$providerName}. Please try again.");
        }
    }

    /**
     * Generic handler for OAuth provider callback
     */
    protected function handleProviderCallback(string $driver, string $provider): RedirectResponse
    {
        try {
            $socialUser = Socialite::driver($driver)
                ->stateless()
                ->user();

            // Validate that email is provided
            if (!$socialUser->getEmail()) {
                Log::warning("{$provider} OAuth: Missing email", [
                    'provider' => $provider,
                    'provider_id' => $socialUser->getId(),
                ]);

                return redirect()->route('sign.in')
                    ->with('error', 'Unable to retrieve email from ' . $this->getProviderDisplayName($provider) . '. Please try another sign-in method.');
            }

            Log::info("{$provider} OAuth callback received", [
                'provider' => $provider,
                'email' => $socialUser->getEmail(),
                'provider_id' => $socialUser->getId(),
            ]);

            return $this->processOAuthUser($socialUser, $provider);
        } catch (Exception $e) {
            Log::error("{$provider} callback error", [
                'provider' => $provider,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return redirect()->route('sign.in')
                ->with('error', 'Unable to authenticate with ' . $this->getProviderDisplayName($provider) . '. Please try again or use email/password.');
        }
    }

    /**
     * Process OAuth user (create or update)
     */
    protected function processOAuthUser(SocialiteUser $socialUser, string $provider): RedirectResponse
    {
        try {
            $user = DB::transaction(function () use ($socialUser, $provider) {
                // Check if user exists with this email
                $existingUser = User::where('email', $socialUser->getEmail())->first();

                if ($existingUser) {
                    return $this->updateExistingUser($existingUser, $socialUser, $provider);
                }

                return $this->createNewUser($socialUser, $provider);
            });

            Auth::login($user, true);

            $providerName = $this->getProviderDisplayName($provider);
            $message = $user->wasRecentlyCreated
                ? 'Welcome! Your account has been created successfully.'
                : "Successfully signed in with {$providerName}!";

            Log::info('OAuth sign-in successful', [
                'provider' => $provider,
                'user_id' => $user->id,
                'email' => $user->email,
                'newly_created' => $user->wasRecentlyCreated,
            ]);

            return redirect()->route('user.home')
                ->with('status', $message);
        } catch (Exception $e) {
            Log::error('OAuth user processing error', [
                'provider' => $provider,
                'email' => $socialUser->getEmail(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return redirect()->route('sign.in')
                ->with('error', 'An error occurred during authentication. Please try again.');
        }
    }

    /**
     * Update existing user with OAuth data
     */
    protected function updateExistingUser(User $user, SocialiteUser $socialUser, string $provider): User
    {
        // Only update OAuth data if user has no provider or same provider
        if (!$user->provider || $user->provider === $provider) {
            $user->update([
                'provider' => $provider,
                'provider_id' => $socialUser->getId(),
                'avatar' => $socialUser->getAvatar(),
            ]);

            Log::info('Updated existing user with OAuth data', [
                'user_id' => $user->id,
                'provider' => $provider,
            ]);
        } else {
            Log::info('User signed in with different provider', [
                'user_id' => $user->id,
                'existing_provider' => $user->provider,
                'new_provider' => $provider,
            ]);
        }

        return $user;
    }

    /**
     * Create new user from OAuth data
     */
    protected function createNewUser(SocialiteUser $socialUser, string $provider): User
    {
        $nameParts = $this->parseFullName($socialUser->getName());

        $user = User::create([
            'name' => $socialUser->getName(),
            'email' => $socialUser->getEmail(),
            'provider' => $provider,
            'provider_id' => $socialUser->getId(),
            'avatar' => $socialUser->getAvatar(),
            'first_name' => $nameParts['first_name'],
            'last_name' => $nameParts['last_name'],
            'email_verified_at' => now(), // OAuth emails are verified by provider
            'password' => null, // No password needed for social auth
        ]);

        // Assign default user role
        $user->assignRole('user');

        Log::info('Created new user from OAuth', [
            'user_id' => $user->id,
            'provider' => $provider,
            'email' => $user->email,
        ]);

        return $user;
    }

    /**
     * Parse full name into first and last name
     */
    protected function parseFullName(?string $fullName): array
    {
        if (!$fullName) {
            return ['first_name' => '', 'last_name' => ''];
        }

        $nameParts = explode(' ', trim($fullName), 2);

        return [
            'first_name' => $nameParts[0] ?? '',
            'last_name' => $nameParts[1] ?? '',
        ];
    }

    /**
     * Get provider display name for user messages
     */
    protected function getProviderDisplayName(string $provider): string
    {
        $displayNames = [
            'linkedin' => 'LinkedIn',
            'google' => 'Google',
        ];

        return $displayNames[$provider] ?? ucfirst($provider);
    }
}