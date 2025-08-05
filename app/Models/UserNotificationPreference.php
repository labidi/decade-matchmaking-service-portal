<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserNotificationPreference extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'attribute_type',
        'attribute_value',
        'notification_enabled',
        'email_notification_enabled',
    ];

    protected $casts = [
        'notification_enabled' => 'boolean',
        'email_notification_enabled' => 'boolean',
    ];

    /**
     * Available attribute types for notifications
     */
    public const ATTRIBUTE_TYPES = [
        'subtheme' => 'Subtheme',
        'coverage_activity' => 'Coverage Activity', 
        'implementation_location' => 'Implementation Location',
        'target_audience' => 'Target Audience',
        'support_type' => 'Support Type',
        'priority_level' => 'Priority Level',
        'funding_amount_range' => 'Funding Amount Range',
    ];

    /**
     * Get the user that owns the preference
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope to get active notification preferences
     */
    public function scopeWithNotificationsEnabled($query)
    {
        return $query->where('notification_enabled', true);
    }

    /**
     * Scope to get email notification preferences
     */
    public function scopeWithEmailNotificationsEnabled($query)
    {
        return $query->where('email_notification_enabled', true);
    }

    /**
     * Scope to filter by attribute type
     */
    public function scopeForAttributeType($query, string $attributeType)
    {
        return $query->where('attribute_type', $attributeType);
    }

    /**
     * Scope to filter by attribute value
     */
    public function scopeForAttributeValue($query, string $attributeValue)
    {
        return $query->where('attribute_value', $attributeValue);
    }

    /**
     * Scope to filter by specific attribute type and value
     */
    public function scopeForAttribute($query, string $attributeType, string $attributeValue)
    {
        return $query->where('attribute_type', $attributeType)
                    ->where('attribute_value', $attributeValue);
    }

    /**
     * Get display name for attribute type
     */
    public function getAttributeTypeDisplayName(): string
    {
        return self::ATTRIBUTE_TYPES[$this->attribute_type] ?? $this->attribute_type;
    }

    /**
     * Check if attribute type is valid
     */
    public static function isValidAttributeType(string $attributeType): bool
    {
        return array_key_exists($attributeType, self::ATTRIBUTE_TYPES);
    }
}