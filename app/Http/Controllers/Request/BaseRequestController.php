<?php

namespace App\Http\Controllers\Request;

use App\Http\Controllers\Controller;
use App\Models\Request\Status;
use App\Services\RequestService;
use App\Traits\HasBreadcrumbs;
use Illuminate\Http\Request;

/**
 * Base controller for all request-related operations
 *
 * Provides common functionality for both admin and user contexts:
 * - Route context detection (admin vs user routes)
 * - Common filter building and pagination
 * - Context-aware response handling
 * - Breadcrumb generation
 */
abstract class BaseRequestController extends Controller
{
    use HasBreadcrumbs;

    public function __construct(
        protected readonly RequestService $service
    ) {
    }

    /**
     * Get the view prefix based on route context
     */
    protected function getViewPrefix(): string
    {
        return $this->isAdminRoute() ? 'Admin/' : '';
    }

    /**
     * Build common filters from request parameters
     */
    protected function buildFilters(Request $request): array
    {
        $sortField = $request->get('sort', 'created_at');
        $sortOrder = $request->get('order', 'desc');
        $searchUser = $request->get('user');
        $searchTitle = $request->get('title');

        return [
            'search' => array_filter([
                'user' => $searchUser,
                'title' => $searchTitle,
            ]),
            'sort' => [
                'field' => $sortField,
                'order' => $sortOrder,
                'per_page' => 10,
            ],
            'current' => [
                'sort' => ['field' => $sortField, 'order' => $sortOrder],
                'search' => ['user' => $searchUser ?? '', 'title' => $searchTitle ?? ''],
            ]
        ];
    }

    /**
     * Build context-aware breadcrumbs for request operations
     */
    protected function buildContextualRequestBreadcrumbs(string $action, ?int $requestId = null): array
    {
        return $this->buildRequestBreadcrumbs($action, $requestId, $this->isAdminRoute());
    }

    /**
     * Get success response based on context
     *
     * Admin routes typically redirect to list page
     * User/API routes may return JSON responses
     */
    protected function getSuccessResponse(string $message, ?string $redirectRoute = null)
    {
        if ($this->isAdminRoute() && $redirectRoute) {
            return to_route($redirectRoute)->with('success', $message);
        }

        // Default JSON response for non-admin routes
        return response()->json(['message' => $message]);
    }

    /**
     * Get error response based on context
     */
    protected function getErrorResponse(string $message, int $statusCode = 400, ?string $redirectRoute = null)
    {
        if ($this->isAdminRoute() && $redirectRoute) {
            return to_route($redirectRoute)->with('error', $message);
        }

        // Default JSON response for non-admin routes
        return response()->json(['error' => $message], $statusCode);
    }

    /**
     * Handle common status update validation
     */
    protected function validateStatusUpdate(Request $request): array
    {
        return $request->validate([
            'status_code' => 'required|string|exists:request_statuses,status_code',
        ]);
    }

}
