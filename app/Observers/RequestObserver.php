<?php

namespace App\Observers;

use App\Models\Request;
use App\Models\Notification;

class RequestObserver
{
    /**
     * Handle the Request "created" event.
     */
    public function created(Request $request): void
    {
        Notification::create([
            'user_id' => 3,
            'title' => 'New Request Submitted',
            'description' => 'A new request has been submitted: ' . ($request->capacity_development_title ?? $request->id),
            'is_read' => false,
        ]);
    }
}
