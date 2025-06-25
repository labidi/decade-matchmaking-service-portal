<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    public function index(): Response
    {
        $notifications = Auth::user()->notifications()->latest()->get();

        return Inertia::render('Admin/Notification/List', [
            'title' => 'Notifications',
            'notifications' => $notifications,
            'breadcrumbs' => [
                ['name' => 'Home', 'url' => route('user.home')],
                ['name' => 'Notifications'],
            ],
        ]);
    }

    public function show(Notification $notification): Response
    {
        $this->authorizeNotification($notification);

        return Inertia::render('Admin/Notification/Show', [
            'title' => $notification->title,
            'notification' => $notification,
            'breadcrumbs' => [
                ['name' => 'Home', 'url' => route('user.home')],
                ['name' => 'Notifications', 'url' => route('admin.notifications.index')],
                ['name' => $notification->title],
            ],
        ]);
    }

    public function markAsRead(Notification $notification)
    {
        $this->authorizeNotification($notification);
        $notification->update(['is_read' => true]);

        return redirect()->back();
    }

    private function authorizeNotification(Notification $notification): void
    {
        abort_unless($notification->user_id === Auth::id(), 403);
    }
}
