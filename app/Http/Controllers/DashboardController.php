<?php

namespace App\Http\Controllers;

use App\Models\Opportunity;
use App\Models\Request as RequestModel;
use App\Models\User;
use App\Traits\HasBreadcrumbs;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    use HasBreadcrumbs;
    public function index(Request $HttpRequest): \Inertia\Response
    {
        $user = $HttpRequest->user();

        // Calculate statistics
        $today = Carbon::today();
        $yesterday = Carbon::yesterday();
        $weekAgo = Carbon::now()->subWeek();

        // Daily statistics
        $dailyRequests = RequestModel::whereDate('created_at', $today)->count();
        $dailyOpportunities = Opportunity::whereDate('created_at', $today)->count();

        // Weekly statistics
        $weeklyRegistrations = User::where('created_at', '>=', $weekAgo)->count();

        // Total statistics
        $totalUsers = User::count();
        $totalRequests = RequestModel::count();
        $totalOpportunities = Opportunity::count();

        // Calculate trends (simplified - you might want to implement more sophisticated trend calculation)
        $yesterdayRequests = RequestModel::whereDate('created_at', $yesterday)->count();
        $yesterdayOpportunities = Opportunity::whereDate('created_at', $yesterday)->count();
        $lastWeekRegistrations = User::whereBetween('created_at', [$weekAgo->copy()->subWeek(), $weekAgo])->count();

        $requestTrend = $yesterdayRequests > 0 ? round((($dailyRequests - $yesterdayRequests) / $yesterdayRequests) * 100) : 0;
        $opportunityTrend = $yesterdayOpportunities > 0 ? round((($dailyOpportunities - $yesterdayOpportunities) / $yesterdayOpportunities) * 100) : 0;
        $registrationTrend = $lastWeekRegistrations > 0 ? round((($weeklyRegistrations - $lastWeekRegistrations) / $lastWeekRegistrations) * 100) : 0;

        return Inertia::render('Admin/Dashboard', [
            'title' => 'Welcome '.$user->name,
            'stats' => [
                'dailyRequests' => $dailyRequests,
                'dailyOpportunities' => $dailyOpportunities,
                'weeklyRegistrations' => $weeklyRegistrations,
                'totalUsers' => $totalUsers,
                'totalRequests' => $totalRequests,
                'totalOpportunities' => $totalOpportunities,
                'trends' => [
                    'requests' => $requestTrend,
                    'opportunities' => $opportunityTrend,
                    'registrations' => $registrationTrend,
                ]
            ],
            'breadcrumbs' => [
                ['name' => 'Dashboard'],
            ],
        ]);
    }
}
