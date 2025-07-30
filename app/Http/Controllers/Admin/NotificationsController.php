<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class NotificationsController extends Controller
{
    public function index(Request $request): Response
    {
        $sortField = $request->get('sort', 'created_at');
        $sortOrder = $request->get('order', 'desc');
        // Validate sort order
        $sortOrder = in_array(strtolower($sortOrder), ['asc', 'desc']) ? strtolower($sortOrder) : 'desc';

        $notifications = Auth::user()->notifications()
            ->orderBy($sortField, $sortOrder)->paginate(10)->appends($request->only(['sort', 'order']));

        return Inertia::render('Admin/Notification/List', [
            'title' => 'Notifications',
            'notifications' => $notifications,
            'currentSort' => [
                'field' => $sortField,
                'order' => $sortOrder,
            ],
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

        return to_route('admin.notifications.index')->with('success', 'Notification marked as read.');
    }

    private function authorizeNotification(Notification $notification): void
    {
        abort_unless($notification->user_id === Auth::id(), 403);
    }
}
