<?php

namespace App\Services\User;

use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class UserRepository
{
    public function __construct(
        private readonly UserQueryBuilder $queryBuilder
    ) {
    }

    public function create(array $data): User
    {
        return User::create($data);
    }

    public function update(User $user, array $data): bool
    {
        return $user->update($data);
    }

    public function findById(int $id): ?User
    {
        return User::find($id);
    }

    public function findByEmail(string $email): ?User
    {
        return User::where('email', $email)->first();
    }

    public function getPaginated(
        array $searchFilters,
        array $sortFilters
    ): LengthAwarePaginator {
        $query = $this->queryBuilder->buildBaseQuery();
        $query = $this->queryBuilder->applySearchFilters($query, $searchFilters);
        $query = $this->queryBuilder->applyStatusFilters($query, $searchFilters);
        $query = $this->queryBuilder->applyRoleFilters($query, $searchFilters);
        $query = $this->queryBuilder->applySorting($query, $sortFilters);

        return $this->queryBuilder->applyPagination($query, $sortFilters);
    }

    public function getActiveUsers(): Collection
    {
        return User::where('is_blocked', false)
            ->whereNotNull('email_verified_at')
            ->get();
    }

    public function getBlockedUsers(): Collection
    {
        return User::where('is_blocked', true)->get();
    }

    public function getUsersByRole(string $roleName): Collection
    {
        return User::role($roleName)->get();
    }
}
