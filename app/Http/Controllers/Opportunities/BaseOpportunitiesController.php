<?php

namespace App\Http\Controllers\Opportunities;

use App\Http\Controllers\Controller;
use App\Enums\OpportunityStatus;
use App\Enums\Country;
use App\Enums\Ocean;
use App\Enums\OpportunityType;
use App\Enums\Region;
use App\Enums\TargetAudience;
use App\Enums\YesNo;
use App\Models\Opportunity;
use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Http\Request;

abstract class BaseOpportunitiesController extends Controller
{
    /**
     * Detect if current route is an admin route
     */
    protected function isAdminRoute(): bool
    {
        return str_starts_with(request()->route()->getName() ?? '', 'admin.');
    }


    /**
     * Get the context based on route name
     */
    protected function getRouteContext(): string
    {
        $routeName = request()->route()->getName() ?? '';

        if (str_starts_with($routeName, 'admin.')) {
            return 'admin';
        }

        if (str_contains($routeName, '.me.')) {
            return 'user_own';
        }

        return 'public';
    }

    protected function buildSearchFilters(Request $request, array $fields): array
    {
        $filters = [];
        foreach ($fields as $field) {
            $value = $request->get($field);
            if ($value !== null && $value !== '') {
                $filters[$field] = $value;
            }
        }
        return $filters;
    }

    protected function buildSortFilters(Request $request, string $defaultField = 'created_at', string $defaultOrder = 'desc', int $perPage = 10): array
    {
        return [
            'field' => $request->get('sort', $defaultField),
            'order' => $request->get('order', $defaultOrder),
            'per_page' => (int) $request->get('per_page', $perPage),
        ];
    }

    protected function userPermissions(Opportunity $opportunity, ?Authenticatable $user): array
    {
        $isOwner = $user && $opportunity->user_id === $user->id;
        return [
            'canEdit' => $isOwner,
            'canDelete' => $isOwner && $opportunity->status === OpportunityStatus::PENDING_REVIEW,
            'canApply' => $opportunity->status === OpportunityStatus::ACTIVE && (bool) $opportunity->url,
            'isOwner' => $isOwner,
        ];
    }
}
