<?php

namespace App\Http\Controllers;

use App\Models\Data\CountryOptions;
use App\Models\Data\OceanOptions;
use App\Models\Data\RegionOptions;
use App\Models\Data\TargetAudienceOptions;
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
                'countries' => CountryOptions::getOptions(),
                'regions' => RegionOptions::getOptions(),
                'oceans' => OceanOptions::getOptions(),
                'targetAudiences' => TargetAudienceOptions::getOptions(),
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
