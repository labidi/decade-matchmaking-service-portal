<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\OceanExpertAuthService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Hash;
use App\Services\OceanExpertSearchService;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class SessionController extends Controller
{
    public function __construct(
        protected OceanExpertAuthService $oceanExpertAuthService,
        protected OceanExpertSearchService $oceanExpertSearchService,
    ) {}

    public function create(Request $request): Response
    {
        return Inertia::render('Auth/SignIn', [
            'status' => $request->session()->get('status'),
            'banner' => [
                'title' => 'Sign in to Oceean decade portal',
                'description' => 'Use your OceanExpert credentials to sign in, Or use your Google account or LinkedIn account.',
                'image' => '/assets/img/sidebar.png',
            ],
            'status'=>$request->session()->get('status')
        ]);
    }

    public function store(Request $request): \Illuminate\Http\RedirectResponse
    {
        $credentials = $request->validate([
            'email'    => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ]);

        try {
            ['token' => $token, 'user' => $userPayload] = $this->oceanExpertAuthService->authenticate(
                $credentials['email'],
                $credentials['password']
            );
            $oceanExpertProfile = $this->oceanExpertSearchService->searchByEmail(
                $credentials['email']
            );

            
        } catch (\Exception $e) {
            throw ValidationException::withMessages([
                "password" => $e->getMessage(),
            ]);
        }
        $user = User::updateOrCreate(
            ['email' => $credentials['email']],
            [
                'name' => $oceanExpertProfile['name'] ?? $oceanExpertProfile['first_name'] . ' ' . $oceanExpertProfile['last_name'],
                'password' => Hash::make($userPayload['password']),
                'first_name' => $oceanExpertProfile['first_name'],
                'last_name' => $oceanExpertProfile['last_name'],
                'country' => $oceanExpertProfile['country'],
                'city' => $oceanExpertProfile['city'],
            ]
        );

        if ($user->is_blocked) {
            throw ValidationException::withMessages([
                'email' => 'Your account is blocked.',
            ]);
        }
        Auth::login($user, false);
        $request->session()->put('external_api_token', $token);
        $request->session()->regenerate();
        return to_route('dashboard')->with([
            'status' => 'You are logged in successfully.',
        ]);
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): \Illuminate\Http\RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return to_route('index');
    }
}
