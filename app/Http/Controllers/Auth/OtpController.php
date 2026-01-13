<?php

declare(strict_types=1);

namespace App\Http\Controllers\Auth;

use App\Contracts\Auth\AuthenticationServiceInterface;
use App\Exceptions\Auth\OtpAuthenticationException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\OtpRequestRequest;
use App\Http\Requests\Auth\OtpVerifyRequest;
use App\Services\Auth\OtpService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OtpController extends Controller
{
    public function __construct(
        private readonly OtpService $otpService,
        private readonly AuthenticationServiceInterface $authService
    ) {}

    /**
     * Display the OTP request form (email entry).
     */
    public function showRequestForm(Request $request): Response
    {
        return Inertia::render('auth/OtpRequest', [
            'status' => $request->session()->get('status'),
            'banner' => [
                'title' => 'Sign in with Email',
                'description' => 'Enter your email address to receive a one-time password.',
                'image' => '/assets/img/sidebar.png',
            ],
            'breadcrumbs' => [
                ['name' => 'Sign In', 'href' => route('sign.in')],
                ['name' => 'Email OTP'],
            ],
        ]);
    }

    /**
     * Handle OTP request (send OTP to email).
     */
    public function sendOtp(OtpRequestRequest $request): JsonResponse
    {
        $result = $this->otpService->sendOtp(
            $request->validated('email'),
            $request->ip()
        );

        if (!$result['success'] && isset($result['error'])) {
            $statusCode = match ($result['error']) {
                'rate_limited' => 429,
                'user_blocked' => 403,
                default => 422,
            };

            return response()->json($result, $statusCode);
        }

        // Store email in session for verification step
        $request->session()->put('otp_email', $request->validated('email'));

        return response()->json($result);
    }

    /**
     * Display the OTP verification form.
     */
    public function showVerifyForm(Request $request): Response|RedirectResponse
    {
        $email = $request->session()->get('otp_email');

        if (!$email) {
            return redirect()->route('otp.request')
                ->with('error', 'Please enter your email first.');
        }

        return Inertia::render('auth/OtpVerify', [
            'email' => $email,
            'maskedEmail' => $this->maskEmail($email),
            'banner' => [
                'title' => 'Enter Verification Code',
                'description' => 'We sent a 5-digit code to your email.',
                'image' => '/assets/img/sidebar.png',
            ],
            'breadcrumbs' => [
                ['name' => 'Sign In', 'href' => route('sign.in')],
                ['name' => 'Email OTP', 'href' => route('otp.request')],
                ['name' => 'Verify'],
            ],
        ]);
    }

    /**
     * Handle OTP verification.
     */
    public function verify(OtpVerifyRequest $request): JsonResponse
    {
        $email = $request->session()->get('otp_email') ?? $request->validated('email');

        if (!$email) {
            return response()->json([
                'success' => false,
                'message' => 'No email address in session. Please start over.',
                'error_code' => 'no_email',
            ], 400);
        }

        try {
            $user = $this->otpService->verifyOtp(
                $email,
                $request->validated('code'),
                $request->ip()
            );

            // Complete authentication using the auth service
            $this->authService->completeAuthentication($user, [
                'auth_method' => 'otp',
            ]);

            // Clear OTP session data
            $request->session()->forget('otp_email');

            return response()->json([
                'success' => true,
                'message' => 'OTP verified successfully.',
                'redirect' => route('user.home'),
            ]);
        } catch (OtpAuthenticationException $e) {
            // Let the exception render itself
            throw $e;
        }
    }

    /**
     * Resend OTP to the stored email.
     */
    public function resend(Request $request): JsonResponse
    {
        $email = $request->session()->get('otp_email');

        if (!$email) {
            return response()->json([
                'success' => false,
                'message' => 'No email address in session.',
            ], 400);
        }

        $result = $this->otpService->resendOtp($email, $request->ip());

        if (!$result['success'] && isset($result['error'])) {
            $statusCode = match ($result['error']) {
                'rate_limited' => 429,
                default => 422,
            };

            return response()->json($result, $statusCode);
        }

        return response()->json([
            'success' => true,
            'message' => 'A new OTP has been sent to your email.',
        ]);
    }

    /**
     * Mask email for display (e.g., tes***@example.com)
     */
    private function maskEmail(string $email): string
    {
        $parts = explode('@', $email);
        $name = $parts[0];
        $domain = $parts[1] ?? '';

        $visibleLength = min(3, strlen($name));
        $masked = substr($name, 0, $visibleLength) .
            str_repeat('*', max(0, strlen($name) - $visibleLength));

        return $masked . '@' . $domain;
    }
}
