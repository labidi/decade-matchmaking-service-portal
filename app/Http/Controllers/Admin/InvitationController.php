<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SendInvitationRequest;
use App\Models\User;
use App\Models\UserInvitation;
use App\Services\InvitationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;

class InvitationController extends Controller
{
    public function __construct(
        private readonly InvitationService $invitationService
    ) {}

    /**
     * Send invitation to a new user
     */
    public function store(SendInvitationRequest $request): RedirectResponse
    {
        Gate::authorize('invite', User::class);

        $email = $request->validated('email');

        // Check if user already exists
        if (User::where('email', strtolower(trim($email)))->exists()) {
            return back()->with('error', 'A user with this email already exists.');
        }

        try {
            $this->invitationService->invite($email, $request->user());
            return back()->with('success', "Invitation sent to {$email}");
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to send invitation: ' . $e->getMessage());
        }
    }

    /**
     * Resend an existing invitation
     */
    public function resend(UserInvitation $invitation): RedirectResponse
    {
        Gate::authorize('invite', User::class);

        if ($invitation->isAccepted()) {
            return back()->with('error', 'This invitation has already been accepted.');
        }

        try {
            $this->invitationService->resend($invitation);

            return back()->with('success', "Invitation resent to {$invitation->email}");
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to resend invitation: ' . $e->getMessage());
        }
    }

    /**
     * Cancel/delete an invitation
     */
    public function destroy(UserInvitation $invitation): RedirectResponse
    {
        Gate::authorize('invite', User::class);

        if ($invitation->isAccepted()) {
            return back()->with('error', 'Cannot cancel an accepted invitation.');
        }

        $invitation->delete();

        return back()->with('success', 'Invitation cancelled.');
    }
}
