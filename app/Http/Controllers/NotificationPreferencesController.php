<?php

namespace App\Http\Controllers;

use App\Enums\Request\SubTheme;
use App\Models\UserNotificationPreference;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class NotificationPreferencesController extends Controller
{
    public function __construct(
        private readonly NotificationService $notificationService
    ) {
    }

    /**
     * Display user's notification preferences
     */
    public function index()
    {
        $user = Auth::user();
        $preferences = $this->notificationService->getUserPreferences($user);

        // Get available options for each attribute type
        $availableOptions = $this->getAvailableOptions();

        return Inertia::render('User/NotificationPreferences', [
            'preferences' => $preferences,
            'availableOptions' => $availableOptions,
            'attributeTypes' => UserNotificationPreference::ATTRIBUTE_TYPES,
            'title' => 'Test',
            'banner' => [
                'title' => 'Test',
                'description' => 'Edit my notifications preferences details here.',
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
            'attribute_type' => 'required|string|in:' . implode(',', array_keys(UserNotificationPreference::ATTRIBUTE_TYPES)),
            'attribute_value' => 'required|string|max:255',
            'notification_enabled' => 'boolean',
            'email_notification_enabled' => 'boolean',
        ]);

        $user = Auth::user();

        $preference = $this->notificationService->updateUserPreference(
            $user,
            $request->attribute_type,
            $request->attribute_value,
            $request->boolean('notification_enabled', true),
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
            'notification_enabled' => 'boolean',
            'email_notification_enabled' => 'boolean',
        ]);

        $preference->update([
            'notification_enabled' => $request->boolean('notification_enabled'),
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
            'attribute_type' => 'required|string',
            'attribute_value' => 'required|string',
        ]);

        $user = Auth::user();

        $removed = $this->notificationService->removeUserPreference(
            $user,
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
     * Get available options for each attribute type
     */
    private function getAvailableOptions(): array
    {
        return [
            'subtheme' => $this->getSubthemeOptions(),
            'coverage_activity' => $this->getCoverageActivityOptions(),
            'implementation_location' => $this->getImplementationLocationOptions(),
            'target_audience' => $this->getTargetAudienceOptions(),
            'support_type' => $this->getSupportTypeOptions(),
            'priority_level' => $this->getPriorityLevelOptions(),
            'funding_amount_range' => $this->getFundingAmountRangeOptions(),
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
}
