<?php

namespace App\Http\Controllers\Notifications;

use App\Exceptions\NotificationPreferenceException;
use App\Http\Controllers\Controller;
use App\Models\NotificationPreference;
use App\Services\NotificationPreferenceService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class StoreController extends Controller
{
    public function __construct(
        private readonly NotificationPreferenceService $preferenceService
    ) {
    }

    /**
     * @throws NotificationPreferenceException
     */
    public function __invoke(Request $request)
    {
        $request->validate([
            'entity_type' => ['required', Rule::in(array_keys(NotificationPreference::ENTITY_TYPES))],
            'attribute_value' => 'required|string|max:255',
            'email_notification_enabled' => 'boolean',
        ]);

        $user = Auth::user();

        $this->preferenceService->createPreference($user, [
            'entity_type' => $request->entity_type,
            'attribute_value' => $request->attribute_value,
            'email_notification_enabled' => $request->boolean('email_notification_enabled', true)
        ]);

        return redirect()->back()
            ->with('success', 'Notification preference updated successfully.');
    }
}
