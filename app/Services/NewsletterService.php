<?php

declare(strict_types=1);

namespace App\Services;

use App\Jobs\Email\SendTransactionalEmail;
use App\Models\User;
use App\Services\Opportunity\OpportunityQueryBuilder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;

/**
 * Newsletter Service for sending weekly opportunity newsletters.
 *
 * Opt-out model: every non-blocked user with the master email switch enabled
 * receives the weekly email. By default it lists the top 15 currently-open
 * opportunities by closest closing date; users who have opted out of specific
 * opportunity types receive only the types they still allow.
 *
 * Scaling design: the full open-opportunity pool is fetched ONCE per run and
 * held in memory. Per-user filtering is done in-process on the collection.
 * Rendered HTML is memoised by the user's opt-out "signature" so that users
 * sharing the same opt-out set (the common case) reuse a single Blade render.
 * Users are streamed in chunks of 500 to keep peak memory bounded.
 */
class NewsletterService
{
    /**
     * Maximum number of opportunities included in a single email.
     */
    public const MAX_OPPORTUNITIES = 15;

    public function __construct(
        private readonly OpportunityQueryBuilder $opportunityQueryBuilder
    ) {
    }

    /**
     * Send weekly opportunity newsletter to all subscribed users.
     *
     * @return array{processed: int, sent: int, failed: int, errors: array}
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

            // A1: Load the open-opportunity pool exactly once for the whole run.
            $pool = $this->opportunityQueryBuilder
                ->buildActiveOpenByClosingDateQuery()
                ->get();

            Log::info('[NewsletterService] Loaded open opportunity pool', [
                'pool_size' => $pool->count(),
            ]);

            // A2: In-process render cache keyed by the user's opt-out signature.
            // Each entry: ['html' => string, 'total' => int, 'count' => int]
            $renderCache = [];

            // A3: Stream subscribers in bounded chunks — no full table load.
            User::query()
                ->where('email_notifications_enabled', true)
                ->where('is_blocked', false)
                ->chunkById(500, function (Collection $users) use ($pool, &$renderCache, &$stats): void {
                    foreach ($users as $user) {
                        $stats['processed']++;

                        try {
                            $enabledTypes = $user->enabledOpportunityTypes();

                            // User opted out of every type — skip entirely.
                            if (empty($enabledTypes)) {
                                Log::debug('[NewsletterService] No opportunities for user, skipping', [
                                    'user_id' => $user->id,
                                    'email' => $user->email,
                                ]);

                                continue;
                            }

                            // Derive a stable cache key from the user's enabled-type set.
                            $sortedTypes = $enabledTypes;
                            sort($sortedTypes);
                            $sig = implode(',', $sortedTypes);

                            if (! isset($renderCache[$sig])) {
                                $filtered = $pool->filter(
                                    fn ($o) => in_array(
                                        $o->type instanceof \App\Enums\Opportunity\Type
                                            ? $o->type->value
                                            : $o->type,
                                        $enabledTypes,
                                        true
                                    )
                                );

                                $total = $filtered->count();
                                $items = $filtered->take(self::MAX_OPPORTUNITIES)->values();

                                $viewAllUrl = route('opportunity.list');
                                $html = $items->isNotEmpty()
                                    ? view('emails.newsletter.opportunities', [
                                        'opportunities' => $items->toArray(),
                                        'total' => $total,
                                        'shown' => $items->count(),
                                        'view_all_url' => $viewAllUrl,
                                    ])->render()
                                    : '';

                                $renderCache[$sig] = [
                                    'html' => $html,
                                    'total' => $total,
                                    'count' => $items->count(),
                                ];
                            }

                            $cached = $renderCache[$sig];

                            if ($cached['count'] === 0) {
                                Log::debug('[NewsletterService] No matching opportunities for user, skipping', [
                                    'user_id' => $user->id,
                                    'email' => $user->email,
                                ]);

                                continue;
                            }

                            $this->dispatchNewsletterEmail($user, $cached['html'], $cached['count'], $cached['total']);
                            $stats['sent']++;

                            Log::debug('[NewsletterService] Opportunity newsletter dispatched', [
                                'user_id' => $user->id,
                                'email' => $user->email,
                                'opportunity_count' => $cached['count'],
                                'total_open' => $cached['total'],
                            ]);
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
                });

            Log::info('[NewsletterService] Weekly opportunity newsletter send completed', [
                'processed' => $stats['processed'],
                'sent' => $stats['sent'],
                'failed' => $stats['failed'],
                'render_cache_entries' => count($renderCache),
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
     * Dispatch newsletter email job to queue with pre-rendered HTML.
     *
     * The HTML is rendered once per opt-out signature and reused across all
     * users who share the same signature. Per-user personalisation
     * (UNSUB, UPDATE_PROFILE, user_name) lives in Mandrill template variables,
     * not in the HTML block.
     */
    private function dispatchNewsletterEmail(User $user, string $opportunitiesHtml, int $opportunityCount, int $total): void
    {
        $viewAllUrl = route('opportunity.list');

        $variables = [
            'UNSUB' => route('unsubscribe.show', $user->id),
            'UPDATE_PROFILE' => route('notification.preferences.index'),
            'user_name' => $user->name ?? $user->email,
            'opportunity_count' => $opportunityCount,
            'view_all_url' => $viewAllUrl,
        ];

        $options = [
            'template_content' => [
                ['name' => 'opportunities_section', 'content' => $opportunitiesHtml],
            ],
        ];

        SendTransactionalEmail::dispatch(
            'opportunity.newsletter.weekly',
            $user,
            $variables,
            $options
        );

        Log::info('[NewsletterService] Opportunity newsletter email dispatched to queue', [
            'user_id' => $user->id,
            'email' => $user->email,
            'opportunity_count' => $opportunityCount,
            'total_open' => $total,
            'template' => 'opportunity.newsletter.weekly',
        ]);
    }

    /**
     * Get newsletter statistics for monitoring.
     *
     * @return array{subscribed_users: int, last_send: mixed, last_send_stats: array}
     */
    public function getNewsletterStats(): array
    {
        $subscribedUsers = User::query()
            ->where('email_notifications_enabled', true)
            ->where('is_blocked', false)
            ->count();

        return [
            'subscribed_users' => $subscribedUsers,
            'last_send' => cache()->get('newsletter:last_send_date'),
            'last_send_stats' => cache()->get('newsletter:last_send_stats', []),
        ];
    }
}
