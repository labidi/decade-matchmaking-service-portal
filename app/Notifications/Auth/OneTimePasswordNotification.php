<?php

declare(strict_types=1);

namespace App\Notifications\Auth;

use Illuminate\Contracts\Queue\ShouldQueue;
use Spatie\OneTimePasswords\Notifications\OneTimePasswordNotification as SpatieOneTimePasswordNotification;

/**
 * Custom OTP notification that uses Mandrill for email delivery.
 *
 * Extends Spatie's base notification (required by the package) but overrides
 * the delivery channel to use our custom Mandrill channel instead of Laravel's mail.
 */
class OneTimePasswordNotification extends SpatieOneTimePasswordNotification implements ShouldQueue
{
    /**
     * Get the notification's delivery channels.
     *
     * @return array<string>
     */
    public function via(object $notifiable): array
    {
        return ['mandrill'];
    }

    /**
     * Get the Mandrill representation of the notification.
     *
     * @return array{template: string, variables: array<string, mixed>}
     */
    public function toMandrill(object $notifiable): array
    {
        return [
            'template' => 'auth.otp',
            'variables' => [
                'user_name' => $notifiable->name ?? 'User',
                'otp_code' => $this->oneTimePassword->password,
                'expires_in_minutes' => (int) config('one-time-passwords.default_expires_in_minutes', 10),
            ],
        ];
    }
}
