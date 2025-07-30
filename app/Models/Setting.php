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

    /**
     * Settings that are file uploads
     */
    public const FILE_UPLOAD_SETTINGS = [
        self::LOGO,
        self::PORTAL_GUIDE,
        self::USER_GUIDE,
        self::PARTNER_GUIDE,
    ];

    /**
     * All valid setting paths
     */
    public const VALID_PATHS = [
        self::SITE_NAME,
        self::SITE_DESCRIPTION,
        self::LOGO,
        self::HOMEPAGE_YOUTUBE_VIDEO,
        self::PORTAL_GUIDE,
        self::USER_GUIDE,
        self::PARTNER_GUIDE,
    ];

    public $timestamps = true;

    /**
     * Check if a setting path is a file upload
     */
    public static function isFileUpload(string $path): bool
    {
        return in_array($path, self::FILE_UPLOAD_SETTINGS);
    }

    /**
     * Get file upload validation rules based on setting path
     */
    public static function getFileValidationRules(string $path): array
    {
        return match($path) {
            self::LOGO => [
                'nullable',
                'file',
                'image',
                'mimes:png,jpg,jpeg',
                'max:2048' // 2MB
            ],
            self::PORTAL_GUIDE, self::USER_GUIDE, self::PARTNER_GUIDE => [
                'nullable',
                'file',
                'mimes:pdf',
                'max:10240' // 10MB
            ],
            default => []
        };
    }

    /**
     * Get storage directory for file uploads based on setting path
     */
    public static function getStorageDirectory(string $path): string
    {
        return match($path) {
            self::LOGO => 'settings/images',
            self::PORTAL_GUIDE, self::USER_GUIDE, self::PARTNER_GUIDE => 'settings/guides',
            default => 'settings'
        };
    }
} 