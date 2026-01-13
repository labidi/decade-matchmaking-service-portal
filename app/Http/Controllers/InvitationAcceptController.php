<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Contracts\Auth\AuthenticationServiceInterface;
use App\Services\InvitationService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class InvitationAcceptController extends Controller
{
    public function __construct(
        private readonly InvitationService $invitationService,
        private readonly AuthenticationServiceInterface $authService
    ) {}

    /**
     * Show the invitation acceptance page
     */
    public function show(string $token): Response
    {
        $invitation = $this->invitationService->validateToken($token);

        if (!$invitation) {
            return Inertia::render('auth/InvitationExpired', [
                'message' => 'This invitation link is invalid or has expired.',
            ]);
        }

        return Inertia::render('auth/InvitationAccept', [
            'invitation' => [
                'email' => $invitation->email,
                'inviter_name' => $invitation->inviter->name ?? 'Ocean Decade Portal Admin',
                'expires_at' => $invitation->expires_at->format('F j, Y'),
            ],
            'token' => $token,
        ]);
    }

    /**
     * Accept the invitation and log the user in
     */
    public function accept(string $token): RedirectResponse
    {
        $invitation = $this->invitationService->validateToken($token);

        if (!$invitation) {
            return redirect()->route('sign.in')
                ->with('error', 'This invitation link is invalid or has expired.');
        }

        // Accept invitation (creates user if needed)
        $user = $this->invitationService->accept($invitation);

        // Log the user in
        $this->authService->completeAuthentication($user, [
            'auth_method' => 'invitation',
        ]);

        return redirect()->route('index')
            ->with('success', 'Welcome to Ocean Decade Portal!');
    }
}
