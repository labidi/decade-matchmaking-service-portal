<?php

namespace App\Http\Controllers\Offer;

use App\Models\Request as OCDRequest;
use Exception;
use Illuminate\Http\Request as HttpRequest;
use Illuminate\Http\JsonResponse;

class ListController extends BaseOfferController
{
    public function __invoke(HttpRequest $httpRequest, OCDRequest $request): JsonResponse
    {
        try {
            // Request is guaranteed to exist due to route model binding

            $requestOffers = $request->offers()
                ->with(['documents' => function ($query) {
                    $query->select('id', 'name', 'path', 'parent_id', 'parent_type');
                }])
                ->orderBy('created_at', 'desc')
                ->get();

            return $this->jsonSuccessResponse(
                'Offers retrieved successfully',
                [
                    'offers' => $requestOffers,
                    'count' => $requestOffers->count()
                ]
            );

        } catch (Exception $exception) {
            return $this->handleException(
                $exception,
                'list offers for request',
                ['request_id' => $request->id ?? null]
            );
        }
    }
}
