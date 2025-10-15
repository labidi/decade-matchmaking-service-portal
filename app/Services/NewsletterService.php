<?php

declare(strict_types=1);

namespace App\Services;

use App\Jobs\Email\SendTransactionalEmail;
use App\Models\NotificationPreference;
use App\Models\Opportunity;
use App\Models\Request;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;

class NewsletterService
{
    public function __construct(
        private readonly NotificationPreferenceService $preferenceService
    ) {
    }

    /**
     * Send weekly newsletters to all subscribed users
     */
    public function sendWeeklyNewsletter(): array
    {
        $stats = [
            'opportunities' => ['total_users' => 0, 'emails_dispatched' => 0, 'failed' => 0, 'errors' => []],
            'requests' => ['total_users' => 0, 'emails_dispatched' => 0, 'failed' => 0, 'errors' => []],
        ];

        try {
            Log::info('[NewsletterService] Starting weekly newsletter send');

            // Process opportunities newsletter
            $stats['opportunities'] = $this->sendOpportunitiesNewsletter();

            // Process requests newsletter
//            $stats['requests'] = $this->sendRequestsNewsletter();

            Log::info('[NewsletterService] Weekly newsletter send completed', $stats);

            return $stats;
        } catch (\Exception $e) {
            Log::error('[NewsletterService] Weekly newsletter send failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    /**
     * Send opportunities newsletter to users with opportunity preferences
     */
    private function sendOpportunitiesNewsletter(): array
    {
        Log::info('[NewsletterService] Starting opportunities newsletter');

        return $this->processNewsletter(
            NotificationPreference::ENTITY_TYPE_OPPORTUNITY,
            'opportunity.newsletter.weekly'
        );
    }

    /**
     * Send requests newsletter to users with request preferences
     */
    private function sendRequestsNewsletter(): array
    {
        Log::info('[NewsletterService] Starting requests newsletter');

        return $this->processNewsletter(
            NotificationPreference::ENTITY_TYPE_REQUEST,
            'request.newsletter.weekly'
        );
    }

    /**
     * Process newsletter for a specific entity type
     */
    private function processNewsletter(string $entityType, string $template): array
    {
        $stats = [
            'total_users' => 0,
            'emails_dispatched' => 0,
            'failed' => 0,
            'errors' => [],
        ];

        try {
            // Get users with active preferences for this type
            $users = $this->getUsersWithPreferencesForType($entityType);
            $stats['total_users'] = $users->count();

            Log::info("[NewsletterService] Found users for {$entityType} newsletter", [
                'count' => $stats['total_users'],
            ]);

            foreach ($users as $user) {
                try {
                    // Aggregate content matching user's preferences
                    $content = $this->aggregateContentForType($user, $entityType);

                    // Only send if there's matching content
                    if ($this->hasContent($content)) {
                        $this->dispatchTypedNewsletterEmail($user, $content, $entityType, $template);
                        $stats['emails_dispatched']++;

                        Log::debug("[NewsletterService] {$entityType} newsletter dispatched", [
                            'user_id' => $user->id,
                            'email' => $user->email,
                            'content_count' => count($content),
                        ]);
                    } else {
                        Log::debug("[NewsletterService] No {$entityType} content for user, skipping", [
                            'user_id' => $user->id,
                            'email' => $user->email,
                        ]);
                    }
                } catch (\Exception $e) {
                    $stats['failed']++;
                    $stats['errors'][] = [
                        'user_id' => $user->id,
                        'email' => $user->email,
                        'error' => $e->getMessage(),
                    ];

                    Log::error("[NewsletterService] Failed to send {$entityType} newsletter to user", [
                        'user_id' => $user->id,
                        'email' => $user->email,
                        'error' => $e->getMessage(),
                        'trace' => $e->getTraceAsString(),
                    ]);
                }
            }

            Log::info("[NewsletterService] {$entityType} newsletter send completed", $stats);

            return $stats;
        } catch (\Exception $e) {
            Log::error("[NewsletterService] {$entityType} newsletter processing failed", [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    /**
     * Get users with active email preferences for a specific entity type
     */
    private function getUsersWithPreferencesForType(string $entityType): Collection
    {
        return User::whereHas('notificationPreferences', function ($query) use ($entityType) {
            $query->where('email_notification_enabled', true)
                ->where('entity_type', $entityType);
        })
            ->with(['notificationPreferences' => function ($query) use ($entityType) {
                $query->where('email_notification_enabled', true)
                    ->where('entity_type', $entityType);
            }])
            ->get()
            ->unique('id');
    }

    /**
     * Aggregate content for user based on entity type
     */
    private function aggregateContentForType(User $user, string $entityType): array
    {
        $weekAgo = Carbon::now()->subWeek();

        if ($entityType === NotificationPreference::ENTITY_TYPE_OPPORTUNITY) {
            return $this->aggregateOpportunities($user, $weekAgo);
        }

        if ($entityType === NotificationPreference::ENTITY_TYPE_REQUEST) {
            return $this->aggregateRequests($user, $weekAgo);
        }

        return [];
    }

    /**
     * Aggregate opportunities matching user's preferences
     */
    private function aggregateOpportunities(User $user, Carbon $since): array
    {
        $preferences = $user->notificationPreferences;
        $matchingOpportunities = collect();

        // Get opportunity preferences (type-based)
        $opportunityPreferences = $preferences->where('entity_type', NotificationPreference::ENTITY_TYPE_OPPORTUNITY);

        foreach ($opportunityPreferences as $preference) {
            $opportunities = Opportunity::where('type', $preference->attribute_value)
//                ->where('user_id', '!=', $user->id) // Don't include user's own opportunities
                ->where('status', \App\Enums\Opportunity\Status::ACTIVE)
                ->get();

            $matchingOpportunities = $matchingOpportunities->merge($opportunities);
        }

        // Remove duplicates
        $matchingOpportunities = $matchingOpportunities->unique('id');

        return $matchingOpportunities->values()->toArray();
    }

    /**
     * Aggregate requests matching user's preferences
     */
    private function aggregateRequests(User $user, Carbon $since): array
    {
        $preferences = $user->notificationPreferences;
        $matchingRequests = collect();

        // Get request preferences (subtheme-based)
        $requestPreferences = $preferences->where('entity_type', NotificationPreference::ENTITY_TYPE_REQUEST);

        foreach ($requestPreferences as $preference) {
            $requests = Request::where('created_at', '>=', $since)
                ->where('user_id', '!=', $user->id) // Don't include user's own requests
                ->whereHas('requestDetail', function ($query) use ($preference) {
                    $query->whereJsonContains('subthemes', $preference->attribute_value);
                })
                ->with(['status', 'detail'])
                ->get();

            $matchingRequests = $matchingRequests->merge($requests);
        }

        // Remove duplicates
        $matchingRequests = $matchingRequests->unique('id');

        return $matchingRequests->values()->toArray();
    }

    /**
     * Check if content array has items
     */
    private function hasContent(array $content): bool
    {
        return !empty($content);
    }

    /**
     * Dispatch newsletter email job to queue for specific entity type
     */
    private function dispatchTypedNewsletterEmail(
        User $user,
        array $content,
        string $entityType,
        string $template
    ): void {
        // Prepare variables based on entity type
        $variables = [
            'UNSUB' => route('unsubscribe.show', $user->id),
            'UPDATE_PROFILE' => route('notification.preferences.index'),
            'user_name' => $user->name ?? $user->email,
        ];

        $options = [];

        // Add entity-specific variables and template content
        if ($entityType === NotificationPreference::ENTITY_TYPE_OPPORTUNITY) {
            $variables['opportunity_count'] = count($content);

            // Render HTML content for opportunities
            $opportunitiesHtml = view('emails.newsletter.opportunities', [
                'opportunities' => $content,
            ])->render();

            $options['template_content'] = [
                ['name' => 'opportunities_section', 'content' => $opportunitiesHtml],
            ];
        } elseif ($entityType === NotificationPreference::ENTITY_TYPE_REQUEST) {
            $variables['request_count'] = count($content);

            // Render HTML content for requests
            $requestsHtml = view('emails.newsletter.requests', [
                'requests' => $content,
            ])->render();

            $options['template_content'] = [
                ['name' => 'requests_section', 'content' => $requestsHtml],
            ];
        }

        // Dispatch the email job with options
        SendTransactionalEmail::dispatch(
            $template,
            $user,
            $variables,
            $options
        );

        Log::info("[NewsletterService] {$entityType} newsletter email dispatched to queue", [
            'user_id' => $user->id,
            'email' => $user->email,
            'content_count' => count($content),
            'template' => $template,
        ]);
    }

    /**
     * Get newsletter statistics for monitoring
     */
    public function getNewsletterStats(): array
    {
        $activeOpportunitySubscribers = User::whereHas('notificationPreferences', function ($query) {
            $query->where('email_notification_enabled', true)
                ->where('entity_type', NotificationPreference::ENTITY_TYPE_OPPORTUNITY);
        })->count();

        $activeRequestSubscribers = User::whereHas('notificationPreferences', function ($query) {
            $query->where('email_notification_enabled', true)
                ->where('entity_type', NotificationPreference::ENTITY_TYPE_REQUEST);
        })->count();

        return [
            'active_opportunity_subscribers' => $activeOpportunitySubscribers,
            'active_request_subscribers' => $activeRequestSubscribers,
            'last_send' => cache()->get('newsletter:last_send_date'),
            'last_send_stats' => cache()->get('newsletter:last_send_stats', []),
        ];
    }
}
