<?php

namespace App\Models\Request;

use Illuminate\Database\Eloquent\Model;

class RequestOffer extends Model
{
    protected $table = 'request_offers';
    protected $primaryKey = 'id';
    public $timestamps = true;
    protected $appends = ['status_label', 'can_edit'];

    protected $fillable = [
        'description',
        'status',
    ];
u
}
