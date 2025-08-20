<?php

namespace App\Policies;

use App\Models\Request;
use App\Models\Request\Status;
use App\Models\User;
use App\Enums\RequestOfferStatus;

class RequestPolicy
{
    /**
     * Determine whether the user can view the request.
     */
    public function view(?User $user, Request $request): bool
    {
        if (!$user) {
            return false;
        }

        // Request owner, matched partner, or admin can view
        return $user->id === $request->user_id
            || $user->id === $request->matched_partner_id
            || $user->hasRole('administrator');
    }

    /**
     * Determine whether the user can update the request.
     */
    public function update(?User $user, Request $request): bool
    {
        if (!$user) {
            return false;
        }

        // Only the request owner can edit, and only when in draft status
        return $user->id === $request->user_id
            && $request->status->status_code === Status::DRAFT_STATUS_CODE;
    }

    /**
     * Determine whether the user can delete the request.
     */
    public function delete(?User $user, Request $request): bool
    {
        if (!$user) {
            return false;
        }

        // Only the request owner can delete, and only when in draft status
        return $user->id === $request->user_id
            && $request->status->status_code === Status::DRAFT_STATUS_CODE;
    }

    /**
     * Determine whether the user can manage offers for the request.
     */
    public function manageOffers(?User $user, Request $request): bool
    {
        if (!$user) {
            return false;
        }

        // Only administrators can manage offers
        return $user->hasRole('administrator');
    }

    /**
     * Determine whether the user can update the request status.
     */
    public function updateStatus(?User $user, Request $request): bool
    {
        if (!$user) {
            return false;
        }

        // Only administrators can update status
        return $user->hasRole('administrator');
    }

    /**
     * Determine whether the user can accept offers for the request.
     */
    public function acceptOffer(?User $user, Request $request): bool
    {
        if (!$user) {
            return false;
        }

        // Only the request owner can accept offers
        if ($user->id !== $request->user_id) {
            return false;
        }

        // Check if request has an active offer
        $hasActiveOffer = $request->offers()
            ->where('status', RequestOfferStatus::ACTIVE)
            ->exists();

        // Can accept if there's an active offer
        return $hasActiveOffer;
    }

    /**
     * Determine whether the user can request clarifications for the request.
     */
    public function requestClarifications(?User $user, Request $request): bool
    {
        if (!$user) {
            return false;
        }

        // Request owner can request clarifications if there's an active offer
        if ($user->id === $request->user_id) {
            return $request->offers()
                ->where('status', RequestOfferStatus::ACTIVE)
                ->exists();
        }

        // Admins can always request clarifications
        return $user->administrator;
    }

    /**
     * Determine whether the user can withdraw the request.
     */
    public function withdraw(?User $user, Request $request): bool
    {
        if (!$user) {
            return false;
        }

        // Only the request owner can withdraw
        if ($user->id !== $request->user_id) {
            return false;
        }

        // Can withdraw if not in draft status (draft requests should be deleted instead)
        return $request->status->status_code !== Status::DRAFT_STATUS_CODE;
    }

    /**
     * Determine whether the user can export the request to PDF.
     */
    public function exportPdf(?User $user, Request $request): bool
    {
        // Anyone who can view the request can export it
        return $this->view($user, $request);
    }

    /**
     * Determine whether the user can express interest in the request.
     * This would typically be used by partners looking to offer assistance.
     */
    public function expressInterest(?User $user, Request $request): bool
    {
        if (!$user) {
            return false;
        }

        // Cannot express interest in own request
        if ($user->id === $request->user_id) {
            return false;
        }

        // Partners can express interest in validated requests
        return $user->partner
            && $request->status->status_code === Status::VALIDATED_STATUS_CODE;
    }
}
