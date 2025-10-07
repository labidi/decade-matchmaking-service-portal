<?php

declare(strict_types=1);

namespace App\Listeners\Email;

use App\Events\Email\EmailSent;
use Illuminate\Support\Facades\Log;

class LogEmailSent
{
    /**
     * Handle the event.
     */
    public function handle(EmailSent $event): void
    {
        Log::channel('email')->info('Email sent successfully', [
            'log_id' => $event->emailLog->id,
            'event_name' => $event->emailLog->event_name,
            'recipient' => $event->emailLog->recipient_email,
            'mandrill_id' => $event->emailLog->mandrill_id,
        ]);
    }
}