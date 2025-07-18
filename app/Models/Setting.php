<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    // Example setting path constants
    public const SITE_NAME = 'site.name';
    public const SUPPORT_EMAIL = 'support.email';

    public $timestamps = true;
} 