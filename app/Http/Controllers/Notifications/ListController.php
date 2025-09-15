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

        return Inertia::render('NotificationPreferences/List', [
            'preferences' => $preferences,
            'availableOptions' => $availableOptions,
            'entityTypes' => NotificationPreference::ENTITY_TYPES,
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
        $options[NotificationPreference::ENTITY_TYPE_OPPORTUNITY]['type'] = Type::getOptions();
        if ($user->hasRole('partner')) {
            $options[NotificationPreference::ENTITY_TYPE_REQUEST]['subtheme'] = SubTheme::getOptions();
        }

        return $options;
    }

    /**
     * Get available options for a specific entity type (API endpoint)
     */
    public function availableOptions(Request $request)
    {
        $request->validate([
            'entity_type' => ['required', Rule::in(array_keys(NotificationPreference::ENTITY_TYPES))],
        ]);

        $entityType = $request->get('entity_type');
        $availableOptions = $this->getAvailableOptions($request->user());

        return response()->json([
            'entity_type' => $entityType,
            'attribute_types' => NotificationPreference::getAttributeTypesForEntity($entityType),
            'options' => $availableOptions[$entityType] ?? [],
        ]);
    }
}
