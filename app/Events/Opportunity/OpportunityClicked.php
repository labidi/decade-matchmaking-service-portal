<?php

declare(strict_types=1);

namespace App\Events\Opportunity;

use App\Models\Opportunity;
use App\Models\User;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class OpportunityClicked
{
    use Dispatchable;
    use SerializesModels;

    public function __construct(
        public readonly Opportunity $opportunity,
        public readonly ?User $user,
        public readonly string $ip,
        public readonly string $userAgent,
        public readonly ?string $referer,
    ) {}
}
