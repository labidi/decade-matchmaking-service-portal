<?php

namespace App\Services;

use App\Http\Resources\NotificationPreferenceResource;
use App\Models\User;
use App\Models\NotificationPreference;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class NotificationPreferenceService
{
    /**
     * Get paginated preferences for a user
     */
    public function getUserPreferences(User $user, int $perPage = 15): LengthAwarePaginator
    {
        $preferences = NotificationPreference::where('user_id', $user->id)
            ->orderBy('updated_at', 'desc')
            ->paginate($perPage);
            
        $preferences->toResourceCollection(NotificationPreferenceResource::class);
        
        return $preferences;
    }

    /**
     * Create a new preference
     */
    public function createPreference(User $user, array $data): NotificationPreference
    {
        // Auto-set attribute_type based on entity_type
        $data['user_id'] = $user->id;
        $data['attribute_type'] = $this->getAttributeTypeForEntity($data['entity_type']);
        
        return NotificationPreference::create($data);
    }

    /**
     * Update a preference
     */
    public function updatePreference(NotificationPreference $preference, array $data): bool
    {
        return $preference->update($data);
    }

    /**
     * Delete a preference
     */
    public function deletePreference(NotificationPreference $preference): bool
    {
        return $preference->delete();
    }

    /**
     * Toggle email notification for a preference
     */
    public function toggleEmailNotification(NotificationPreference $preference): NotificationPreference
    {
        $preference->update([
            'email_notification_enabled' => !$preference->email_notification_enabled
        ]);
        
        return $preference->fresh();
    }

    /**
     * Get users with specific notification preferences
     */
    public function getUsersWithEmailNotificationsFor(string $entityType, string $attributeValue): \Illuminate\Database\Eloquent\Collection
    {
        return User::whereHas('notificationPreferences', function ($query) use ($entityType, $attributeValue) {
            $query->where('entity_type', $entityType)
                  ->where('attribute_value', $attributeValue)
                  ->where('email_notification_enabled', true);
        })->get();
    }

    /**
     * Get attribute type for entity type (auto-mapping)
     */
    private function getAttributeTypeForEntity(string $entityType): string
    {
        return match ($entityType) {
            NotificationPreference::ENTITY_TYPE_REQUEST => 'subtheme',
            NotificationPreference::ENTITY_TYPE_OPPORTUNITY => 'type',
            default => throw new \InvalidArgumentException("Invalid entity type: {$entityType}")
        };
    }
}