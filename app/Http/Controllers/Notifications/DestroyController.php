<?php

declare(strict_types=1);

namespace App\Http\Controllers\Notifications;

use App\Http\Controllers\Controller;
use App\Models\NotificationPreference;
use App\Services\NotificationPreferenceService;
use Illuminate\Http\RedirectResponse;

class DestroyController extends Controller
{
    public function __construct(
        private readonly NotificationPreferenceService $preferenceService
    ) {
    }

    /**
     * Delete a notification preference
     *
     * @param  NotificationPreference  $preference  Route model binding
     * @return RedirectResponse
     *
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    public function __invoke(NotificationPreference $preference): RedirectResponse
    {
//        $this->authorize('delete', $preference);

        $this->preferenceService->deletePreference($preference);

        return redirect()->back()
            ->with('success', 'Notification preference removed successfully.');
    }
}
