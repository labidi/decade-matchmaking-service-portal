<?php

namespace App\Services;

use App\Services\Organization\OrganizationRepository;
use Illuminate\Database\Eloquent\Collection;

readonly class OrganizationService
{
    public function __construct(
        private OrganizationRepository $repository
    ) {
    }

    /**
     * Get all organizations
     */
    public function getAllOrganizations(): Collection
    {
        return $this->repository->getAll();
    }
}