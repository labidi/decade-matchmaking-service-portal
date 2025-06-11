<?php

namespace App\Models\Request;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use App\Models\Document ;

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

    public function documents(): MorphMany
    {
        return $this->morphMany(Document::class, 'parent');
    }
}
