<?php

namespace App\Services\Organization;

use App\Models\Organization;
use Illuminate\Database\Eloquent\Collection;

class OrganizationRepository
{
    /**
     * Get all organizations
     */
    public function getAll(): Collection
    {
        return Organization::orderBy('name', 'asc')->get();
    }

    /**
     * Find organization by ID
     */
    public function findById(int $id): ?Organization
    {
        return Organization::find($id);
    }
}