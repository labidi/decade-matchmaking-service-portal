<?php

namespace App\Http\Controllers;

use App\Enums\Country;
use App\Enums\Ocean;
use App\Enums\Region;
use App\Enums\TargetAudience;
use App\Models\LocationData;
use Illuminate\Http\JsonResponse;

class LocationDataController extends Controller
{
    /**
     * Get all location data for the frontend
     */
    public function index(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => [
                'countries' => Country::getOptions(),
                'regions' => Region::getOptions(),
                'oceans' => Ocean::getOptions(),
                'targetAudiences' => TargetAudience::getOptions(),
            ]
        ]);
    }

    /**
     * Get implementation location options based on coverage activity
     */
    public function getImplementationLocationOptions(string $coverageActivity): JsonResponse
    {
        $options = LocationData::getImplementationLocationOptions($coverageActivity);
        return response()->json([
            'success' => true,
            'data' => $options
        ]);
    }
}
