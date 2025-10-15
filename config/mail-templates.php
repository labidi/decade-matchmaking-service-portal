<?php

declare(strict_types=1);

return [
    'provider' => 'mandrill',

    /*
    |--------------------------------------------------------------------------
    | Email Template Mappings
    |--------------------------------------------------------------------------
    |
    | Maps application events to Mandrill template names with required variables.
    | Each template configuration includes:
    | - template_name: Mandrill template slug
    | - subject: Default subject line (can be overridden in Mandrill)
    | - variables: Required and optional variables with validation rules
    | - tags: Tags for tracking and filtering in Mandrill
    |
    */
    'templates' => [
        // User Events
        'user.registered' => [
            'template_name' => 'ocd-welcome',
            'subject' => 'Welcome to Ocean Decade Portal',
            'variables' => [
                'user_name' => 'required|string',
                'verification_url' => 'required|url',
                'portal_url' => 'required|url',
            ],
            'tags' => ['user', 'registration', 'welcome'],
        ],

        'user.email_verified' => [
            'template_name' => 'ocd-email-verified',
            'subject' => 'Email Verified Successfully',
            'variables' => [
                'user_name' => 'required|string',
                'portal_url' => 'required|url',
                'UPDATE_PROFILE'=>'required|string',
            ],
            'tags' => ['user', 'verification'],
        ],

        'user.password_reset' => [
            'template_name' => 'ocd-password-reset',
            'subject' => 'Reset Your Password',
            'variables' => [
                'user_name' => 'required|string',
                'reset_url' => 'required|url',
                'expires_at' => 'required|string',
                'UPDATE_PROFILE'=>'required|string',
            ],
            'tags' => ['user', 'security', 'password'],
        ],

        // Request Events
        'request.submitted' => [
            'template_name' => 'ocd-request-submitted',
            'subject' => 'Your Ocean Decade Request Has Been Submitted',
            'variables' => [
                'user_name' => 'required|string',
                'request_title' => 'required|string',
                'request_id' => 'required|integer',
                'submission_date' => 'required|date',
                'request_url' => 'required|url',
                'UPDATE_PROFILE'=>'required|string',
            ],
            'tags' => ['request', 'submission'],
        ],

        'request.approved' => [
            'template_name' => 'ocd-request-approved',
            'subject' => 'Your Request Has Been Approved',
            'variables' => [
                'user_name' => 'required|string',
                'request_title' => 'required|string',
                'request_url' => 'required|url',
                'approved_by' => 'optional|string',
                'approval_message' => 'optional|string',
                'UPDATE_PROFILE'=>'required|string',
            ],
            'tags' => ['request', 'approval', 'status'],
        ],

        'request.matched' => [
            'template_name' => 'ocd-request-matched',
            'subject' => 'We Found a Match for Your Request',
            'variables' => [
                'user_name' => 'required|string',
                'request_title' => 'required|string',
                'partner_name' => 'required|string',
                'partner_organization' => 'required|string',
                'match_url' => 'required|url',
                'UPDATE_PROFILE'=>'required|string',
            ],
            'tags' => ['request', 'match', 'partner'],
        ],

        // Offer Events
        'offer.received' => [
            'template_name' => 'ocd-offer-received',
            'subject' => 'New Offer for Your Request',
            'variables' => [
                'recipient_name' => 'required|string',
                'partner_organization' => 'required|string',
                'request_title' => 'required|string',
                'offer_summary' => 'required|string',
                'offer_url' => 'required|url',
                'UPDATE_PROFILE'=>'required|string',
            ],
            'tags' => ['offer', 'notification'],
        ],
        'opportunity.updated' => [
            'template_name' => 'cdf-update-on-your-opportunity',
            'subject' => 'Opportunity Update',
            'variables' => [
                'Opportunity_Title' => 'required|string',
                'Opportunity_Link' => 'required|string',
                'UNSUB' => 'required|string',
                'UPDATE_PROFILE'=>'required|string',
            ],
            'tags' => ['opportunity', 'notification'],
        ],
        // Separate newsletters for opportunities and requests
        'opportunity.newsletter.weekly' => [
            'template_name' => 'cdf-opportunitynewsletter',
            'subject' => 'New Ocean Decade Opportunities This Week',
            'variables' => [
                'UNSUB' => 'required|string',
                'UPDATE_PROFILE' => 'string',
                'user_name' => 'string',
                'opportunity_count' => 'integer',
            ],
            'tags' => ['opportunity', 'newsletter', 'weekly'],
        ],

        'request.newsletter.weekly' => [
            'template_name' => 'cdf-request-newsletter-weekly',
            'subject' => 'New Ocean Decade Requests This Week',
            'variables' => [
                'UNSUB' => 'required|string',
                'UPDATE_PROFILE' => 'string',
                'user_name' => 'string',
                'request_count' => 'integer',
            ],
            'tags' => ['request', 'newsletter', 'weekly'],
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Environment Template Prefixes
    |--------------------------------------------------------------------------
    |
    | Prefixes added to template names based on environment.
    | This allows testing templates without affecting production.
    |
    */
    'environment_prefix' => [
        'production' => '',
        'staging' => '',
        'development' => '',
        'local' => '',
        'testing' => '',
    ],

    /*
    |--------------------------------------------------------------------------
    | Mandrill Settings
    |--------------------------------------------------------------------------
    */
    'mandrill' => [
        'api_key' => env('MANDRILL_API_KEY'),
        'from_address' => env('MANDRILL_FROM_ADDRESS', 'noreply@oceandecade.org'),
        'from_name' => env('MANDRILL_FROM_NAME', 'Ocean Decade Portal'),
        'reply_to' => env('MANDRILL_REPLY_TO', 'support@oceandecade.org'),
        'webhook_key' => env('MANDRILL_WEBHOOK_KEY'), // For webhook signature verification
    ],

    /*
    |--------------------------------------------------------------------------
    | Email Queue Settings
    |--------------------------------------------------------------------------
    */
    'queue' => [
        'connection' => env('EMAIL_QUEUE_CONNECTION', 'database'),
        'queue_name' => env('EMAIL_QUEUE_NAME', 'default'),
        'retry_after' => 90, // seconds
        'max_attempts' => 3,
        'backoff' => [60, 300, 900], // 1min, 5min, 15min
    ],

    /*
    |--------------------------------------------------------------------------
    | Logging Settings
    |--------------------------------------------------------------------------
    */
    'logging' => [
        'enabled' => true,
        'channel' => 'email', // Will use default channel if not exists
        'log_level' => env('EMAIL_LOG_LEVEL', 'info'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Rate Limiting Settings
    |--------------------------------------------------------------------------
    */
    'rate_limit' => [
        'enabled' => env('EMAIL_RATE_LIMIT_ENABLED', true),
        'global_per_minute' => env('EMAIL_RATE_LIMIT_GLOBAL', 100),
        'per_user_per_minute' => env('EMAIL_RATE_LIMIT_PER_USER', 5),
        'per_event_per_minute' => env('EMAIL_RATE_LIMIT_PER_EVENT', 20),
        'per_user_per_event_per_hour' => env('EMAIL_RATE_LIMIT_USER_EVENT', 3),
    ],

    /*
    |--------------------------------------------------------------------------
    | Cache Settings
    |--------------------------------------------------------------------------
    */
    'cache' => [
        'enabled' => env('EMAIL_TEMPLATE_CACHE_ENABLED', true),
        'ttl' => env('EMAIL_TEMPLATE_CACHE_TTL', 3600), // 1 hour
        'prefix' => 'email_template:',
        'store' => env('EMAIL_TEMPLATE_CACHE_STORE', null), // Use default cache store
    ],

    /*
    |--------------------------------------------------------------------------
    | Critical Events
    |--------------------------------------------------------------------------
    |
    | Events that should trigger admin notifications when they fail
    |
    */
    'critical_events' => [
        'user.registered',
        'user.email_verified',
        'user.password_reset',
        'request.approved',
        'request.rejected',
    ],

    /*
    |--------------------------------------------------------------------------
    | Admin Notifications
    |--------------------------------------------------------------------------
    |
    | Email addresses to notify when critical emails fail
    |
    */
    'admin_notifications' => explode(',', env('EMAIL_ADMIN_NOTIFICATIONS', '')),

    /*
    |--------------------------------------------------------------------------
    | Failure Threshold
    |--------------------------------------------------------------------------
    |
    | Number of failures before triggering critical alert
    |
    */
    'failure_threshold' => env('EMAIL_FAILURE_THRESHOLD', 10),
];
