<?php

namespace App\Http\Controllers;

use App\Http\Resources\IOCPlatformResource;
use App\Services\IOCPlatformService;

class IOCPlatformsController extends Controller
{
    public function __construct(
        private readonly IOCPlatformService $platformService
    ) {
    }

    /**
     * Get all IOC platforms
     */
    public function index()
    {
        $platforms = $this->platformService->getAllPlatforms();

        return [
            'platforms' => IOCPlatformResource::collection($platforms)
        ];
    }
}