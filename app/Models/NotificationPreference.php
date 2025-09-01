<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NotificationPreference extends Model
{
    use HasFactory;

    protected $table = 'user_notification_preferences';

    protected $fillable = [
        'user_id',
        'entity_type',
        'attribute_type',
        'attribute_value',
        'email_notification_enabled',
    ];

    protected $casts = [
        'email_notification_enabled' => 'boolean',
    ];

    /**
     * Entity type constants
     */
    public const ENTITY_TYPE_REQUEST = 'request';
    public const ENTITY_TYPE_OPPORTUNITY = 'opportunity';

    public const ENTITY_TYPES = [
        self::ENTITY_TYPE_REQUEST => 'Request',
        self::ENTITY_TYPE_OPPORTUNITY => 'Opportunity',
    ];

    /**
     * Attribute types available for requests
     */
    public const REQUEST_ATTRIBUTE_TYPES = [
        'subtheme' => 'Subtheme',
    ];

    /**
     * Attribute types available for opportunities
     */
    public const OPPORTUNITY_ATTRIBUTE_TYPES = [
        'type' => 'Opportunity Type',
    ];

    /**
     * All available attribute types (for backward compatibility)
     */
    public const ATTRIBUTE_TYPES = self::REQUEST_ATTRIBUTE_TYPES;

    /**
     * Get the user that owns the preference
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
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
     * Scope to filter by entity type
     */
    public function scopeForEntity($query, string $entityType)
    {
        return $query->where('entity_type', $entityType);
    }

    /**
     * Scope to filter for request preferences
     */
    public function scopeForRequests($query)
    {
        return $query->where('entity_type', self::ENTITY_TYPE_REQUEST);
    }

    /**
     * Scope to filter for opportunity preferences
     */
    public function scopeForOpportunities($query)
    {
        return $query->where('entity_type', self::ENTITY_TYPE_OPPORTUNITY);
    }

    /**
     * Get display name for attribute type
     */
    public function getAttributeTypeDisplayName(): string
    {
        return self::ATTRIBUTE_TYPES[$this->attribute_type] ?? $this->attribute_type;
    }

    /**
     * Get attribute types for a specific entity type
     */
    public static function getAttributeTypesForEntity(string $entityType): array
    {
        return match ($entityType) {
            self::ENTITY_TYPE_REQUEST => self::REQUEST_ATTRIBUTE_TYPES,
            self::ENTITY_TYPE_OPPORTUNITY => self::OPPORTUNITY_ATTRIBUTE_TYPES,
            default => []
        };
    }

    /**
     * Get display name for entity type
     */
    public function getEntityTypeDisplayName(): string
    {
        return self::ENTITY_TYPES[$this->entity_type] ?? $this->entity_type;
    }

    /**
     * Check if entity type is valid
     */
    public static function isValidEntityType(string $entityType): bool
    {
        return array_key_exists($entityType, self::ENTITY_TYPES);
    }

    /**
     * Check if attribute type is valid for a given entity type
     */
    public static function isValidAttributeTypeForEntity(string $attributeType, string $entityType): bool
    {
        $validTypes = self::getAttributeTypesForEntity($entityType);
        return array_key_exists($attributeType, $validTypes);
    }

    /**
     * Check if attribute type is valid (backward compatibility)
     */
    public static function isValidAttributeType(string $attributeType): bool
    {
        return array_key_exists($attributeType, self::ATTRIBUTE_TYPES);
    }
}
