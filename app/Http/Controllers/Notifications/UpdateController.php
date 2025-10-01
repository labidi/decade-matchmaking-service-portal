<?php

declare(strict_types=1);

namespace App\Http\Controllers\Notifications;

use App\Http\Controllers\Controller;
use App\Models\NotificationPreference;
use App\Services\NotificationPreferenceService;
use Illuminate\Http\RedirectResponse;

class UpdateController extends Controller
{
    public function __construct(
        private readonly NotificationPreferenceService $preferenceService
    ) {
    }

    /**
     * Toggle email notification for a preference
     *
     * @param  NotificationPreference  $preference  Route model binding
     * @return RedirectResponse
     *
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    public function __invoke(NotificationPreference $preference): RedirectResponse
    {
//        $this->authorize('update', $preference);

        $this->preferenceService->toggleEmailNotification($preference);

        return redirect()->back()
            ->with('success', 'Email notification status updated successfully.');
    }
}
