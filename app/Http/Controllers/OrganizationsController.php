<?php

namespace App\Http\Controllers;

use App\Http\Resources\OrganizationResource;
use App\Services\OrganizationService;

class OrganizationsController extends Controller
{
    public function __construct(
        private readonly OrganizationService $organizationService
    ) {
    }

    /**
     * Get all organizations
     */
    public function index()
    {
        $organizations = $this->organizationService->getAllOrganizations();

        return [
            'organizations' => OrganizationResource::collection($organizations)
        ];
    }
}
