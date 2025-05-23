<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use App\Models\Request\RequestStatus;

class Request extends Model
{

    protected $fillable = [
        'request_data',
        'status_id',
        'user_id',
        'matched_partner_id'
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function MatchedPartner(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function status(): belongsTo
    {
        return $this->belongsTo(RequestStatus::class);
    }
}
