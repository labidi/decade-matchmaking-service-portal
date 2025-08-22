<?php

namespace App\Http\Controllers\Request;

use App\Services\RequestService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Exception;

class RequestManagementController extends BaseRequestController
{
    public function __construct(protected readonly RequestService $service)
    {
    }

    /**
     * Update request status - unified method for both admin and user contexts
     */
    public function updateStatus(Request $request, ?int $id = null)
    {
        try {
            $validated = $request->validate([
                'status_code' => 'required|string|exists:request_statuses,status_code',
            ]);

            $result = $this->service->updateRequestStatus(
                $id,
                $validated['status_code'],
                $request->user()
            );

            $message = 'Request status updated successfully';

            if ($this->isAdminRoute()) {
                return $this->getSuccessResponse($message, 'admin.request.list');
            }

            // For non-admin routes, return JSON with updated status
            return response()->json([
                'message' => $message,
                'status' => $result['request']->status
            ]);
        } catch (Exception $e) {
            $statusCode = $e->getCode() ?: 500;

            if ($this->isAdminRoute()) {
                return $this->getErrorResponse($e->getMessage(), $statusCode, 'admin.request.list');
            }

            return response()->json(['error' => $e->getMessage()], $statusCode);
        }
    }


    private function getSuccessResponse(string $message, ?string $redirectRoute = null)
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
    private function getErrorResponse(string $message, int $statusCode = 400, ?string $redirectRoute = null)
    {
        if ($this->isAdminRoute() && $redirectRoute) {
            return to_route($redirectRoute)->with('error', $message);
        }

        // Default JSON response for non-admin routes
        return response()->json(['error' => $message], $statusCode);
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
