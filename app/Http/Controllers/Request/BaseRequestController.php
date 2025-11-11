<?php

namespace App\Http\Controllers\Request;

use App\Http\Controllers\Controller;
use App\Models\Request\Status;
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
            return 'admin';
        }

        // User own requests
        if ($routeName === 'request.me.list') {
            return 'user_own';
        }

        // Matched requests
        if ($routeName === 'request.me.matched-requests') {
            return 'matched';
        }

        // Subscribed requests
        if ($routeName === 'request.me.subscribed-requests') {
            return 'subscribed';
        }

        // Public context (default for partners)
        return 'public';
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
