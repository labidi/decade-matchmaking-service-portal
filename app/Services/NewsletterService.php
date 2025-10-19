<?php

declare(strict_types=1);

namespace App\Services;

use App\Jobs\Email\SendTransactionalEmail;
use App\Models\NotificationPreference;
use App\Models\Opportunity;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;

/**
 * Newsletter Service for sending weekly opportunity newsletters
 *
 * This service handles sending weekly newsletters to users about new opportunities
 * matching their notification preferences. Request notifications are now event-driven
 * and handled separately.
 */
class NewsletterService
{
    public function __construct(
        private readonly NotificationPreferenceService $preferenceService
    ) {
    }

    /**
     * Send weekly opportunity newsletter to all subscribed users
     *
     * @return array{processed: int, sent: int, failed: int}
     */
    public function sendWeeklyNewsletter(): array
    {
        try {
            Log::info('[NewsletterService] Starting weekly opportunity newsletter send');

            $stats = [
                'processed' => 0,
                'sent' => 0,
                'failed' => 0,
                'errors' => [],
            ];

            // Get users with active opportunity preferences
            $users = $this->getUsersWithOpportunityPreferences();
            $stats['processed'] = $users->count();

            Log::info('[NewsletterService] Found users for opportunity newsletter', [
                'count' => $stats['processed'],
            ]);

            foreach ($users as $user) {
                try {
                    // Aggregate opportunities matching user's preferences
                    $opportunities = $this->aggregateOpportunitiesForUser($user);

                    // Only send if there are matching opportunities
                    if (!empty($opportunities)) {
                        $this->dispatchNewsletterEmail($user, $opportunities);
                        $stats['sent']++;

                        Log::debug('[NewsletterService] Opportunity newsletter dispatched', [
                            'user_id' => $user->id,
                            'email' => $user->email,
                            'opportunity_count' => count($opportunities),
                        ]);
                    } else {
                        Log::debug('[NewsletterService] No opportunities for user, skipping', [
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

            Log::info('[NewsletterService] Weekly opportunity newsletter send completed', [
                'processed' => $stats['processed'],
                'sent' => $stats['sent'],
                'failed' => $stats['failed'],
            ]);

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
     * Get users with active email preferences for opportunities
     *
     * @return Collection<User>
     */
    private function getUsersWithOpportunityPreferences(): Collection
    {
        return User::whereHas('notificationPreferences', function ($query) {
            $query->where('email_notification_enabled', true)
                ->where('entity_type', NotificationPreference::ENTITY_TYPE_OPPORTUNITY);
        })
            ->with(['notificationPreferences' => function ($query) {
                $query->where('email_notification_enabled', true)
                    ->where('entity_type', NotificationPreference::ENTITY_TYPE_OPPORTUNITY);
            }])
            ->get()
            ->unique('id');
    }

    /**
     * Aggregate opportunities from the last week matching user's preferences
     *
     * @param User $user
     * @return array
     */
    private function aggregateOpportunitiesForUser(User $user): array
    {
        $weekAgo = Carbon::now()->subWeek();
        $preferences = $user->notificationPreferences;
        $matchingOpportunities = collect();

        // Get opportunity preferences (type-based)
        $opportunityPreferences = $preferences->where(
            'entity_type',
            NotificationPreference::ENTITY_TYPE_OPPORTUNITY
        );

        foreach ($opportunityPreferences as $preference) {
            $opportunities = Opportunity::where('type', $preference->attribute_value)
                ->where('created_at', '>=', $weekAgo)
                ->where('status', \App\Enums\Opportunity\Status::ACTIVE)
                ->get();

            $matchingOpportunities = $matchingOpportunities->merge($opportunities);
        }

        // Remove duplicates and return as array
        return $matchingOpportunities->unique('id')->values()->toArray();
    }

    /**
     * Dispatch newsletter email job to queue
     *
     * @param User $user
     * @param array $opportunities
     * @return void
     */
    private function dispatchNewsletterEmail(User $user, array $opportunities): void
    {
        // Prepare variables for email template
        $variables = [
            'UNSUB' => route('unsubscribe.show', $user->id),
            'UPDATE_PROFILE' => route('notification.preferences.index'),
            'user_name' => $user->name ?? $user->email,
            'opportunity_count' => count($opportunities),
        ];

        // Render HTML content for opportunities
        $opportunitiesHtml = view('emails.newsletter.opportunities', [
            'opportunities' => $opportunities,
        ])->render();

        $options = [
            'template_content' => [
                ['name' => 'opportunities_section', 'content' => $opportunitiesHtml],
            ],
        ];

        // Dispatch the email job
        SendTransactionalEmail::dispatch(
            'opportunity.newsletter.weekly',
            $user,
            $variables,
            $options
        );

        Log::info('[NewsletterService] Opportunity newsletter email dispatched to queue', [
            'user_id' => $user->id,
            'email' => $user->email,
            'opportunity_count' => count($opportunities),
            'template' => 'opportunity.newsletter.weekly',
        ]);
    }

    /**
     * Get newsletter statistics for monitoring
     *
     * @return array
     */
    public function getNewsletterStats(): array
    {
        $activeOpportunitySubscribers = User::whereHas('notificationPreferences', function ($query) {
            $query->where('email_notification_enabled', true)
                ->where('entity_type', NotificationPreference::ENTITY_TYPE_OPPORTUNITY);
        })->count();

        return [
            'active_opportunity_subscribers' => $activeOpportunitySubscribers,
            'last_send' => cache()->get('newsletter:last_send_date'),
            'last_send_stats' => cache()->get('newsletter:last_send_stats', []),
        ];
    }
}
