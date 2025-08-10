<?php

namespace App\Http\Controllers\Request;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Exception;

class RequestManagementController extends BaseRequestController
{
    /**
     * Update request status - unified method for both admin and user contexts
     */
    public function updateStatus(Request $request, ?int $requestId = null)
    {
        // Handle admin route parameter format
        if ($this->isAdminRoute() && !$requestId) {
            $requestId = (int) $request->route('request');
        }
        return $this->handleStatusUpdate($request, $requestId);
    }

    /**
     * Remove the specified resource from storage
     */
    public function destroy(Request $request): JsonResponse
    {
        try {
            $requestId = (int)$request->route('id');
            $this->service->deleteRequest($requestId, $request->user());

            return response()->json(['message' => 'Request deleted successfully']);
        } catch (Exception $e) {
            $statusCode = $e->getCode() ?: 500;
            return response()->json(['error' => $e->getMessage()], $statusCode);
        }
    }
}
