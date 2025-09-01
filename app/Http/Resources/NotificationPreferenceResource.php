<?php

namespace App\Http\Resources;

use App\Models\UserNotificationPreference;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NotificationPreferenceResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'user' => $this->whenLoaded('user'),
            'entity_type' => $this->entity_type,
            'entity_type_display' => $this->getEntityTypeDisplayName(),
            'attribute_type' => $this->attribute_type,
            'attribute_type_display' => $this->getAttributeTypeDisplayName(),
            'attribute_value' => $this->attribute_value,
            'email_notification_enabled' => $this->email_notification_enabled,
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
            'formatted_date' => $this->created_at->format('M j, Y'),
            'can_edit' => $this->canEdit($request->user()),
            'can_delete' => $this->canDelete($request->user()),
        ];
    }

    /**
     * Check if user can edit this preference
     */
    private function canEdit($user): bool
    {
        if (!$user) {
            return false;
        }

        // Users can edit their own preferences
        // Admins can edit any preferences
        return $user->id === $this->user_id || $user->is_admin;
    }

    /**
     * Check if user can delete this preference
     */
    private function canDelete($user): bool
    {
        if (!$user) {
            return false;
        }

        // Users can delete their own preferences
        // Admins can delete any preferences
        return $user->id === $this->user_id || $user->is_admin;
    }

    /**
     * Additional data when collection
     */
    public static function collection($resource)
    {
        return tap(parent::collection($resource), function ($collection) {
            $collection->with([
                'meta' => [
                    'entity_types' => UserNotificationPreference::ENTITY_TYPES,
                    'attribute_types' => [
                        'request' => UserNotificationPreference::REQUEST_ATTRIBUTE_TYPES,
                        'opportunity' => UserNotificationPreference::OPPORTUNITY_ATTRIBUTE_TYPES,
                    ],
                ],
            ]);
        });
    }
}
