<?php

namespace App\Policies;

use App\Enums\Offer\RequestOfferStatus;
use App\Models\Request;
use App\Models\Request\Status;
use App\Models\User;

class RequestPolicy
{
    /**
     * Determine whether the user can view the request.
     */
    public function view(?User $user, Request $request): bool
    {
        if (! $user) {
            return false;
        }
        if ($user->hasRole('partner')) {
            return true;
        }

        // Request owner, matched partner, or admin can view
        return $user->id === $request->user->id
            || $user->id === $request->matchedPartner?->id
            || $user->hasRole('administrator');
    }

    /**
     * Determine whether the user can view offers for the request.
     * Individual offers will be filtered based on OfferPolicy::view().
     */
    public function viewOffers(?User $user, Request $request): bool
    {
        if (! $user) {
            return false;
        }
        if ($user->hasRole('administrator')) {
            return true;
        }
        if ($user->id === $request->user_id) {
            return true;
        }

        return $user->hasRole('partner');
    }

    public function viewActiveOffer(?User $user, Request $request): bool
    {
        if (! $user) {
            return false;
        }
        if ($user->id === $request->user_id || $user->id === $request->activeOffer?->matchedPartner?->id) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can update the request.
     */
    public function update(?User $user, Request $request): bool
    {
        if (! $user) {
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
        if (! $user) {
            return false;
        }

        return $user->id === $request->user_id
            && $request->status->status_code === Status::DRAFT_STATUS_CODE;
    }

    public function manageOffers(?User $user, Request $request): bool
    {
        if (! $user) {
            return false;
        }

        return $user->hasRole('administrator');
    }

    public function updateStatus(?User $user, Request $request): bool
    {
        if (! $user) {
            return false;
        }

        return $user->hasRole('administrator');
    }

    public function acceptOffer(?User $user, Request $request): bool
    {
        if (! $user) {
            return false;
        }

        if ($user->id !== $request->user_id) {
            return false;
        }

        return $request->offers()
            ->where('status', RequestOfferStatus::ACTIVE)
            ->where('is_accepted', false)
            ->exists();
    }

    public function requestClarifications(?User $user, Request $request): bool
    {
        if (! $user) {
            return false;
        }

        if ($user->id === $request->user_id) {
            return $request->offers()
                ->where('status', RequestOfferStatus::ACTIVE)
                ->where('is_accepted', false)
                ->exists();
        }

        return false;
    }

    public function exportPdf(?User $user, Request $request): bool
    {
        // Anyone who can view the request can export it
        return $this->view($user, $request);
    }

    public function expressInterest(?User $user, Request $request): bool
    {
        if (! $user) {
            return false;
        }

        if ($user->id === $request->user_id) {
            return false;
        }

        return $user->hasRole('partner')
            && $request->status->status_code === Status::VALIDATED_STATUS_CODE;
    }
}
