<?php

declare(strict_types=1);

namespace App\Events\Email;

use App\Models\EmailLog;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class EmailDelivered
{
    use Dispatchable;
    use InteractsWithSockets;
    use SerializesModels;

    public function __construct(
        public readonly EmailLog $emailLog
    ) {
    }
}