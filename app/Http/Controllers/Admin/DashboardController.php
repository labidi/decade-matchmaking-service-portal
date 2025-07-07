<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Opportunity;
use App\Models\Request as RequestModel;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class DashboardController extends Controller
{
    public function index(Request $HttpRequest): \Inertia\Response
    {
        $user = $HttpRequest->user();

        // Calculate statistics
        $today = Carbon::today();
        $yesterday = Carbon::yesterday();
        $weekAgo = Carbon::now()->subWeek();
        $monthAgo = Carbon::now()->subMonth();

        // Daily statistics
        $dailyRequests = RequestModel::whereDate('created_at', $today)->count();
        $dailyOpportunities = Opportunity::whereDate('created_at', $today)->count();

        // Weekly statistics
        $weeklyRegistrations = User::where('created_at', '>=', $weekAgo)->count();

        // Total statistics
        $totalUsers = User::count();
        $totalRequests = RequestModel::count();
        $totalOpportunities = Opportunity::count();

        // Active partners (users who have made offers)
//        $activePartners = User::whereHas('requestOffers')->distinct()->count();
        $activePartners = 20;

        // Success rate (requests with offers)
//        $requestsWithOffers = RequestModel::whereHas('offers')->count();
        $requestsWithOffers = 20;
        $successRate = $totalRequests > 0 ? round(($requestsWithOffers / $totalRequests) * 100, 1) : 0;

        // Calculate trends (simplified - you might want to implement more sophisticated trend calculation)
        $yesterdayRequests = RequestModel::whereDate('created_at', $yesterday)->count();
        $yesterdayOpportunities = Opportunity::whereDate('created_at', $yesterday)->count();
        $lastWeekRegistrations = User::whereBetween('created_at', [$weekAgo->copy()->subWeek(), $weekAgo])->count();

        $requestTrend = $yesterdayRequests > 0 ? round((($dailyRequests - $yesterdayRequests) / $yesterdayRequests) * 100) : 0;
        $opportunityTrend = $yesterdayOpportunities > 0 ? round((($dailyOpportunities - $yesterdayOpportunities) / $yesterdayOpportunities) * 100) : 0;
        $registrationTrend = $lastWeekRegistrations > 0 ? round((($weeklyRegistrations - $lastWeekRegistrations) / $lastWeekRegistrations) * 100) : 0;

        return Inertia::render('Admin/Dashboard', [
            'title' => 'Welcome '.$user->name,
            'banner' => [
                'title' => 'Welcome back '.$user->name,
                'description' => 'Whether you\'re seeking training or offering expertise, this platform makes the connection. It\'s where organizations find support—and partners find purpose. By matching demand with opportunity, it brings the right people and resources together. A transparent marketplace driving collaboration, innovation, and impact.',
                'image' => '/assets/img/sidebar.png',
            ],
            'stats' => [
                'dailyRequests' => $dailyRequests,
                'dailyOpportunities' => $dailyOpportunities,
                'weeklyRegistrations' => $weeklyRegistrations,
                'totalUsers' => $totalUsers,
                'totalRequests' => $totalRequests,
                'totalOpportunities' => $totalOpportunities,
                'activePartners' => $activePartners,
                'successRate' => $successRate,
                'trends' => [
                    'requests' => $requestTrend,
                    'opportunities' => $opportunityTrend,
                    'registrations' => $registrationTrend,
                ]
            ]
        ]);
    }
}
