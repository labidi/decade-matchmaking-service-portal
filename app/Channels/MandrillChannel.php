<?php

declare(strict_types=1);

namespace App\Channels;

use App\Jobs\Email\SendTransactionalEmail;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Log;

/**
 * Custom notification channel for sending emails via Mandrill.
 *
 * This channel dispatches emails using the SendTransactionalEmail job,
 * which integrates with our Mandrill transactional email system.
 *
 * Usage in notifications:
 *
 * public function via(object $notifiable): array
 * {
 *     return ['mandrill'];
 * }
 *
 * public function toMandrill(object $notifiable): array
 * {
 *     return [
 *         'template' => 'template.name',
 *         'variables' => ['key' => 'value'],
 *     ];
 * }
 */
class MandrillChannel
{
    /**
     * Send the given notification via Mandrill.
     */
    public function send(object $notifiable, Notification $notification): void
    {
        if (!method_exists($notification, 'toMandrill')) {
            Log::debug('MandrillChannel: Notification does not have toMandrill method', [
                'notification' => get_class($notification),
            ]);

            return;
        }

        $data = $notification->toMandrill($notifiable);

        if (!isset($data['template'])) {
            Log::warning('MandrillChannel: No template specified in notification data', [
                'notification' => get_class($notification),
            ]);

            return;
        }

        $notifiableEmail = $notifiable->email ?? 'unknown';
        $notifiableId = $notifiable->id ?? null;

        Log::info('MandrillChannel: Dispatching email', [
            'template' => $data['template'],
            'notifiable_id' => $notifiableId,
            'notifiable_email' => $notifiableEmail,
            'notification' => get_class($notification),
        ]);

        SendTransactionalEmail::dispatch(
            $data['template'],
            $notifiable,
            $data['variables'] ?? [],
            ['queue'=>'otp-mail']
        );

        Log::info('MandrillChannel: Email dispatched successfully', [
            'template' => $data['template'],
            'notifiable_id' => $notifiableId,
        ]);
    }
}
