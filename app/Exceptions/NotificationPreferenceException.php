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
    public static function duplicatePreference(int $userId, string $entityType, string $attributeValue): self
    {
        return new self(
            "SystemNotification preference already exists for user {$userId}, entity type '{$entityType}', and attribute value '{$attributeValue}'."
        );
    }

    /**
     * Create exception for invalid entity type
     */
    public static function invalidEntityType(string $entityType): self
    {
        return new self(
            "Invalid entity type '{$entityType}'. Allowed types: request, opportunity."
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
