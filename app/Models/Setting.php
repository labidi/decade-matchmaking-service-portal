<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    /**
     * Setting path constants (used as the 'path' column in the settings table)
     */
    public const SITE_NAME = 'site_name';
    public const SITE_DESCRIPTION = 'site_description';
    public const LOGO = 'logo';
    public const HOMEPAGE_YOUTUBE_VIDEO = 'homepage_youtube_video';
    public const PORTAL_GUIDE = 'portal_guide';
    public const USER_GUIDE = 'user_guide';
    public const PARTNER_GUIDE = 'partner_guide';

    public $timestamps = true;
} 