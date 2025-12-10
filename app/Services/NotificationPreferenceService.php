<?php

declare(strict_types=1);

namespace App\Services;

use App\Exceptions\NotificationPreferenceException;
use App\Http\Resources\NotificationPreferenceResource;
use App\Models\NotificationPreference;
use App\Models\RequestSubscription;
use App\Models\User;
use Exception;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class NotificationPreferenceService
{
    /**
     * @throws NotificationPreferenceException
     */
    public function getUserPreferences(User $user, int $perPage = 15): LengthAwarePaginator
    {
        try {
            $preferences = NotificationPreference::where('user_id', $user->getAttribute('id'))
                ->orderBy('updated_at', 'desc')
                ->paginate($perPage);

            $preferences->toResourceCollection(NotificationPreferenceResource::class);
            return $preferences;
        } catch (Exception|\Throwable $e) {
            Log::error('Failed to fetch notification preferences', [
                'user_id' => $user->getAttribute('id'),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw NotificationPreferenceException::databaseOperationFailed(
                'fetch',
                $e->getMessage()
            );
        }
    }

    public function createPreference(User $user, array $data): NotificationPreference
    {
        DB::beginTransaction();

        try {
            $entityType = $data['entity_type'] ?? null;
            // Auto-set attribute_type based on entity_type
            $attributeType = $this->getAttributeTypeForEntity($entityType);
            $attributeValue = $data['attribute_value'] ?? null;
            // Check for duplicate preference
            $existingPreference = NotificationPreference::where('user_id', $user->getAttribute('id'))
                ->where('entity_type', $entityType)
                ->where('attribute_value', $attributeValue)
                ->first();

            if ($existingPreference) {
                throw NotificationPreferenceException::duplicatePreference();
            }
            // Prepare preference data with defaults
            $preferenceData = [
                'user_id' => $user->getAttribute('id'),
                'entity_type' => $entityType,
                'attribute_type' => $attributeType,
                'attribute_value' => $attributeValue,
                'email_notification_enabled' => true, // Always enabled
            ];
            $preference = NotificationPreference::create($preferenceData);
            DB::commit();

            return $preference;
        } catch (Exception|NotificationPreferenceException|ValidationException $e) {
            DB::rollBack();

            Log::error('Unexpected error creating notification preference', [
                'user_id' => $user->getAttribute('id'),
                'data' => $data,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }

    public function toggleEmailNotification(NotificationPreference $preference): NotificationPreference
    {
        DB::beginTransaction();

        try {
            $currentStatus = $preference->getAttribute('email_notification_enabled');
            $newStatus = ! $currentStatus;

            Log::info('Toggling email notification status', [
                'preference_id' => $preference->getAttribute('id'),
                'user_id' => $preference->getAttribute('user_id'),
                'from' => $currentStatus,
                'to' => $newStatus,
            ]);

            $preference->update(['email_notification_enabled' => $newStatus]);

            DB::commit();

            Log::info('Successfully toggled email notification status', [
                'preference_id' => $preference->getAttribute('id'),
                'user_id' => $preference->getAttribute('user_id'),
                'new_status' => $newStatus,
            ]);

            return $preference->fresh();
        } catch (Exception $e) {
            DB::rollBack();

            Log::error('Failed to toggle email notification status', [
                'preference_id' => $preference->getAttribute('id'),
                'user_id' => $preference->getAttribute('user_id'),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw NotificationPreferenceException::databaseOperationFailed(
                'toggle email notification',
                $e->getMessage()
            );
        }
    }

    public function deletePreference(NotificationPreference $preference): bool
    {
        DB::beginTransaction();

        try {
            Log::info('Deleting notification preference', [
                'preference_id' => $preference->getAttribute('id'),
                'user_id' => $preference->getAttribute('user_id'),
                'entity_type' => $preference->getAttribute('entity_type'),
                'attribute_value' => $preference->getAttribute('attribute_value'),
            ]);

            $result = $preference->delete();

            DB::commit();

            Log::info('Successfully deleted notification preference', [
                'preference_id' => $preference->getAttribute('id'),
                'user_id' => $preference->getAttribute('user_id'),
            ]);

            return $result;
        } catch (Exception $e) {
            DB::rollBack();

            Log::error('Failed to delete notification preference', [
                'preference_id' => $preference->getAttribute('id'),
                'user_id' => $preference->getAttribute('user_id'),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw NotificationPreferenceException::databaseOperationFailed(
                'delete',
                $e->getMessage()
            );
        }
    }

    public function preferenceExists(User $user, string $entityType, string $attributeValue): bool
    {
        return NotificationPreference::where('user_id', $user->getAttribute('id'))
            ->where('entity_type', $entityType)
            ->where('attribute_value', $attributeValue)
            ->exists();
    }

    private function getAttributeTypeForEntity(string $entityType): string
    {
        return match ($entityType) {
            NotificationPreference::ENTITY_TYPE_REQUEST => 'subtheme',
            NotificationPreference::ENTITY_TYPE_OPPORTUNITY => 'type',
            default => throw NotificationPreferenceException::invalidEntityType($entityType)
        };
    }

    public function unsubscribeFromAllNotifications(User $user, bool $removeSubscriptions = false): bool
    {
        DB::beginTransaction();

        try {
            // Disable all notification preferences for the user
            $updatedCount = NotificationPreference::where('user_id', $user->id)
                ->update(['email_notification_enabled' => false]);

            // Optionally remove all request subscriptions
            if ($removeSubscriptions) {
                RequestSubscription::where('user_id', $user->id)->delete();
            }

            DB::commit();

            return true;
        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Failed to unsubscribe user from notifications', [
                'user_id' => $user->id,
                'email' => $user->email,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }
}
