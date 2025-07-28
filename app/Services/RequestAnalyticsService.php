<?php

namespace App\Services;

use App\Models\Request as OCDRequest;
use App\Models\Request\Detail;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class RequestAnalyticsService
{
    /**
     * Get request statistics for a user
     */
    public function getUserRequestStats(User $user): array
    {
        $userRequests = OCDRequest::with('status')
            ->where('user_id', $user->id)
            ->get();

        return [
            'total' => $userRequests->count(),
            'draft' => $userRequests->where('status.status_code', 'draft')->count(),
            'under_review' => $userRequests->where('status.status_code', 'under_review')->count(),
            'validated' => $userRequests->where('status.status_code', 'validated')->count(),
            'offer_made' => $userRequests->where('status.status_code', 'offer_made')->count(),
            'match_made' => $userRequests->where('status.status_code', 'match_made')->count(),
            'in_implementation' => $userRequests->where('status.status_code', 'in_implementation')->count(),
            'closed' => $userRequests->where('status.status_code', 'closed')->count(),
        ];
    }

    /**
     * Get comprehensive analytics data
     */
    public function getAnalytics(): array
    {
        $analytics = [
            'total_requests' => OCDRequest::count(),
            'requests_by_status' => $this->getRequestsByStatus(),
        ];

        // Add normalized analytics if available
        if (Schema::hasTable('request_details')) {
            $analytics['requests_by_activity'] = $this->getRequestsByActivity();
            $analytics['popular_subthemes'] = $this->getPopularSubthemes();
            $analytics['support_type_distribution'] = $this->getSupportTypeDistribution();
        }

        return $analytics;
    }

    /**
     * Get requests grouped by status
     */
    public function getRequestsByStatus(): array
    {
        return OCDRequest::join('request_statuses', 'requests.status_id', '=', 'request_statuses.id')
            ->select('request_statuses.status_label', DB::raw('count(*) as count'))
            ->groupBy('request_statuses.id', 'request_statuses.status_label')
            ->get()
            ->pluck('count', 'status_label')
            ->toArray();
    }

    /**
     * Get requests grouped by activity type
     */
    public function getRequestsByActivity(): array
    {
        return Detail::select('related_activity', DB::raw('count(*) as count'))
            ->whereNotNull('related_activity')
            ->groupBy('related_activity')
            ->get()
            ->pluck('count', 'related_activity')
            ->toArray();
    }

    /**
     * Get most popular subthemes
     */
    public function getPopularSubthemes(): array
    {
        $subthemes = Detail::select('subthemes')
            ->whereNotNull('subthemes')
            ->where('subthemes', '!=', '[]')
            ->get()
            ->pluck('subthemes')
            ->flatten()
            ->countBy()
            ->sortDesc()
            ->take(10);

        return $subthemes->toArray();
    }

    /**
     * Get support type distribution
     */
    public function getSupportTypeDistribution(): array
    {
        $supportTypes = Detail::select('support_types')
            ->whereNotNull('support_types')
            ->where('support_types', '!=', '[]')
            ->get()
            ->pluck('support_types')
            ->flatten()
            ->countBy();

        return $supportTypes->toArray();
    }

    /**
     * Get request trends over time
     */
    public function getRequestTrends(int $months = 12): array
    {
        return OCDRequest::select(
            DB::raw('DATE_FORMAT(created_at, "%Y-%m") as month'),
            DB::raw('COUNT(*) as count')
        )
            ->where('created_at', '>=', now()->subMonths($months))
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->pluck('count', 'month')
            ->toArray();
    }

    /**
     * Get status transition analytics
     */
    public function getStatusTransitions(): array
    {
        // This would require a status history table to track transitions
        // For now, return current status distribution
        return $this->getRequestsByStatus();
    }

    /**
     * Get geographic distribution of requests
     */
    public function getGeographicDistribution(): array
    {
        return Detail::select('delivery_countries', DB::raw('count(*) as count'))
            ->whereNotNull('delivery_countries')
            ->where('delivery_countries', '!=', '[]')
            ->groupBy('delivery_countries')
            ->get()
            ->pluck('count', 'delivery_countries')
            ->toArray();
    }

    /**
     * Get average request processing time by status
     */
    public function getProcessingTimeAnalytics(): array
    {
        return OCDRequest::join('request_statuses', 'requests.status_id', '=', 'request_statuses.id')
            ->select(
                'request_statuses.status_label',
                DB::raw('AVG(DATEDIFF(updated_at, created_at)) as avg_days'),
                DB::raw('MIN(DATEDIFF(updated_at, created_at)) as min_days'),
                DB::raw('MAX(DATEDIFF(updated_at, created_at)) as max_days')
            )
            ->where('requests.created_at', '!=', DB::raw('requests.updated_at'))
            ->groupBy('request_statuses.id', 'request_statuses.status_label')
            ->get()
            ->mapWithKeys(function ($item) {
                return [$item->status_label => [
                    'average_days' => round($item->avg_days, 1),
                    'min_days' => $item->min_days,
                    'max_days' => $item->max_days,
                ]];
            })
            ->toArray();
    }
}
