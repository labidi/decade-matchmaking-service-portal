<?php

declare(strict_types=1);

namespace App\Services;

use App\Notifications\System\SystemActivityNotification;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;

/**
 * Service for managing system notifications.
 *
 * Handles creation of notifications for administrators and users.
 */
class SystemNotificationService
{
    public function __construct(private readonly UserService $userService)
    {
    }

    /**
     * Create notifications for all administrators.
     *
     * @param string $title The notification title
     * @param string $description The notification description
     * @return void
     */
    public function notifyAdmins(string $title, string $description): void
    {
        try {
            Notification::send(
                $this->userService->getAllAdmins(),
                new SystemActivityNotification($title, $description)
            );
        } catch (\Exception $e) {
            Log::error('Failed to create admin notifications', [
                'title' => $title,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
        }
    }
}