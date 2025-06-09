<?php

namespace App\Models;

use App\Models\Request\RequestOffer;
use App\Models\Request\RequestStatus;
use App\Models\User;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;


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
            get: fn(?string $value) => json_decode($value),
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

    public function offer(): HasMany
    {
        return $this->hasMany(RequestOffer::class);
    }
}
