<?php

declare(strict_types=1);

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\UserService;
use Exception;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Laravel\Socialite\Contracts\User as SocialiteUser;
use Laravel\Socialite\Facades\Socialite;

class SocialController extends Controller
{
    public function __construct(
        private readonly UserService $userService
    ) {
    }

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
            // Check if user exists with this email
            $existingUser = User::where('email', $socialUser->getEmail())->first();

            if ($existingUser) {
                // Prepare OAuth data for update
                $oauthData = [
                    'provider_id' => $socialUser->getId(),
                    'avatar' => $socialUser->getAvatar(),
                ];

                $user = $this->userService->updateUserWithOAuth($existingUser, $oauthData, $provider);
            } else {
                // Prepare OAuth data for new user creation
                $oauthData = [
                    'email' => $socialUser->getEmail(),
                    'name' => $socialUser->getName() ?? '',
                    'provider_id' => $socialUser->getId(),
                    'avatar' => $socialUser->getAvatar(),
                ];

                $user = $this->userService->createUserFromOAuth($oauthData, $provider);
            }

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