<?php

namespace App\Services;

use App\Models\Request as OCDRequest;
use App\Models\RequestDetail;
use App\Models\Subtheme;
use App\Models\SupportType;
use App\Models\TargetAudience;
use App\Models\Request\RequestStatus;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Exception;

class NormalizedRequestService
{
    /**
     * Store request with normalized data
     */
    public function storeRequest(User $user, array $data, ?OCDRequest $request = null): OCDRequest
    {
        return DB::transaction(function () use ($user, $data, $request) {
            if (!$request) {
                $request = new OCDRequest();
                $request->user()->associate($user);
            }
            
            // Store original JSON data for backward compatibility
            $request->request_data = json_encode($data);
            $request->status()->associate(RequestStatus::getUnderReviewStatus());
            $request->save();

            // Create normalized request detail
            $detail = $this->createRequestDetail($request, $data);
            
            // Sync relationships
            $this->syncSubthemes($request, $data['subthemes'] ?? []);
            $this->syncSupportTypes($request, $data['support_types'] ?? []);
            $this->syncTargetAudiences($request, $data['target_audience'] ?? []);

            Log::info('Request stored with normalized data', [
                'request_id' => $request->id,
                'user_id' => $user->id,
                'title' => $detail->capacity_development_title
            ]);

            return $request->load(['detail', 'subthemes', 'supportTypes', 'targetAudiences']);
        });
    }

    /**
     * Create request detail record
     */
    private function createRequestDetail(OCDRequest $request, array $data): RequestDetail
    {
        return RequestDetail::create([
            'request_id' => $request->id,
            'capacity_development_title' => $data['capacity_development_title'] ?? '',
            'is_related_decade_action' => $data['is_related_decade_action'] ?? 'No',
            'unique_related_decade_action_id' => $data['unique_related_decade_action_id'] ?? null,
            'first_name' => $data['first_name'] ?? '',
            'last_name' => $data['last_name'] ?? '',
            'email' => $data['email'] ?? '',
            'has_significant_changes' => $data['has_significant_changes'] ?? null,
            'changes_description' => $data['changes_description'] ?? null,
            'change_effect' => $data['change_effect'] ?? null,
            'request_link_type' => $data['request_link_type'] ?? null,
            'project_stage' => $data['project_stage'] ?? null,
            'project_url' => $data['project_url'] ?? null,
            'related_activity' => $data['related_activity'] ?? 'Training',
            'delivery_format' => $data['delivery_format'] ?? 'Online',
            'delivery_country' => $data['delivery_country'] ?? null,
            'subthemes_other' => $data['subthemes_other'] ?? null,
            'support_types_other' => $data['support_types_other'] ?? null,
            'target_audience_other' => $data['target_audience_other'] ?? null,
            'gap_description' => $data['gap_description'] ?? '',
            'has_partner' => $data['has_partner'] ?? null,
            'partner_name' => $data['partner_name'] ?? null,
            'partner_confirmed' => $data['partner_confirmed'] ?? null,
            'needs_financial_support' => $data['needs_financial_support'] ?? null,
            'budget_breakdown' => $data['budget_breakdown'] ?? null,
            'support_months' => $data['support_months'] ?? null,
            'completion_date' => $data['completion_date'] ?? null,
            'risks' => $data['risks'] ?? null,
            'personnel_expertise' => $data['personnel_expertise'] ?? null,
            'direct_beneficiaries' => $data['direct_beneficiaries'] ?? null,
            'direct_beneficiaries_number' => $data['direct_beneficiaries_number'] ?? null,
            'expected_outcomes' => $data['expected_outcomes'] ?? null,
            'success_metrics' => $data['success_metrics'] ?? null,
            'long_term_impact' => $data['long_term_impact'] ?? null,
            'additional_data' => $this->extractAdditionalData($data),
        ]);
    }

    /**
     * Sync subthemes relationship
     */
    private function syncSubthemes(OCDRequest $request, array $subthemeNames): void
    {
        $subthemeIds = [];
        
        foreach ($subthemeNames as $name) {
            $subtheme = Subtheme::firstOrCreate(['name' => $name]);
            $subthemeIds[] = $subtheme->id;
        }
        
        $request->subthemes()->sync($subthemeIds);
    }

