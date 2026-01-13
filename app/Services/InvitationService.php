<?php

declare(strict_types=1);

namespace App\Services;

use App\Jobs\Email\SendTransactionalEmail;
use App\Models\User;
use App\Models\UserInvitation;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class InvitationService
{
    private const EXPIRATION_DAYS = 7;

    /**
     * Create and send an invitation
     */
    public function invite(string $email, User $inviter): UserInvitation
    {
        return DB::transaction(function () use ($email, $inviter) {
            $normalizedEmail = strtolower(trim($email));

            // Cancel any existing pending invitations for this email
            UserInvitation::where('email', $normalizedEmail)
                ->whereNull('accepted_at')
                ->delete();

            $invitation = UserInvitation::create([
                'email' => $normalizedEmail,
                'token' => Str::random(64),
                'invited_by' => $inviter->id,
                'expires_at' => now()->addDays(self::EXPIRATION_DAYS),
            ]);

            $this->sendInvitationEmail($invitation);

            Log::info('User invitation sent', [
                'email' => $normalizedEmail,
                'invited_by' => $inviter->id,
                'invitation_id' => $invitation->id,
            ]);

            return $invitation;
        });
    }

    /**
     * Validate an invitation token
     */
    public function validateToken(string $token): ?UserInvitation
    {
        $invitation = UserInvitation::where('token', $token)->first();

        if (!$invitation) {
            return null;
        }

        if ($invitation->isExpired() || $invitation->isAccepted()) {
            return null;
        }

        return $invitation;
    }

    /**
     * Accept an invitation and create/find user
     */
    public function accept(UserInvitation $invitation): User
    {
        return DB::transaction(function () use ($invitation) {
            // Check if user already exists
            $user = User::where('email', $invitation->email)->first();

            if (!$user) {
                // Create new user (minimal data - they'll complete profile later)
                $user = User::create([
                    'email' => $invitation->email,
                    'name' => $this->extractNameFromEmail($invitation->email),
                    'email_verified_at' => now(), // Invitation implies verified email
                    'password' => null, // No password - will use OTP
                ]);

                Log::info('New user created from invitation', [
                    'user_id' => $user->id,
                    'email' => $user->email,
                    'invitation_id' => $invitation->id,
                ]);
            }

            // Mark invitation as accepted
            $invitation->update(['accepted_at' => now()]);

            return $user;
        });
    }

    /**
     * Resend an existing invitation
     */
    public function resend(UserInvitation $invitation): UserInvitation
    {
        // Reset expiration and generate new token
        $invitation->update([
            'token' => Str::random(64),
            'expires_at' => now()->addDays(self::EXPIRATION_DAYS),
        ]);

        $this->sendInvitationEmail($invitation->fresh());

        Log::info('User invitation resent', [
            'email' => $invitation->email,
            'invitation_id' => $invitation->id,
        ]);

        return $invitation;
    }

    /**
     * Send the invitation email
     */
    private function sendInvitationEmail(UserInvitation $invitation): void
    {
        // Ensure inviter relationship is loaded
        $invitation->loadMissing('inviter');

        $recipientName = $this->extractNameFromEmail($invitation->email);

        // Pass recipient as array to avoid SerializesModels issues with non-persisted User
        SendTransactionalEmail::dispatch(
            'user.invitation',
            ['email' => $invitation->email, 'name' => $recipientName],
            [
                'user_name' => $recipientName,
                'Link' => route('invitation.show', ['token' => $invitation->token]),
                'inviter_name' => $invitation->inviter?->name ?? 'Ocean Decade Portal Admin',
                'expires_at' => $invitation->expires_at->format('F j, Y'),
            ]
        );
    }

    /**
     * Extract a display name from email address
     */
    private function extractNameFromEmail(string $email): string
    {
        $localPart = explode('@', $email)[0];
        // Convert john.doe to John Doe
        return ucwords(str_replace(['.', '_', '-'], ' ', $localPart));
    }
}
