<?php

declare(strict_types=1);

namespace App\Services\Request;

/**
 * Centralized service for request context configuration
 *
 * Provides consistent context-based configuration for both list and detail views
 * Following Single Responsibility Principle
 */
class RequestContextService
{
    /**
     * Available request contexts
     */
    public const CONTEXT_ADMIN = 'admin';
    public const CONTEXT_USER_OWN = 'user_own';
    public const CONTEXT_PUBLIC = 'public';
    public const CONTEXT_MATCHED = 'matched';
    public const CONTEXT_SUBSCRIBED = 'subscribed';

    /**
     * Get context-specific banner configuration for detail view
     *
     * @param string $context The context identifier
     * @param string $requestTitle The request title for dynamic content
     * @return array{title: string, description: string, image: string}
     */
    public function getDetailBannerConfig(string $context, string $requestTitle): array
    {
        return match ($context) {
            self::CONTEXT_USER_OWN => [
                'title' => $requestTitle,
                'description' => 'View and manage details of your submitted request.',
                'image' => '/assets/img/sidebar.png',
            ],
            self::CONTEXT_MATCHED => [
                'title' => $requestTitle,
                'description' => 'Review details of this matched request and manage your partnership.',
                'image' => '/assets/img/sidebar.png',
            ],
            self::CONTEXT_SUBSCRIBED => [
                'title' => $requestTitle,
                'description' => 'View details of this request you are subscribed to for updates.',
                'image' => '/assets/img/sidebar.png',
            ],
            self::CONTEXT_PUBLIC => [
                'title' => $requestTitle,
                'description' => 'View this public training request and explore partnership opportunities.',
                'image' => '/assets/img/sidebar.png',
            ],
            default => [
                'title' => $requestTitle,
                'description' => 'View request details here.',
                'image' => '/assets/img/sidebar.png',
            ],
        };
    }

    /**
     * Get context-specific list configuration
     * Used by ListController for consistent configuration
     *
     * @param string $context The context identifier
     * @return array{title: string, banner: array<string, string>|null, showRouteName: string} Configuration array for the list view
     */
    public function getListConfig(string $context): array
    {
        return match ($context) {
            self::CONTEXT_ADMIN => [
                'title' => 'Requests',
                'banner' => null, // Admin doesn't use banner
                'showRouteName' => 'admin.request.show',
            ],
            self::CONTEXT_USER_OWN => [
                'title' => 'My requests',
                'banner' => [
                    'title' => 'List of my requests',
                    'description' => 'Manage your requests here.',
                ],
                'showRouteName' => 'request.show',
            ],
            self::CONTEXT_PUBLIC => [
                'title' => 'View Request for Training workshops',
                'banner' => [
                    'title' => 'View Request for Training workshops',
                    'description' => 'View requests for training and workshops.',
                ],
                'showRouteName' => 'request.show',
            ],
            self::CONTEXT_MATCHED => [
                'title' => 'View my matched requests',
                'banner' => [
                    'title' => 'View my matched requests',
                    'description' => 'View and browse my matched Request.',
                ],
                'showRouteName' => 'request.show',
            ],
            self::CONTEXT_SUBSCRIBED => [
                'title' => 'View my subscribed requests',
                'banner' => [
                    'title' => 'View my subscribed requests',
                    'description' => 'View and browse my subscribed Request.',
                ],
                'showRouteName' => 'request.show',
            ],
        };
    }

    /**
     * Validate if context is valid
     *
     * @param string $context Context to validate
     * @return bool
     */
    public function isValidContext(string $context): bool
    {
        return in_array($context, [
            self::CONTEXT_ADMIN,
            self::CONTEXT_USER_OWN,
            self::CONTEXT_PUBLIC,
            self::CONTEXT_MATCHED,
            self::CONTEXT_SUBSCRIBED,
        ], true);
    }

    /**
     * Get default context for non-admin routes
     *
     * @return string
     */
    public function getDefaultContext(): string
    {
        return self::CONTEXT_PUBLIC;
    }
}
