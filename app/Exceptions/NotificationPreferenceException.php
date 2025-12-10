<?php

declare(strict_types=1);

namespace App\Exceptions;

use Exception;

/**
 * Base exception for notification preference operations
 */
class NotificationPreferenceException extends Exception
{
    /**
     * Create exception for duplicate preference
     */
    public static function duplicatePreference(): self
    {
        return new self(
            "Notification preference already exists"
        );
    }

    /**
     * Create exception for invalid entity type
     */
    public static function invalidEntityType(): self
    {
        return new self(
            "Notification preference type is invalid"
        );
    }

    /**
     * Create exception for preference not found
     */
    public static function preferenceNotFound(int $preferenceId): self
    {
        return new self(
            "SystemNotification preference with ID {$preferenceId} not found."
        );
    }

    /**
     * Create exception for database operation failure
     */
    public static function databaseOperationFailed(string $operation, string $reason): self
    {
        return new self(
            "Failed to {$operation} notification preference: {$reason}"
        );
    }

    /**
     * Create exception for unauthorized access
     */
    public static function unauthorizedAccess(int $userId, int $preferenceId): self
    {
        return new self(
            "User {$userId} is not authorized to access preference {$preferenceId}."
        );
    }
}
