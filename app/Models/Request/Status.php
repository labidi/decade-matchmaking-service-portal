<?php

namespace App\Models\Request;

use Illuminate\Database\Eloquent\Model;

class Status extends Model
{
    protected $table = 'request_statuses';
    protected $fillable = [
        'status_label',
        'status_code'
    ];

    public static function getDraftStatus()
    {
        return static::where('status_code', 'draft')->first();
    }

    public static function getUnderReviewStatus()
    {
        return static::where('status_code', 'under_review')->first();
    }

}
