<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

class UserService
{
    /**
     * Get all users
     *
     * @return Collection
     */
    public function getAllUsers(): Collection
    {
        return User::all();
    }

    /**
     * Get all users with admin role
     *
     * @return Collection
     */
    public function getAllAdmins(): Collection
    {
        return User::role('administrator')->get();
    }

    /**
     * Get all users with a specific role
     *
     * @param string $roleName
     * @return Collection
     */
    public function getUsersByRole(string $roleName): Collection
    {
        return User::role($roleName)->get();
    }

    /**
     * Get all users with any of the specified roles
     *
     * @param array $roleNames
     * @return Collection
     */
    public function getUsersByRoles(array $roleNames): Collection
    {
        return User::role($roleNames)->get();
    }

    /**
     * Get all users with a specific permission
     *
     * @param string $permissionName
     * @return Collection
     */
    public function getUsersByPermission(string $permissionName): Collection
    {
        return User::permission($permissionName)->get();
    }

    /**
     * Check if a user has admin privileges
     *
     * @param User $user
     * @return bool
     */
    public function isAdmin(User $user): bool
    {
        return $user->hasRole('administrator');
    }

    /**
     * Check if a user is a partner
     *
     * @param User $user
     * @return bool
     */
    public function isPartner(User $user): bool
    {
        return $user->hasRole('partner');
    }
}
