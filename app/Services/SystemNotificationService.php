<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\SystemNotification;
use App\Models\User;
use Illuminate\Support\Facades\Log;

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
            foreach ($this->userService->getAllAdmins() as $admin) {
                SystemNotification::create([
                    'user_id' => $admin->id,
                    'title' => $title,
                    'description' => $description,
                    'is_read' => false,
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Failed to create admin notifications', [
                'title' => $title,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
        }
    }
}