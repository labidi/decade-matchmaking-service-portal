<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\Request\RequestStatus;
use Illuminate\Database\Eloquent\Casts\Attribute;


class Request extends Model
{
    protected $table = 'requests';
    protected $primaryKey = 'id';

    protected $fillable = [
        'request_data',
        'status_id',
        'user_id',
        'matched_partner_id'
    ];
    
    protected $hidden = ['updated_at'];

    protected function requestData(): Attribute
    {
        return Attribute::make(
            get: fn (string $value) => json_decode($value),
        );
    }
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
