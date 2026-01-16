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
use Illuminate\Support\Facades\Log;
use Throwable;

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

        $validated = $request->validated();

        try {
            $this->invitationService->invite(
                $validated['email'],
                $validated['name'],
                $request->user()
            );

            return back()->with('success', "Invitation sent to {$validated['email']}");
        } catch (Throwable $e) {
            Log::error('Failed to send invitation', [
                'email' => $validated['email'],
                'error' => $e->getMessage(),
            ]);

            return back()->with('error', 'Failed to send invitation. Please try again.');
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
        } catch (Throwable $e) {
            Log::error('Failed to resend invitation', [
                'invitation_id' => $invitation->id,
                'error' => $e->getMessage(),
            ]);

            return back()->with('error', 'Failed to resend invitation. Please try again.');
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
