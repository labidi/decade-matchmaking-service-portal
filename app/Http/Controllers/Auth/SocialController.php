<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Exception;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class SocialController extends Controller
{
    /**
     * Redirect to LinkedIn for authentication
     */
    public function linkedinRedirect(): RedirectResponse
    {
        try {
            return Socialite::driver('linkedin-openid')
                ->stateless()
                ->redirect();
        } catch (Exception $e) {
            Log::error('LinkedIn redirect error: ' . $e->getMessage());
            
            return redirect()->route('sign.in')
                ->with('error', 'Unable to redirect to LinkedIn. Please try again.');
        }
    }

    /**
     * Handle LinkedIn callback
     */
    public function linkedinCallback(): RedirectResponse
    {
        try {
            $linkedinUser = Socialite::driver('linkedin-openid')
                ->stateless()
                ->user();

            // Check if user already exists with this email
            $existingUser = User::where('email', $linkedinUser->getEmail())->first();

            if ($existingUser) {
                // Update existing user with LinkedIn data if they don't have social auth data
                if (!$existingUser->provider) {
                    $existingUser->update([
                        'provider' => 'linkedin',
                        'provider_id' => $linkedinUser->getId(),
                        'avatar' => $linkedinUser->getAvatar(),
                    ]);
                }
                
                Auth::login($existingUser, true);
                
                return redirect()->route('user.home')
                    ->with('status', 'Successfully signed in with LinkedIn!');
            }

            // Create new user
            $user = $this->createUserFromLinkedIn($linkedinUser);
            
            // Assign default user role
            $user->assignRole('user');
            
            Auth::login($user, true);
            
            return redirect()->route('user.home')
                ->with('status', 'Welcome! Your account has been created successfully.');

        } catch (Exception $e) {
            Log::error('LinkedIn callback error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            
            return redirect()->route('sign.in')
                ->with('error', 'Unable to authenticate with LinkedIn. Please try again or use email/password.');
        }
    }

    /**
     * Create a new user from LinkedIn data
     */
    private function createUserFromLinkedIn($linkedinUser): User
    {
        $fullName = $linkedinUser->getName();
        $nameParts = explode(' ', $fullName, 2);
        
        return User::create([
            'name' => $fullName,
            'email' => $linkedinUser->getEmail(),
            'provider' => 'linkedin',
            'provider_id' => $linkedinUser->getId(),
            'avatar' => $linkedinUser->getAvatar(),
            'first_name' => $nameParts[0] ?? '',
            'last_name' => $nameParts[1] ?? '',
            'email_verified_at' => now(), // LinkedIn emails are verified
            'password' => null, // No password needed for social auth
        ]);
    }
}