    /**
     * Sync support types relationship
     */
    private function syncSupportTypes(OCDRequest $request, array $supportTypeNames): void
    {
        $supportTypeIds = [];
        
        foreach ($supportTypeNames as $name) {
            $supportType = SupportType::firstOrCreate(['name' => $name]);
            $supportTypeIds[] = $supportType->id;
        }
        
        $request->supportTypes()->sync($supportTypeIds);
    }

    /**
     * Sync target audiences relationship
     */
    private function syncTargetAudiences(OCDRequest $request, array $audienceNames): void
    {
        $audienceIds = [];
        
        foreach ($audienceNames as $name) {
            $audience = TargetAudience::firstOrCreate(['name' => $name]);
            $audienceIds[] = $audience->id;
        }
        
        $request->targetAudiences()->sync($audienceIds);
    }

    /**
     * Extract additional data not in main fields
     */
    private function extractAdditionalData(array $data): array
    {
        $mainFields = [
            'capacity_development_title', 'is_related_decade_action', 'unique_related_decade_action_id',
            'first_name', 'last_name', 'email', 'has_significant_changes', 'changes_description',
            'change_effect', 'request_link_type', 'project_stage', 'project_url', 'related_activity',
            'delivery_format', 'delivery_country', 'subthemes_other', 'support_types_other',
            'target_audience_other', 'gap_description', 'has_partner', 'partner_name',
            'partner_confirmed', 'needs_financial_support', 'budget_breakdown', 'support_months',
            'completion_date', 'risks', 'personnel_expertise', 'direct_beneficiaries',
            'direct_beneficiaries_number', 'expected_outcomes', 'success_metrics', 'long_term_impact'
        ];
        
        return array_diff_key($data, array_flip($mainFields));
    }

    /**
     * Advanced search with normalized data
     */
    public function advancedSearch(array $filters, User $user): Collection
    {
        $query = OCDRequest::with([
            'detail', 'subthemes', 'supportTypes', 'targetAudiences', 'status', 'user'
        ]);

        // Apply filters using normalized data
        if (isset($filters['search'])) {
            $query->whereHas('detail', function (Builder $q) use ($filters) {
                $q->search($filters['search']);
            });
        }

        if (isset($filters['activity_type'])) {
            $query->whereHas('detail', function (Builder $q) use ($filters) {
                $q->byActivityType($filters['activity_type']);
            });
        }

        if (isset($filters['delivery_format'])) {
            $query->whereHas('detail', function (Builder $q) use ($filters) {
                $q->byDeliveryFormat($filters['delivery_format']);
            });
        }

        if (isset($filters['country'])) {
            $query->whereHas('detail', function (Builder $q) use ($filters) {
                $q->byCountry($filters['country']);
            });
        }

        if (isset($filters['needs_financial_support'])) {
            $query->whereHas('detail', function (Builder $q) use ($filters) {
                $q->needsFinancialSupport($filters['needs_financial_support']);
            });
        }

        if (isset($filters['subthemes'])) {
            $query->whereHas('subthemes', function (Builder $q) use ($filters) {
                $q->whereIn('name', (array)$filters['subthemes']);
            });
        }

        if (isset($filters['support_types'])) {
            $query->whereHas('supportTypes', function (Builder $q) use ($filters) {
                $q->whereIn('name', (array)$filters['support_types']);
            });
        }

        if (isset($filters['target_audiences'])) {
            $query->whereHas('targetAudiences', function (Builder $q) use ($filters) {
                $q->whereIn('name', (array)$filters['target_audiences']);
            });
        }

        // Filter by user ownership
        if (isset($filters['user_requests']) && $filters['user_requests']) {
            $query->where('user_id', $user->id);
        } else {
            // Public requests (exclude user's own)
            $query->where('user_id', '!=', $user->id);
        }

        return $query->orderBy('created_at', 'desc')->get();
    }

    /**
     * Get comprehensive analytics
     */
    public function getAnalytics(): array
    {
        return [
            'total_requests' => OCDRequest::count(),
            'requests_by_activity' => $this->getRequestsByActivity(),
            'requests_by_format' => $this->getRequestsByFormat(),
            'requests_by_country' => $this->getRequestsByCountry(),
            'popular_subthemes' => $this->getPopularSubthemes(),
            'popular_support_types' => $this->getPopularSupportTypes(),
            'financial_support_needs' => $this->getFinancialSupportNeeds(),
            'requests_by_status' => $this->getRequestsByStatus(),
            'monthly_trends' => $this->getMonthlyTrends(),
        ];
    }

