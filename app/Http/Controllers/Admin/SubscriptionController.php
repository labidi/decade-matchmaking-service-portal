<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Request as OCDRequest;
use App\Models\User;
use App\Services\SubscriptionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
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

        return Inertia::render('Admin/Subscriptions/Index', [
            'subscriptions' => $subscriptions,
            'stats' => $stats,
        ]);
    }

    /**
     * Subscribe a user to a request (admin action)
     */
    public function subscribeUser(Request $request): JsonResponse
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'request_id' => 'required|exists:requests,id',
        ]);

        try {
            $user = User::findOrFail($request->input('user_id'));
            $ocdRequest = OCDRequest::findOrFail($request->input('request_id'));
            $admin = auth()->user();

            $subscription = $this->subscriptionService->adminSubscribeUser($admin, $user, $ocdRequest);

            return response()->json([
                'success' => true,
                'message' => 'User successfully subscribed to request',
                'subscription' => $subscription,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Unsubscribe a user from a request (admin action)
     */
    public function unsubscribeUser(Request $request): JsonResponse
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'request_id' => 'required|exists:requests,id',
        ]);

        try {
            $user = User::findOrFail($request->input('user_id'));
            $ocdRequest = OCDRequest::findOrFail($request->input('request_id'));

            $success = $this->subscriptionService->unsubscribe($user, $ocdRequest);

            return response()->json([
                'success' => $success,
                'message' => $success ? 'User successfully unsubscribed from request' : 'Subscription not found',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Show subscribers for a specific request
     */
    public function requestSubscribers(OCDRequest $request): Response
    {
        $subscribers = $this->subscriptionService->getRequestSubscribers($request);

        return Inertia::render('Admin/Subscriptions/RequestSubscribers', [
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

        return Inertia::render('Admin/Subscriptions/UserSubscriptions', [
            'user' => $user,
            'subscriptions' => $subscriptions,
        ]);
    }

    /**
     * Bulk unsubscribe users from a request
     */
    public function bulkUnsubscribe(Request $request): JsonResponse
    {
        $request->validate([
            'request_id' => 'required|exists:requests,id',
            'user_ids' => 'required|array',
            'user_ids.*' => 'exists:users,id',
        ]);

        try {
            $ocdRequest = OCDRequest::findOrFail($request->input('request_id'));
            $admin = auth()->user();
            $userIds = $request->input('user_ids');

            $unsubscribedCount = $this->subscriptionService->bulkUnsubscribeFromRequest(
                $admin,
                $ocdRequest,
                $userIds
            );

            return response()->json([
                'success' => true,
                'message' => "Successfully unsubscribed {$unsubscribedCount} users from request",
                'unsubscribed_count' => $unsubscribedCount,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }
}
