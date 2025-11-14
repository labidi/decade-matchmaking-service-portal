<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\OpportunityCollection;
use App\Services\OpportunityService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class OpportunityController extends Controller
{
    public function __construct(
        private readonly OpportunityService $opportunityService
    ) {
    }

    /**
     * List all active opportunities.
     *
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        try {
            $opportunities = $this->opportunityService->getPublicOpportunities();

            return response()->json([
                'status' => 'success',
                'data' => new OpportunityCollection($opportunities),
            ], 200);
        } catch (\Throwable $e) {
            Log::error('Failed to fetch opportunities', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch opportunities',
                'error' => config('app.debug') ? $e->getMessage() : 'An error occurred',
            ], 500);
        }
    }
}