    /**
     * Get requests grouped by activity type
     */
    private function getRequestsByActivity(): array
    {
        return RequestDetail::select('related_activity', DB::raw('count(*) as count'))
            ->groupBy('related_activity')
            ->orderBy('count', 'desc')
            ->get()
            ->pluck('count', 'related_activity')
            ->toArray();
    }

    /**
     * Get requests grouped by delivery format
     */
    private function getRequestsByFormat(): array
    {
        return RequestDetail::select('delivery_format', DB::raw('count(*) as count'))
            ->groupBy('delivery_format')
            ->orderBy('count', 'desc')
            ->get()
            ->pluck('count', 'delivery_format')
            ->toArray();
    }

    /**
     * Get requests grouped by country
     */
    private function getRequestsByCountry(): array
    {
        return RequestDetail::select('delivery_country', DB::raw('count(*) as count'))
            ->whereNotNull('delivery_country')
            ->groupBy('delivery_country')
            ->orderBy('count', 'desc')
            ->limit(10)
            ->get()
            ->pluck('count', 'delivery_country')
            ->toArray();
    }

    /**
     * Get popular subthemes
     */
    private function getPopularSubthemes(): array
    {
        return DB::table('request_subtheme')
            ->join('subthemes', 'request_subtheme.subtheme_id', '=', 'subthemes.id')
            ->select('subthemes.name', DB::raw('count(*) as count'))
            ->groupBy('subthemes.id', 'subthemes.name')
            ->orderBy('count', 'desc')
            ->limit(10)
            ->get()
            ->pluck('count', 'name')
            ->toArray();
    }

    /**
     * Get popular support types
     */
    private function getPopularSupportTypes(): array
    {
        return DB::table('request_support_type')
            ->join('support_types', 'request_support_type.support_type_id', '=', 'support_types.id')
            ->select('support_types.name', DB::raw('count(*) as count'))
            ->groupBy('support_types.id', 'support_types.name')
            ->orderBy('count', 'desc')
            ->limit(10)
            ->get()
            ->pluck('count', 'name')
            ->toArray();
    }

    /**
     * Get financial support needs
     */
    private function getFinancialSupportNeeds(): array
    {
        return RequestDetail::select('needs_financial_support', DB::raw('count(*) as count'))
            ->whereNotNull('needs_financial_support')
            ->groupBy('needs_financial_support')
            ->get()
            ->pluck('count', 'needs_financial_support')
            ->toArray();
    }

    /**
     * Get requests by status
     */
    private function getRequestsByStatus(): array
    {
        return OCDRequest::join('request_statuses', 'requests.status_id', '=', 'request_statuses.id')
            ->select('request_statuses.status_label', DB::raw('count(*) as count'))
            ->groupBy('request_statuses.id', 'request_statuses.status_label')
            ->get()
            ->pluck('count', 'status_label')
            ->toArray();
    }

    /**
     * Get monthly trends
     */
    private function getMonthlyTrends(): array
    {
        return OCDRequest::select(
            DB::raw('DATE_FORMAT(created_at, "%Y-%m") as month'),
            DB::raw('count(*) as count')
        )
            ->groupBy('month')
            ->orderBy('month', 'desc')
            ->limit(12)
            ->get()
            ->pluck('count', 'month')
            ->toArray();
    }

    /**
     * Get requests that need financial support
     */
    public function getRequestsNeedingFinancialSupport(): Collection
    {
        return OCDRequest::with(['detail', 'user', 'status'])
            ->whereHas('detail', function (Builder $q) {
                $q->needsFinancialSupport(true);
            })
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Get requests by specific subtheme
     */
    public function getRequestsBySubtheme(string $subthemeName): Collection
    {
        return OCDRequest::with(['detail', 'user', 'status'])
            ->whereHas('subthemes', function (Builder $q) use ($subthemeName) {
                $q->where('name', $subthemeName);
            })
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Get requests by country with full details
     */
    public function getRequestsByCountryWithDetails(string $country): Collection
    {
        return OCDRequest::with(['detail', 'user', 'status', 'subthemes', 'supportTypes'])
            ->whereHas('detail', function (Builder $q) use ($country) {
                $q->byCountry($country);
            })
            ->orderBy('created_at', 'desc')
            ->get();
    }
} 