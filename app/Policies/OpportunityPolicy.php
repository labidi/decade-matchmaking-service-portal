<?php

namespace App\Policies;

use App\Enums\Opportunity\Status;
use App\Models\Opportunity;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class OpportunityPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasRole('administrator');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Opportunity $opportunity): bool
    {
        return $user->hasRole('partner') && $opportunity->user->id === $user->id || $user->hasRole('administrator') ||  $opportunity->status === Status::ACTIVE;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->hasRole('partner');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Opportunity $opportunity): bool
    {
        return $user->hasRole('partner') && $opportunity->user->id === $user->id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Opportunity $opportunity): bool
    {
        return $user->hasRole('administrator') || $opportunity->user->id === $user->id;
    }

    public function extend(User $user, Opportunity $opportunity): bool
    {
        return $user->hasRole(
                'partner'
            ) && $opportunity->user->id === $user->id && $opportunity->closing_date->isNowOrPast();
    }


    public function reject(User $user, Opportunity $opportunity): bool
    {
        return $user->hasRole('administrator') && $opportunity->status !== Status::REJECTED;
    }

    public function close(User $user, Opportunity $opportunity): bool
    {
        return $user->hasRole('administrator') && $opportunity->status !== Status::CLOSED;
    }

    public function approve(User $user, Opportunity $opportunity): bool
    {
        return $user->hasRole('administrator') && $opportunity->status !== Status::ACTIVE;
    }

    public function apply(User $user, Opportunity $opportunity): bool
    {
        return $opportunity->status === Status::ACTIVE;
    }

}
