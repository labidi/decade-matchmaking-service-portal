<?php

namespace App\Http\Controllers\Notifications;

use App\Http\Controllers\Controller;
use App\Models\NotificationPreference;
use App\Services\NotificationPreferenceService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DestroyController extends Controller
{
    public function __construct(
        private readonly NotificationPreferenceService $preferenceService
    ) {
    }

    public function __invoke(Request $request)
    {
        $request->validate([
            'id' => 'required|integer|exists:user_notification_preferences,id',
        ]);

        $user = Auth::user();
        $preference = NotificationPreference::where('id', $request->id)
            ->where('user_id', $user->id)
            ->firstOrFail();

        $this->preferenceService->deletePreference($preference);

        return redirect()->back()
            ->with('success', 'Notification preference removed successfully.');
    }
}
