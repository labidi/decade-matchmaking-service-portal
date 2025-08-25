<?php

namespace App\Policies;

use App\Enums\Offer\RequestOfferStatus;
use App\Models\Request\Offer;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class OfferPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        // Administrators and partners can view offers
        return $user->hasRole('administrator') || $user->hasRole('partner');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(?User $user, Offer $offer): bool
    {
        if (!$user) {
            return false;
        }

        // Offer creator (matched partner), request owner, or admin can view
        return $user->id === $offer->matched_partner_id
            || $user->id === $offer->request->user_id
            || $user->hasRole('administrator');
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        // Partners can create offers
        return $user->hasRole('partner');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(?User $user, Offer $offer): bool
    {
        if (!$user) {
            return false;
        }

        // Only the offer creator can edit, and only when active and not accepted
        return $user->id === $offer->matched_partner_id
            && $offer->status === RequestOfferStatus::ACTIVE
            && !$offer->is_accepted;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(?User $user, Offer $offer): bool
    {
        if (!$user) {
            return false;
        }

        // Offer creator or admin can delete, only when not accepted
        return ($user->id === $offer->matched_partner_id || $user->hasRole('administrator'))
            && !$offer->is_accepted;
    }

    /**
     * Determine whether the user can accept the offer.
     */
    public function accept(?User $user, Offer $offer): bool
    {
        if (!$user) {
            return false;
        }

        // Only the request owner can accept offers
        return $user->id === $offer->request->user_id
            && $offer->status === RequestOfferStatus::ACTIVE
            && !$offer->is_accepted;
    }

    /**
     * Determine whether the user can reject the offer.
     */
    public function reject(?User $user, Offer $offer): bool
    {
        if (!$user) {
            return false;
        }

        // Only the request owner can reject offers
        return $user->id === $offer->request->user_id
            && $offer->status === RequestOfferStatus::ACTIVE
            && !$offer->is_accepted;
    }

    /**
     * Determine whether the user can request clarifications for the offer.
     */
    public function requestClarifications(?User $user, Offer $offer): bool
    {
        if (!$user) {
            return false;
        }

        // Request owner can request clarifications on active offers
        return $user->id === $offer->request->user_id
            && $offer->status === RequestOfferStatus::ACTIVE
            && !$offer->is_accepted;
    }

    /**
     * Determine whether the user can manage documents for the offer.
     */
    public function manageDocuments(?User $user, Offer $offer): bool
    {
        if (!$user) {
            return false;
        }

        // Offer creator can manage documents
        return $user->id === $offer->matched_partner_id;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Offer $offer): bool
    {
        return $user->hasRole('administrator');
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Offer $offer): bool
    {
        return $user->hasRole('administrator');
    }
}
