<?php

declare(strict_types=1);

namespace App\Services;

use App\Exceptions\NotificationPreferenceException;
use App\Http\Resources\NotificationPreferenceResource;
use App\Models\NotificationPreference;
use App\Models\User;
use Exception;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

/**
 * Service for managing user notification preferences
 *
 * This service handles CRUD operations for notification preferences,
 * ensuring data integrity, proper logging, and error handling.
 */
class NotificationPreferenceService
{
    /**
     * Get paginated preferences for a user
     *
     * Retrieves all notification preferences for a given user,
     * ordered by most recently updated first.
     *
     * @param  User  $user  The user whose preferences to retrieve
     * @param  int  $perPage  Number of items per page (default: 15)
     * @return LengthAwarePaginator Paginated collection of preferences
     *
     * @throws NotificationPreferenceException If query fails
     */
    public function getUserPreferences(User $user, int $perPage = 15): LengthAwarePaginator
    {
        try {
            Log::info('Fetching notification preferences for user', [
                'user_id' => $user->getAttribute('id'),
                'per_page' => $perPage,
            ]);

            $preferences = NotificationPreference::where('user_id', $user->getAttribute('id'))
                ->orderBy('updated_at', 'desc')
                ->paginate($perPage);

            $preferences->toResourceCollection(NotificationPreferenceResource::class);

            Log::debug('Successfully fetched notification preferences', [
                'user_id' => $user->getAttribute('id'),
                'total_count' => $preferences->total(),
            ]);

            return $preferences;
        } catch (Exception $e) {
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
            // Validate entity type
            $entityType = $data['entity_type'] ?? null;

            if (! $entityType || ! NotificationPreference::isValidEntityType($entityType)) {
                Log::warning('Invalid entity type provided', [
                    'user_id' => $user->getAttribute('id'),
                    'entity_type' => $entityType,
                ]);

                throw NotificationPreferenceException::invalidEntityType($entityType ?? 'null');
            }

            // Auto-set attribute_type based on entity_type
            $attributeType = $this->getAttributeTypeForEntity($entityType);
            $attributeValue = $data['attribute_value'] ?? null;

            // Validate attribute value is present
            if (! $attributeValue || trim($attributeValue) === '') {
                throw ValidationException::withMessages([
                    'attribute_value' => ['Attribute value is required and cannot be empty.'],
                ]);
            }

            // Check for duplicate preference
            $existingPreference = NotificationPreference::where('user_id', $user->getAttribute('id'))
                ->where('entity_type', $entityType)
                ->where('attribute_value', $attributeValue)
                ->first();

            if ($existingPreference) {
                Log::warning('Attempted to create duplicate notification preference', [
                    'user_id' => $user->getAttribute('id'),
                    'entity_type' => $entityType,
                    'attribute_type' => $attributeType,
                    'attribute_value' => $attributeValue,
                    'existing_preference_id' => $existingPreference->getAttribute('id'),
                ]);

                throw NotificationPreferenceException::duplicatePreference(
                    $user->getAttribute('id'),
                    $entityType,
                    $attributeValue
                );
            }

            // Prepare preference data with defaults
            $preferenceData = [
                'user_id' => $user->getAttribute('id'),
                'entity_type' => $entityType,
                'attribute_type' => $attributeType,
                'attribute_value' => $attributeValue,
                'email_notification_enabled' => true, // Always enabled
            ];

            Log::info('Creating notification preference', [
                'user_id' => $user->getAttribute('id'),
                'entity_type' => $entityType,
                'attribute_type' => $attributeType,
                'attribute_value' => $attributeValue,
            ]);

            $preference = NotificationPreference::create($preferenceData);

            DB::commit();

            Log::info('Successfully created notification preference', [
                'preference_id' => $preference->getAttribute('id'),
                'user_id' => $user->getAttribute('id'),
                'entity_type' => $entityType,
                'attribute_value' => $attributeValue,
            ]);

            return $preference;
        } catch (NotificationPreferenceException $e) {
            DB::rollBack();
            throw $e;
        } catch (ValidationException $e) {
            DB::rollBack();
            throw $e;
        } catch (Exception $e) {
            DB::rollBack();

            Log::error('Unexpected error creating notification preference', [
                'user_id' => $user->getAttribute('id'),
                'data' => $data,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw NotificationPreferenceException::databaseOperationFailed(
                'create',
                $e->getMessage()
            );
        }
    }

    public function updatePreference(NotificationPreference $preference, array $data): NotificationPreference
    {
        DB::beginTransaction();

        try {
            Log::info('Updating notification preference', [
                'preference_id' => $preference->getAttribute('id'),
                'user_id' => $preference->getAttribute('user_id'),
                'update_data' => array_keys($data),
            ]);

            $preference->update($data);

            DB::commit();

            Log::info('Successfully updated notification preference', [
                'preference_id' => $preference->getAttribute('id'),
                'user_id' => $preference->getAttribute('user_id'),
            ]);

            return $preference->fresh();
        } catch (Exception $e) {
            DB::rollBack();

            Log::error('Failed to update notification preference', [
                'preference_id' => $preference->getAttribute('id'),
                'user_id' => $preference->getAttribute('user_id'),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw NotificationPreferenceException::databaseOperationFailed(
                'update',
                $e->getMessage()
            );
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

    /**
     * Get users who have email notifications enabled for specific criteria
     *
     * Retrieves all users who want to receive email notifications
     * for a specific entity type and attribute value.
     *
     * @param  string  $entityType  The entity type ('request' or 'opportunity')
     * @param  string  $attributeValue  The attribute value to match
     * @return Collection Collection of User models
     *
     * @throws NotificationPreferenceException If query fails
     */
    public function getUsersWithEmailNotificationsFor(string $entityType, string $attributeValue): Collection
    {
        try {
            Log::debug('Fetching users with email notifications enabled', [
                'entity_type' => $entityType,
                'attribute_value' => $attributeValue,
            ]);

            $users = User::whereHas('notificationPreferences', function ($query) use ($entityType, $attributeValue) {
                $query->where('entity_type', $entityType)
                    ->where('attribute_value', $attributeValue)
                    ->where('email_notification_enabled', true);
            })->get();

            Log::debug('Successfully fetched users with email notifications', [
                'entity_type' => $entityType,
                'attribute_value' => $attributeValue,
                'user_count' => $users->count(),
            ]);

            return $users;
        } catch (Exception $e) {
            Log::error('Failed to fetch users with email notifications', [
                'entity_type' => $entityType,
                'attribute_value' => $attributeValue,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw NotificationPreferenceException::databaseOperationFailed(
                'fetch users with email notifications',
                $e->getMessage()
            );
        }
    }

    /**
     * Check if a preference already exists for user
     *
     * Utility method to check for duplicate preferences before creation.
     *
     * @param  User  $user  The user to check for
     * @param  string  $entityType  The entity type
     * @param  string  $attributeValue  The attribute value
     * @return bool True if preference exists
     */
    public function preferenceExists(User $user, string $entityType, string $attributeValue): bool
    {
        return NotificationPreference::where('user_id', $user->getAttribute('id'))
            ->where('entity_type', $entityType)
            ->where('attribute_value', $attributeValue)
            ->exists();
    }

    /**
     * Get count of preferences by entity type for a user
     *
     * Useful for dashboard statistics and analytics.
     *
     * @param  User  $user  The user to get statistics for
     * @return array Associative array with counts by entity type
     */
    public function getPreferenceCountsByEntityType(User $user): array
    {
        try {
            $counts = NotificationPreference::where('user_id', $user->getAttribute('id'))
                ->select('entity_type', DB::raw('count(*) as count'))
                ->groupBy('entity_type')
                ->pluck('count', 'entity_type')
                ->toArray();

            Log::debug('Fetched preference counts by entity type', [
                'user_id' => $user->getAttribute('id'),
                'counts' => $counts,
            ]);

            return $counts;
        } catch (Exception $e) {
            Log::error('Failed to fetch preference counts', [
                'user_id' => $user->getAttribute('id'),
                'error' => $e->getMessage(),
            ]);

            return [];
        }
    }

    /**
     * Bulk delete preferences for a user by entity type
     *
     * Allows users to clear all preferences for a specific entity type.
     *
     * @param  User  $user  The user whose preferences to delete
     * @param  string  $entityType  The entity type to filter by
     * @return int Number of preferences deleted
     *
     * @throws NotificationPreferenceException If deletion fails
     */
    public function bulkDeleteByEntityType(User $user, string $entityType): int
    {
        DB::beginTransaction();

        try {
            Log::info('Bulk deleting notification preferences by entity type', [
                'user_id' => $user->getAttribute('id'),
                'entity_type' => $entityType,
            ]);

            $deletedCount = NotificationPreference::where('user_id', $user->getAttribute('id'))
                ->where('entity_type', $entityType)
                ->delete();

            DB::commit();

            Log::info('Successfully bulk deleted notification preferences', [
                'user_id' => $user->getAttribute('id'),
                'entity_type' => $entityType,
                'deleted_count' => $deletedCount,
            ]);

            return $deletedCount;
        } catch (Exception $e) {
            DB::rollBack();

            Log::error('Failed to bulk delete notification preferences', [
                'user_id' => $user->getAttribute('id'),
                'entity_type' => $entityType,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw NotificationPreferenceException::databaseOperationFailed(
                'bulk delete',
                $e->getMessage()
            );
        }
    }

    /**
     * Get attribute type for entity type (auto-mapping)
     *
     * Maps entity types to their corresponding attribute types:
     * - request -> subtheme
     * - opportunity -> type
     *
     * @param  string  $entityType  The entity type
     * @return string The corresponding attribute type
     *
     * @throws NotificationPreferenceException If entity type is invalid
     */
    private function getAttributeTypeForEntity(string $entityType): string
    {
        return match ($entityType) {
            NotificationPreference::ENTITY_TYPE_REQUEST => 'subtheme',
            NotificationPreference::ENTITY_TYPE_OPPORTUNITY => 'type',
            default => throw NotificationPreferenceException::invalidEntityType($entityType)
        };
    }
}
