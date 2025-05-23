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

class LoginController extends Controller
{
    public function __construct(
        protected OceanExpertAuthService $oceanExpertAuthService,
        protected OceanExpertSearchService $oceanExpertSearchService,
    ) {}

    public function create(Request $request): Response
    {
        return Inertia::render('Auth/Login', [
            'status' => $request->session()->get('status'),
        ]);
    }

    public function store(Request $request)
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

            Log::info($oceanExpertProfile) ;
        } catch (\Exception $e) {
            throw ValidationException::withMessages([
                'email' => $e->getMessage(),
            ]);
        }

        $user = User::updateOrCreate(
            ['email' => $credentials['email']],
            [
                'name' => $oceanExpertProfile['name'],
                'password' => Hash::make($userPayload['password']),
                'first_name'=> $oceanExpertProfile['first_name'],
                'last_name'=> $oceanExpertProfile['last_name'],
                'country'=> $oceanExpertProfile['country'],
                'city'=> $oceanExpertProfile['city'],
            ]
        );

        // 5. Log in locally
        Auth::login($user, false);
        // 6. Store external token in session (or cookie)
        $request->session()->put('external_api_token', $token);
        // 7. Regenerate session ID
        $request->session()->regenerate();
        return redirect()->intended(route('request.create'));
    }
}
