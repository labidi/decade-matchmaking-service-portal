<?php

namespace App\Http\Controllers\Request;

use App\Http\Controllers\Controller;
use App\Models\Request\Status;
use App\Services\Request\RequestContextService;
use App\Services\RequestService;
use Illuminate\Http\Request;


abstract class BaseRequestController extends Controller
{
    /**
     * Get the context based on route name
     */
    protected function getRouteContext(): string
    {
        $routeName = request()->route()->getName() ?? '';

        // Admin context
        if (str_starts_with($routeName, 'admin.')) {
            return RequestContextService::CONTEXT_ADMIN;
        }

        // User own requests
        if ($routeName === 'request.me.list') {
            return RequestContextService::CONTEXT_USER_OWN;
        }

        // Matched requests
        if ($routeName === 'request.me.matched-requests') {
            return RequestContextService::CONTEXT_MATCHED;
        }

        // Subscribed requests
        if ($routeName === 'request.me.subscribed-requests') {
            return RequestContextService::CONTEXT_SUBSCRIBED;
        }

        // Public context (default for partners)
        return RequestContextService::CONTEXT_PUBLIC;
    }

    /**
     * Get context from request (query parameter or route)
     * Prioritizes query parameter for detail views
     *
     * @param Request $request HTTP request
     * @return string Context identifier
     */
    protected function getContextFromRequest(Request $request): string
    {
        $contextService = app(RequestContextService::class);

        // Check for explicit context query parameter
        $queryContext = $request->query('context');
        if ($queryContext && $contextService->isValidContext($queryContext)) {
            return $queryContext;
        }

        // Fall back to route-based context
        return $this->getRouteContext();
    }

    /**
     * Build search filters from request based on field configurations.
     */
    protected function buildSearchFilters(Request $request, array $fields): array
    {
        $filters = [];

        foreach ($fields as $field) {
            if (!is_array($field) || !isset($field['name'])) {
                continue;
            }

            $fieldName = $field['name'];
            $value = $request->get($fieldName);

            if ($value !== null && $value !== '') {
                $filters[$fieldName] = $value;
            }
        }

        return $filters;
    }

    /**
     * Build sort filters with defaults
     */
    protected function buildSortFilters(
        Request $request,
        string $defaultField = 'created_at',
        string $defaultOrder = 'desc',
        int $perPage = 10
    ): array {
        return [
            'field' => $request->get('sort', $defaultField),
            'order' => $request->get('order', $defaultOrder),
            'per_page' => (int) $request->get('per_page', $perPage),
        ];
    }

    /**
     * Build current search array based on context
     */
    protected function buildCurrentSearch(array $searchFilters, array $fields): array
    {
        $currentSearch = [];
        foreach ($fields as $field) {
            $currentSearch[$field] = $searchFilters[$field] ?? '';
        }
        return $currentSearch;
    }
}
