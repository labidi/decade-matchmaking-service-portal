<?php

namespace App\Http\Controllers\Offer;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\OfferService;
use App\Services\RequestService;
use App\Traits\HasBreadcrumbs;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * Base controller for all offer-related operations
 *
 * Provides common functionality for both admin and public contexts:
 * - Route context detection (admin vs public routes)
 * - Common error handling and logging
 * - Standardized response formatting
 * - Partner selection utilities
 * - Breadcrumb generation
 * - Authorization patterns
 */
abstract class BaseOfferController extends Controller
{
    use HasBreadcrumbs;

    /**
     * Get the view prefix based on route context
     */
    protected function getViewPrefix(): string
    {
        return $this->isAdminRoute() ? 'Admin/' : '';
    }

    /**
     * Get partners formatted for dropdowns/selection
     */
/*    protected function getPartnersForSelection(): array
    {
        $partners = User::whereHas('roles', function ($query) {
            $query->whereIn('name', ['partner', 'administrator']);
        })
            ->select('id', 'name', 'email', 'first_name', 'last_name')
            ->orderBy('name')
            ->get();

        return $partners->map(function ($partner) {
            return [
                'value' => $partner->id,
                'label' => $partner->name . ' (' . $partner->email . ')',
            ];
        })->toArray();
    }*/

    /**
     * Get partners with full details (for admin contexts)
     */
    protected function getPartnersWithDetails()
    {
        return User::whereHas('roles', function ($query) {
            $query->whereIn('name', ['partner', 'administrator']);
        })
            ->select('id', 'name', 'email')
            ->orderBy('name')
            ->get()
            ->map(function ($user) {
                return $user->makeVisible(['id']);
            });
    }

    /**
     * Build common search and sort filters from request parameters
     */
    protected function buildFilters(Request $request): array
    {
        $searchFilters = array_filter([
            'description' => $request->get('description'),
            'partner' => $request->get('partner'),
            'request' => $request->get('request'),
        ]);

        $sortFilters = [
            'sort' => $request->get('sort', 'created_at'),
            'order' => $request->get('order', 'desc'),
            'per_page' => $request->get('per_page', 10),
        ];

        return [
            'search' => $searchFilters,
            'sort' => $sortFilters,
            'current' => [
                'search' => $searchFilters,
                'sort' => [
                    'field' => $sortFilters['sort'],
                    'order' => $sortFilters['order'],
                ],
            ],
        ];
    }

    /**
     * Build context-aware breadcrumbs for offer operations
     */
    protected function buildOfferBreadcrumbs(string $action, ?int $offerId = null, ?int $requestId = null): array
    {
        $breadcrumbs = [
            ['name' => 'Dashboard', 'url' => route('admin.dashboard.index')],
        ];

        if ($requestId && $action !== 'list') {
            $breadcrumbs[] = [
                'name' => 'Request #' . $requestId,
                'url' => route('admin.request.show', $requestId)
            ];
        } else {
            $breadcrumbs[] = ['name' => 'Manage offers', 'url' => route('admin.offers.list')];
        }

        switch ($action) {
            case 'create':
                $breadcrumbs[] = ['name' => 'Create new offer'];
                break;
            case 'edit':
                $breadcrumbs[] = ['name' => 'Edit offer #' . $offerId];
                break;
            case 'show':
                $breadcrumbs[] = ['name' => 'Offer #' . $offerId, 'url' => route('admin.offers.show', $offerId)];
                break;
        }

        return $breadcrumbs;
    }

    /**
     * Handle exceptions with consistent logging and response formatting
     */
    protected function handleException(\Exception $exception, string $operation, array $context = []): JsonResponse|RedirectResponse
    {
        $logContext = array_merge([
            'operation' => $operation,
            'exception' => $exception,
            'user_id' => auth()->id(),
        ], $context);

        Log::error("Offer {$operation} error: " . $exception->getMessage(), $logContext);

        if ($this->isAdminRoute()) {
            return back()
                ->withInput()
                ->withErrors(['error' => $exception->getMessage()]);
        }

        return $this->jsonErrorResponse(
            'An unexpected error occurred',
            config('app.debug') ? $exception->getMessage() : 'Internal server error',
            500
        );
    }

    /**
     * Create standardized JSON success response
     */
    protected function jsonSuccessResponse(string $message, array $data = [], int $statusCode = 200): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $data,
        ], $statusCode);
    }

    /**
     * Create standardized JSON error response
     */
    protected function jsonErrorResponse(string $message, ?string $error = null, int $statusCode = 400): JsonResponse
    {
        $response = [
            'success' => false,
            'message' => $message,
        ];

        if ($error) {
            $response['error'] = $error;
        }

        return response()->json($response, $statusCode);
    }

    /**
     * Get success response based on context (admin redirect or JSON)
     */
    protected function getSuccessResponse(string $message, ?string $redirectRoute = null, array $data = []): JsonResponse|RedirectResponse
    {
        if ($this->isAdminRoute() && $redirectRoute) {
            return to_route($redirectRoute)->with('success', $message);
        }

        return $this->jsonSuccessResponse($message, $data);
    }

    /**
     * Get error response based on context (admin redirect or JSON)
     */
    protected function getErrorResponse(string $message, ?string $error = null, int $statusCode = 400, ?string $redirectRoute = null): JsonResponse|RedirectResponse
    {
        if ($this->isAdminRoute() && $redirectRoute) {
            return to_route($redirectRoute)->with('error', $message);
        }

        return $this->jsonErrorResponse($message, $error, $statusCode);
    }



    /**
     * Common validation rules for offer operations
     */
    protected function getOfferValidationRules(bool $isUpdate = false): array
    {
        $rules = [
            'description' => 'required|string|min:10',
            'document' => 'nullable|file|mimes:pdf|max:10240', // 10MB max
        ];

        if (!$isUpdate) {
            $rules['request_id'] = 'required|exists:requests,id';
            $rules['partner_id'] = 'required|exists:users,id';
        }

        return $rules;
    }

    /**
     * Get validation messages for offer operations
     */
    protected function getOfferValidationMessages(): array
    {
        return [
            'description.required' => 'The offer description is required.',
            'description.min' => 'The offer description must be at least :min characters.',
            'request_id.required' => 'The request is required.',
            'request_id.exists' => 'The selected request does not exist.',
            'partner_id.required' => 'The partner is required.',
            'partner_id.exists' => 'The selected partner does not exist.',
            'document.file' => 'The document must be a valid file.',
            'document.mimes' => 'The document must be a PDF file.',
            'document.max' => 'The document may not be greater than :max kilobytes.',
        ];
    }
}
