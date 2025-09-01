<?php

namespace App\Http\Controllers\Notifications;

use App\Enums\Request\SubTheme;
use App\Http\Controllers\Controller;
use App\Http\Resources\NotificationPreferenceResource;
use App\Models\UserNotificationPreference;
use App\Services\NotificationService;
use App\Services\NotificationPreference\NotificationPreferenceService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class ListController extends Controller
{
    public function __construct(
        private readonly NotificationService $notificationService,
        private readonly NotificationPreferenceService $preferenceService
    ) {
    }

    /**
     * Display user's notification preferences with pagination support
     */
    public function list(Request $request)
    {
        $request->validate([
            'page' => 'integer|min:1',
            'per_page' => 'integer|min:1|max:100',
            'entity_type' => ['nullable', Rule::in(array_keys(UserNotificationPreference::ENTITY_TYPES))],
            'search' => 'nullable|string|max:255',
            'sort_by' => 'nullable|string|in:attribute_type,attribute_value,entity_type,updated_at',
            'sort_direction' => 'nullable|string|in:asc,desc',
        ]);

        $user = Auth::user();

        // Prepare filters
        $searchFilters = array_filter([
            'search' => $request->get('search'),
        ]);

        $sortFilters = array_filter([
            'sort_by' => $request->get('sort_by', 'updated_at'),
            'sort_direction' => $request->get('sort_direction', 'desc'),
            'per_page' => $request->get('per_page', 15),
        ]);

        // Get paginated preferences
        $preferences = $this->preferenceService->getUserPreferencesPaginated(
            $user,
            $request->get('entity_type'),
            $searchFilters,
            $sortFilters
        );

        // Transform to resource collection
        $preferences->getCollection()->transform(function ($preference) {
            return new NotificationPreferenceResource($preference);
        });

        // Get available options for each entity type
        $availableOptions = $this->getAvailableOptions();

        return Inertia::render('NotificationPreferences/List', [
            'preferences' => $preferences,
            'availableOptions' => $availableOptions,
            'entityTypes' => UserNotificationPreference::ENTITY_TYPES,
            'attributeTypes' => UserNotificationPreference::ATTRIBUTE_TYPES, // Backward compatibility
            'currentFilters' => [
                'entity_type' => $request->get('entity_type'),
                'search' => $request->get('search'),
                'sort_by' => $request->get('sort_by', 'updated_at'),
                'sort_direction' => $request->get('sort_direction', 'desc'),
            ],
            'currentSort' => [
                'field' => $request->get('sort_by', 'updated_at'),
                'order' => $request->get('sort_direction', 'desc'),
            ],
            'title' => 'Notification Preferences',
            'banner' => [
                'title' => 'Notification Preferences',
                'description' => 'Manage your notification preferences for requests and opportunities.',
                'image' => '/assets/img/sidebar.png',
            ],
        ]);
    }

    /**
     * Update or create a notification preference
     */
    public function store(Request $request)
    {
        $request->validate([
            'entity_type' => ['required', Rule::in(array_keys(UserNotificationPreference::ENTITY_TYPES))],
            'attribute_type' => [
                'required',
                'string',
                function ($attribute, $value, $fail) use ($request) {
                    $entityType = $request->get('entity_type');
                    if (!UserNotificationPreference::isValidAttributeTypeForEntity($value, $entityType)) {
                        $fail("The {$attribute} is not valid for the selected entity type.");
                    }
                }
            ],
            'attribute_value' => 'required|string|max:255',
            'email_notification_enabled' => 'boolean',
        ]);

        $user = Auth::user();

        $preference = $this->preferenceService->updateUserPreference(
            $user,
            $request->entity_type,
            $request->attribute_type,
            $request->attribute_value,
            $request->boolean('email_notification_enabled', false)
        );

        return redirect()->back()
            ->with('success', 'Notification preference updated successfully.');
    }

    /**
     * Update existing preference
     */
    public function update(Request $request, UserNotificationPreference $preference)
    {
        // Ensure user can only update their own preferences
        if ($preference->user_id !== Auth::id()) {
            abort(403, 'Unauthorized');
        }

        $request->validate([
            'email_notification_enabled' => 'boolean',
        ]);

        $preference->update([
            'email_notification_enabled' => $request->boolean('email_notification_enabled'),
        ]);

        return redirect()->back()
            ->with('success', 'Notification preference updated successfully.');
    }

    /**
     * Remove a notification preference
     */
    public function destroy(Request $request)
    {
        $request->validate([
            'entity_type' => ['required', Rule::in(array_keys(UserNotificationPreference::ENTITY_TYPES))],
            'attribute_type' => 'required|string',
            'attribute_value' => 'required|string',
        ]);

        $user = Auth::user();

        $removed = $this->preferenceService->removeUserPreference(
            $user,
            $request->entity_type,
            $request->attribute_type,
            $request->attribute_value
        );

        if ($removed) {
            return redirect()->back()
                ->with('success', 'Notification preference removed successfully.');
        }

        return redirect()->back()
            ->with('error', 'Notification preference not found.');
    }

    /**
     * Get available options for each entity type and attribute type
     */
    private function getAvailableOptions(): array
    {
        return [
            UserNotificationPreference::ENTITY_TYPE_REQUEST => [
                'subtheme' => $this->getSubthemeOptions(),
                'coverage_activity' => $this->getCoverageActivityOptions(),
                'implementation_location' => $this->getImplementationLocationOptions(),
                'target_audience' => $this->getTargetAudienceOptions(),
                'support_type' => $this->getSupportTypeOptions(),
                'priority_level' => $this->getPriorityLevelOptions(),
                'funding_amount_range' => $this->getFundingAmountRangeOptions(),
            ],
            UserNotificationPreference::ENTITY_TYPE_OPPORTUNITY => [
                'type' => $this->getOpportunityTypeOptions(),
                'coverage_activity' => $this->getCoverageActivityOptions(),
                'implementation_location' => $this->getImplementationLocationOptions(),
                'target_audience' => $this->getTargetAudienceOptions(),
                'key_words' => $this->getKeyWordsOptions(),
            ],
        ];
    }

    /**
     * Get subtheme options
     */
    private function getSubthemeOptions(): array
    {
        return SubTheme::getOptions();
    }

    /**
     * Get coverage activity options
     */
    private function getCoverageActivityOptions(): array
    {
        return [
            ['value' => 'Research', 'label' => 'Research'],
            ['value' => 'Capacity Building', 'label' => 'Capacity Building'],
            ['value' => 'Technology Transfer', 'label' => 'Technology Transfer'],
            ['value' => 'Policy Development', 'label' => 'Policy Development'],
            ['value' => 'Education & Outreach', 'label' => 'Education & Outreach'],
        ];
    }

    /**
     * Get implementation location options
     */
    private function getImplementationLocationOptions(): array
    {
        return [
            ['value' => 'Global', 'label' => 'Global'],
            ['value' => 'Africa', 'label' => 'Africa'],
            ['value' => 'Asia', 'label' => 'Asia'],
            ['value' => 'Europe', 'label' => 'Europe'],
            ['value' => 'North America', 'label' => 'North America'],
            ['value' => 'South America', 'label' => 'South America'],
            ['value' => 'Oceania', 'label' => 'Oceania'],
            ['value' => 'Small Island Developing States', 'label' => 'Small Island Developing States'],
            ['value' => 'Least Developed Countries', 'label' => 'Least Developed Countries'],
        ];
    }

    /**
     * Get target audience options
     */
    private function getTargetAudienceOptions(): array
    {
        return [
            ['value' => 'Early Career Researchers', 'label' => 'Early Career Researchers'],
            ['value' => 'Senior Researchers', 'label' => 'Senior Researchers'],
            ['value' => 'Government Officials', 'label' => 'Government Officials'],
            ['value' => 'NGO Representatives', 'label' => 'NGO Representatives'],
            ['value' => 'Private Sector', 'label' => 'Private Sector'],
            ['value' => 'Students', 'label' => 'Students'],
            ['value' => 'Indigenous Communities', 'label' => 'Indigenous Communities'],
            ['value' => 'Local Communities', 'label' => 'Local Communities'],
        ];
    }

    /**
     * Get support type options
     */
    private function getSupportTypeOptions(): array
    {
        return [
            ['value' => 'Training', 'label' => 'Training'],
            ['value' => 'Mentoring', 'label' => 'Mentoring'],
            ['value' => 'Funding', 'label' => 'Funding'],
            ['value' => 'Equipment', 'label' => 'Equipment'],
            ['value' => 'Technical Assistance', 'label' => 'Technical Assistance'],
            ['value' => 'Networking', 'label' => 'Networking'],
            ['value' => 'Data Sharing', 'label' => 'Data Sharing'],
        ];
    }

    /**
     * Get priority level options
     */
    private function getPriorityLevelOptions(): array
    {
        return [
            ['value' => 'High', 'label' => 'High'],
            ['value' => 'Medium', 'label' => 'Medium'],
            ['value' => 'Low', 'label' => 'Low'],
        ];
    }

    /**
     * Get funding amount range options
     */
    private function getFundingAmountRangeOptions(): array
    {
        return [
            ['value' => 'Under $10K', 'label' => 'Under $10K'],
            ['value' => '$10K - $50K', 'label' => '$10K - $50K'],
            ['value' => '$50K - $100K', 'label' => '$50K - $100K'],
            ['value' => '$100K - $500K', 'label' => '$100K - $500K'],
            ['value' => 'Over $500K', 'label' => 'Over $500K'],
        ];
    }

    /**
     * Get opportunity type options
     */
    private function getOpportunityTypeOptions(): array
    {
        return [
            ['value' => 'Fellowship', 'label' => 'Fellowship'],
            ['value' => 'Grant', 'label' => 'Grant'],
            ['value' => 'Scholarship', 'label' => 'Scholarship'],
            ['value' => 'Training Program', 'label' => 'Training Program'],
            ['value' => 'Workshop', 'label' => 'Workshop'],
            ['value' => 'Conference', 'label' => 'Conference'],
            ['value' => 'Research Collaboration', 'label' => 'Research Collaboration'],
            ['value' => 'Mentorship', 'label' => 'Mentorship'],
            ['value' => 'Exchange Program', 'label' => 'Exchange Program'],
        ];
    }

    /**
     * Get key words options (common research keywords)
     */
    private function getKeyWordsOptions(): array
    {
        return [
            ['value' => 'Marine Biology', 'label' => 'Marine Biology'],
            ['value' => 'Ocean Science', 'label' => 'Ocean Science'],
            ['value' => 'Climate Change', 'label' => 'Climate Change'],
            ['value' => 'Biodiversity', 'label' => 'Biodiversity'],
            ['value' => 'Conservation', 'label' => 'Conservation'],
            ['value' => 'Sustainability', 'label' => 'Sustainability'],
            ['value' => 'Fisheries', 'label' => 'Fisheries'],
            ['value' => 'Coral Reefs', 'label' => 'Coral Reefs'],
            ['value' => 'Deep Sea', 'label' => 'Deep Sea'],
            ['value' => 'Coastal Management', 'label' => 'Coastal Management'],
        ];
    }

    /**
     * Get available options for a specific entity type (API endpoint)
     */
    public function availableOptions(Request $request)
    {
        $request->validate([
            'entity_type' => ['required', Rule::in(array_keys(UserNotificationPreference::ENTITY_TYPES))],
        ]);

        $entityType = $request->get('entity_type');
        $availableOptions = $this->getAvailableOptions();

        return response()->json([
            'entity_type' => $entityType,
            'attribute_types' => UserNotificationPreference::getAttributeTypesForEntity($entityType),
            'options' => $availableOptions[$entityType] ?? [],
        ]);
    }
}
