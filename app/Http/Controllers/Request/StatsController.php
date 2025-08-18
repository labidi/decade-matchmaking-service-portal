<?php

namespace App\Http\Controllers\Request;

use Illuminate\Http\Request;

class StatsController extends BaseRequestController
{
    /**
     * Get request statistics
     */
    public function __invoke(Request $request)
    {
        $stats = $this->service->getRequestStats($request->user());

        return response()->json(['stats' => $stats]);
    }
}
