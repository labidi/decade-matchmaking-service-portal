<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Request as OCDRequest;
use App\Models\User;
use App\Services\SubscriptionService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class SubscriptionController extends Controller
{
    public function __construct(
        private readonly SubscriptionService $subscriptionService
    ) {
    }

    /**
     * Display subscription management page
     */
    public function index(Request $request): Response
    {
        $subscriptions = $this->subscriptionService->getAllSubscriptions();
        $stats = $this->subscriptionService->getSubscriptionStats();

        // Format users for SelectField dropdown
        $users = User::select('id', 'name', 'email')
            ->where('is_blocked', false)
            ->orderBy('name')
            ->get()
            ->map(fn($user) => [
                'value' => $user->id,
                'label' => "{$user->name} ({$user->email})"
            ]);

        // Format requests for SelectField dropdown
        $requests = OCDRequest::select('id', 'status_id', 'user_id')
            ->with([
                'detail:request_id,capacity_development_title',
                'user:id,name',
                'status:id,status_code'
            ])
            ->whereHas('status', fn($q) =>
                $q->whereNotIn('status_code', ['draft', 'deleted'])
            )
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn($req) => [
                'value' => $req->id,
                'label' => ($req->detail->capacity_development_title ?? 'Untitled') .
                           " (by {$req->user->name})"
            ]);

        return Inertia::render('admin/Subscriptions/Index', [
            'subscriptions' => $subscriptions,
            'stats' => $stats,
            'users' => $users,
            'requests' => $requests,
        ]);
    }

    /**
     * Subscribe a user to a request (admin action)
     */
    public function subscribeUser(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'request_id' => 'required|exists:requests,id',
        ]);

        try {
            $user = User::findOrFail($validated['user_id']);
            $ocdRequest = OCDRequest::findOrFail($validated['request_id']);
            $admin = auth()->user();

            // Check if already subscribed
            if ($this->subscriptionService->isUserSubscribed($user, $ocdRequest)) {
                return back()->with('warning', 'User is already subscribed to this request.');
            }

            $subscription = $this->subscriptionService->adminSubscribeUser($admin, $user, $ocdRequest);

            // Log the admin action
            Log::info('Admin subscription created', [
                'admin_id' => $admin->id,
                'user_id' => $user->id,
                'request_id' => $ocdRequest->id,
                'subscription_id' => $subscription->id,
            ]);

            return to_route('admin.subscriptions.index')->with(
                'success',
                sprintf(
                    'User "%s" has been successfully subscribed to request "%s".',
                    $user->name,
                    $ocdRequest->detail->capacity_development_title ?? 'Untitled Request'
                )
            );
        } catch (\Exception $e) {
            Log::error('Failed to subscribe user', [
                'admin_id' => auth()->id(),
                'user_id' => $validated['user_id'] ?? null,
                'request_id' => $validated['request_id'] ?? null,
                'error' => $e->getMessage(),
            ]);

            return back()
                ->withInput()
                ->withErrors(['general' => 'Failed to subscribe user: ' . $e->getMessage()]);
        }
    }

    /**
     * Unsubscribe a user from a request (admin action)
     */
    public function unsubscribeUser(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'request_id' => 'required|exists:requests,id',
        ]);

        try {
            $user = User::findOrFail($validated['user_id']);
            $ocdRequest = OCDRequest::findOrFail($validated['request_id']);

            $success = $this->subscriptionService->unsubscribe($user, $ocdRequest);

            if (!$success) {
                return back()->with(
                    'warning',
                    'Subscription not found. The user may have already been unsubscribed.'
                );
            }

            // Log the admin action
            Log::info('Admin unsubscribed user', [
                'admin_id' => auth()->id(),
                'user_id' => $user->id,
                'request_id' => $ocdRequest->id,
            ]);

            return to_route('admin.subscriptions.index')->with(
                'success',
                sprintf(
                    'User "%s" has been successfully unsubscribed from request "%s".',
                    $user->name,
                    $ocdRequest->detail->capacity_development_title ?? 'Untitled Request'
                )
            );
        } catch (\Exception $e) {
            Log::error('Failed to unsubscribe user', [
                'admin_id' => auth()->id(),
                'user_id' => $validated['user_id'] ?? null,
                'request_id' => $validated['request_id'] ?? null,
                'error' => $e->getMessage(),
            ]);

            return back()
                ->withInput()
                ->withErrors(['general' => 'Failed to unsubscribe user: ' . $e->getMessage()]);
        }
    }

    /**
     * Show subscribers for a specific request
     */
    public function requestSubscribers(OCDRequest $request): Response
    {
        $subscribers = $this->subscriptionService->getRequestSubscribers($request);

        return Inertia::render('admin/Subscriptions/RequestSubscribers', [
            'request' => $request->load('user', 'status', 'detail'),
            'subscribers' => $subscribers,
        ]);
    }

    /**
     * Show subscriptions for a specific user
     */
    public function userSubscriptions(User $user): Response
    {
        $subscriptions = $this->subscriptionService->getUserSubscriptions($user);

        return Inertia::render('admin/Subscriptions/UserSubscriptions', [
            'user' => $user,
            'subscriptions' => $subscriptions,
        ]);
    }

    /**
     * Bulk unsubscribe users from a request
     */
    public function bulkUnsubscribe(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'request_id' => 'required|exists:requests,id',
            'user_ids' => 'required|array|min:1',
            'user_ids.*' => 'exists:users,id',
        ]);

        try {
            $ocdRequest = OCDRequest::findOrFail($validated['request_id']);
            $admin = auth()->user();
            $userIds = $validated['user_ids'];

            $unsubscribedCount = $this->subscriptionService->bulkUnsubscribeFromRequest(
                $admin,
                $ocdRequest,
                $userIds
            );

            if ($unsubscribedCount === 0) {
                return back()->with(
                    'warning',
                    'No users were unsubscribed. They may have already been unsubscribed.'
                );
            }

            // Log the bulk admin action
            Log::info('Admin bulk unsubscribed users', [
                'admin_id' => $admin->id,
                'request_id' => $ocdRequest->id,
                'user_ids' => $userIds,
                'unsubscribed_count' => $unsubscribedCount,
            ]);

            return to_route('admin.subscriptions.index')->with(
                'success',
                sprintf(
                    'Successfully unsubscribed %d user%s from request "%s".',
                    $unsubscribedCount,
                    $unsubscribedCount !== 1 ? 's' : '',
                    $ocdRequest->detail->capacity_development_title ?? 'Untitled Request'
                )
            );
        } catch (\Exception $e) {
            Log::error('Failed to bulk unsubscribe users', [
                'admin_id' => auth()->id(),
                'request_id' => $validated['request_id'] ?? null,
                'user_ids' => $validated['user_ids'] ?? [],
                'error' => $e->getMessage(),
            ]);

            return back()
                ->withInput()
                ->withErrors(['general' => 'Failed to unsubscribe users: ' . $e->getMessage()]);
        }
    }
}
