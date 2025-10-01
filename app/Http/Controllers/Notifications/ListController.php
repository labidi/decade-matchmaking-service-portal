<?php

namespace App\Http\Controllers\Notifications;

use App\Enums\Opportunity\Type;
use App\Enums\Request\SubTheme;
use App\Http\Controllers\Controller;
use App\Models\NotificationPreference;
use App\Models\User;
use App\Services\NotificationPreferenceService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class ListController extends Controller
{
    public function __construct(
        private readonly NotificationPreferenceService $preferenceService
    ) {}

    /**
     * Display user's notification preferences with pagination support
     *
     * @throws \Throwable
     */
    public function list(Request $request)
    {
        $request->validate([
            'page' => 'integer|min:1',
            'per_page' => 'integer|min:1|max:100',
            'entity_type' => ['nullable', Rule::in(array_keys(NotificationPreference::ENTITY_TYPES))],
            'search' => 'nullable|string|max:255',
            'sort_by' => 'nullable|string|in:attribute_type,attribute_value,entity_type,updated_at',
            'sort_direction' => 'nullable|string|in:asc,desc',
        ]);

        $user = Auth::user();

        // Get paginated preferences
        $preferences = $this->preferenceService->getUserPreferences($user);

        // Get available options for each entity type
        $availableOptions = $this->getAvailableOptions($user);

        // Filter entity types based on user role
        $entityTypes = $this->getFilteredEntityTypes($user);

        return Inertia::render('NotificationPreferences/List', [
            'preferences' => $preferences,
            'availableOptions' => $availableOptions,
            'entityTypes' => $entityTypes,
            'attributeTypes' => NotificationPreference::ATTRIBUTE_TYPES, // Backward compatibility
            'title' => 'Notification Preferences',
            'banner' => [
                'title' => 'Notification Preferences',
                'description' => 'Manage your notification preferences for requests and opportunities.',
                'image' => '/assets/img/sidebar.png',
            ],
        ]);
    }

    /**
     * Get available options for each entity type and attribute type
     */
    private function getAvailableOptions(User $user): array
    {
        if ($user->hasRole('partner')) {
            $options[NotificationPreference::ENTITY_TYPE_REQUEST]['subtheme'] = SubTheme::getOptions();
        }
        $options[NotificationPreference::ENTITY_TYPE_OPPORTUNITY]['type'] = Type::getOptions();

        return $options;
    }

    /**
     * Get entity types available for a specific user based on their roles
     */
    private function getFilteredEntityTypes(User $user): array
    {
        $entityTypes = [];

        // Request entity type is available to all authenticated users
        if ($user->hasRole('partner')) {
            $entityTypes[NotificationPreference::ENTITY_TYPE_REQUEST] =
                NotificationPreference::ENTITY_TYPES[NotificationPreference::ENTITY_TYPE_REQUEST];
        }
        // Opportunity entity type is only available to partners

        $entityTypes[NotificationPreference::ENTITY_TYPE_OPPORTUNITY] =
            NotificationPreference::ENTITY_TYPES[NotificationPreference::ENTITY_TYPE_OPPORTUNITY];

        return $entityTypes;
    }

    /**
     * Get available options for a specific entity type (API endpoint)
     */
    public function availableOptions(Request $request)
    {
        $user = $request->user();
        $filteredEntityTypes = $this->getFilteredEntityTypes($user);

        $request->validate([
            'entity_type' => ['required', Rule::in(array_keys($filteredEntityTypes))],
        ]);

        $entityType = $request->get('entity_type');
        $availableOptions = $this->getAvailableOptions($user);

        return response()->json([
            'entity_type' => $entityType,
            'attribute_types' => NotificationPreference::getAttributeTypesForEntity($entityType),
            'options' => $availableOptions[$entityType] ?? [],
        ]);
    }
}
