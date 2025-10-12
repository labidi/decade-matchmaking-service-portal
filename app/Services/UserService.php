<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\User;
use App\Services\User\UserAnalyticsService;
use App\Services\User\UserRepository;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

readonly class UserService
{
    public function __construct(
        private UserRepository $repository,
        private UserAnalyticsService $analytics
    ) {
    }

    /**
     * Get paginated users for admin grid
     */
    public function getUsersPaginated(
        array $searchFilters = [],
        array $sortFilters = []
    ): LengthAwarePaginator {
        return $this->repository->getPaginated($searchFilters, $sortFilters);
    }

    /**
     * Assign roles to user
     */
    public function assignRoles(User $user, array $roleNames): User
    {
        return DB::transaction(function () use ($user, $roleNames) {
            $user->syncRoles($roleNames);

            Log::info('User roles updated', [
                'user_id' => $user->id,
                'roles' => $roleNames,
                'updated_by' => auth()->id(),
            ]);

            return $user->fresh(['roles']);
        });
    }

    /**
     * Block/unblock user account
     */
    public function toggleBlockStatus(User $user, bool $blocked): User
    {
        return DB::transaction(function () use ($user, $blocked) {
            $this->repository->update($user, [
                'is_blocked' => $blocked,
            ]);

            if ($blocked) {
                // Terminate all active sessions
                DB::table('sessions')->where('user_id', $user->id)->delete();
            }

            Log::info('User block status updated', [
                'user_id' => $user->id,
                'blocked' => $blocked,
                'updated_by' => auth()->id(),
            ]);

            return $user->fresh();
        });
    }

    /**
     * Get user details with statistics
     */
    public function getUserDetails(User $user): array
    {
        return [
            'user' => $user->load(['roles', 'permissions']),
            'statistics' => $this->analytics->getUserStatistics($user),
            'activity' => $this->analytics->getUserActivitySummary($user),
        ];
    }

    /**
     * Get all users
     */
    public function getAllUsers(): Collection
    {
        return User::all();
    }

    /**
     * Get all users with admin role
     */
    public function getAllAdmins(): Collection
    {
        return User::role('administrator')->get();
    }

    /**
     * Get all users with a specific role
     */
    public function getUsersByRole(string $roleName): Collection
    {
        return $this->repository->getUsersByRole($roleName);
    }

    /**
     * Get all users with any of the specified roles
     */
    public function getUsersByRoles(array $roleNames): Collection
    {
        return User::role($roleNames)->get();
    }

    /**
     * Get all users with a specific permission
     */
    public function getUsersByPermission(string $permissionName): Collection
    {
        return User::permission($permissionName)->get();
    }

    /**
     * Check if a user has admin privileges
     */
    public function isAdmin(User $user): bool
    {
        return $user->hasRole('administrator');
    }

    /**
     * Check if a user is a partner
     */
    public function isPartner(User $user): bool
    {
        return $user->hasRole('partner');
    }
}
