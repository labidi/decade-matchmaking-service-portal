<?php

namespace App\Http\Controllers\Notifications;

use App\Http\Controllers\Controller;
use App\Models\NotificationPreference;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UpdateController extends Controller
{
    public function __invoke(Request $request, NotificationPreference $preference)
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
}
