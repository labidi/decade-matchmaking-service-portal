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
     * Send weekly newsletter to all subscribed users
     */
    public function sendWeeklyNewsletter(): array
    {
        $stats = [
            'total_users' => 0,
            'emails_dispatched' => 0,
            'failed' => 0,
            'errors' => [],
        ];

        try {
            Log::info('[NewsletterService] Starting weekly newsletter send');

            // Get all users with active email preferences
            $users = $this->getUsersWithActivePreferences();
            $stats['total_users'] = $users->count();

            Log::info('[NewsletterService] Found users with active preferences', [
                'count' => $stats['total_users'],
            ]);

            foreach ($users as $user) {
                try {
                    // Aggregate weekly content matching user's preferences
                    $content = $this->aggregateContentForUser($user);

                    // Only send if there's content matching their preferences
                    if ($content['has_content']) {
                        $this->dispatchNewsletterEmail($user, $content);
                        $stats['emails_dispatched']++;

                        Log::debug('[NewsletterService] Newsletter dispatched', [
                            'user_id' => $user->id,
                            'email' => $user->email,
                            'opportunities_count' => count($content['opportunities']),
                            'requests_count' => count($content['requests']),
                        ]);
                    } else {
                        Log::debug('[NewsletterService] No content for user, skipping', [
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

                    Log::error('[NewsletterService] Failed to send newsletter to user', [
                        'user_id' => $user->id,
                        'email' => $user->email,
                        'error' => $e->getMessage(),
                        'trace' => $e->getTraceAsString(),
                    ]);
                }
            }

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
     * Get all users with active email notification preferences
     */
    private function getUsersWithActivePreferences(): Collection
    {
        return User::whereHas('notificationPreferences', function ($query) {
            $query->where('email_notification_enabled', true);
        })
            ->with(['notificationPreferences' => function ($query) {
                $query->where('email_notification_enabled', true);
            }])
            ->get()
            ->unique('id');
    }

    /**
     * Aggregate weekly opportunities and requests matching user's preferences
     */
    private function aggregateContentForUser(User $user): array
    {
        $preferences = $user->notificationPreferences;
        $weekAgo = Carbon::now()->subWeek();

        $matchingOpportunities = collect();
        $matchingRequests = collect();

        // Get opportunity preferences (type-based)
        $opportunityPreferences = $preferences->where('entity_type', NotificationPreference::ENTITY_TYPE_OPPORTUNITY);
        foreach ($opportunityPreferences as $preference) {
            $opportunities = Opportunity::where('created_at', '>=', $weekAgo)
                ->where('type', $preference->attribute_value)
                ->where('user_id', '!=', $user->id) // Don't include user's own opportunities
                ->where('status', \App\Enums\Opportunity\Status::ACTIVE)
                ->get();

            $matchingOpportunities = $matchingOpportunities->merge($opportunities);
        }

        // Get request preferences (subtheme-based)
        $requestPreferences = $preferences->where('entity_type', NotificationPreference::ENTITY_TYPE_REQUEST);
        foreach ($requestPreferences as $preference) {
            $requests = Request::where('created_at', '>=', $weekAgo)
                ->where('user_id', '!=', $user->id) // Don't include user's own requests
                ->whereHas('requestDetail', function ($query) use ($preference) {
                    $query->whereJsonContains('subthemes', $preference->attribute_value);
                })
                ->with(['status', 'detail'])
                ->get();

            $matchingRequests = $matchingRequests->merge($requests);
        }

        // Remove duplicates
        $matchingOpportunities = $matchingOpportunities->unique('id');
        $matchingRequests = $matchingRequests->unique('id');

        return [
            'opportunities' => $matchingOpportunities->values()->toArray(),
            'requests' => $matchingRequests->values()->toArray(),
            'has_content' => $matchingOpportunities->isNotEmpty() || $matchingRequests->isNotEmpty(),
            'opportunity_count' => $matchingOpportunities->count(),
            'request_count' => $matchingRequests->count(),
        ];
    }

    /**
     * Dispatch newsletter email job to queue
     */
    private function dispatchNewsletterEmail(User $user, array $content): void
    {
        $variables = [
            'UNSUB' => route('unsubscribe.show', $user->id),
            // Add any other variables needed for the Mandrill template
            'user_name' => $user->name ?? $user->email,
            'opportunity_count' => $content['opportunity_count'],
            'request_count' => $content['request_count'],
        ];

        // Dispatch the email job
        SendTransactionalEmail::dispatch(
            'opportunity.newsletter',
            $user,
            $variables
        );

        Log::info('[NewsletterService] Newsletter email dispatched to queue', [
            'user_id' => $user->id,
            'email' => $user->email,
            'opportunities' => $content['opportunity_count'],
            'requests' => $content['request_count'],
        ]);
    }

    /**
     * Get newsletter statistics for monitoring
     */
    public function getNewsletterStats(): array
    {
        $activeSubscribers = User::whereHas('notificationPreferences', function ($query) {
            $query->where('email_notification_enabled', true);
        })->count();

        $totalPreferences = NotificationPreference::where('email_notification_enabled', true)->count();

        return [
            'active_subscribers' => $activeSubscribers,
            'total_active_preferences' => $totalPreferences,
            'last_send' => cache()->get('newsletter:last_send_date'),
            'last_send_stats' => cache()->get('newsletter:last_send_stats', []),
        ];
    }
}
