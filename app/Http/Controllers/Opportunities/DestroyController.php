<?php

namespace App\Http\Controllers\Opportunities;

use App\Http\Controllers\Controller;
use App\Services\OpportunityService;
use Illuminate\Http\Request;
use Exception;

class DestroyController extends Controller
{
    public function __construct(private OpportunityService $opportunityService)
    {
    }

    public function __invoke(Request $request, int $id)
    {
        try {
            $this->opportunityService->deleteOpportunity($id, $request->user());

            return response()->json(['message' => 'Opportunity deleted successfully']);
        } catch (Exception $e) {
            $statusCode = $e->getCode() ?: 500;
            return response()->json(['error' => $e->getMessage()], $statusCode);
        }
    }
} 