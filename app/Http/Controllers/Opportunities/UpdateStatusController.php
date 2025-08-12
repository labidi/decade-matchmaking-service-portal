<?php

namespace App\Http\Controllers\Opportunities;

use App\Http\Controllers\Controller;
use App\Services\OpportunityService;
use Illuminate\Http\Request;
use Exception;

class UpdateStatusController extends Controller
{
    public function __construct(private OpportunityService $opportunityService)
    {
    }

    public function __invoke(Request $request, int $opportunityId)
    {
        try {
            $statusCode = (int)$request->input('status');
            $result = $this->opportunityService->updateOpportunityStatus($opportunityId, $statusCode, $request->user());

            return response()->json([
                'message' => 'Status updated successfully',
                'status' => $result['status'],
            ]);
        } catch (Exception $e) {
            $statusCode = $e->getCode() ?: 500;
            return response()->json(['error' => $e->getMessage()], $statusCode);
        }
    }
} 