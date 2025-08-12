<?php

namespace App\Http\Controllers\Request;

use Illuminate\Http\Request;
use App\Mail\ExpressInterest;
use App\Models\Request as OCDRequest;
use App\Services\UserService;
use Illuminate\Support\Facades\Mail;
use Exception;

class ExpressInterestController extends BaseRequestController
{
    public function __construct(
        private UserService $userService
    ) {
        // Call parent constructor to initialize service
        parent::__construct(app(\App\Services\RequestService::class));
    }

    /**
     * Express interest in a request
     */
    public function __invoke(Request $request, int $requestId)
    {
        try {
            $ocdRequest = OCDRequest::findOrFail($requestId);
            $interestedUser = $request->user();

            // Get admin recipients using UserService
            $admins = $this->userService->getAllAdmins();

            // Send emails to admins
            foreach ($admins as $admin) {
                $recipient = [
                    'email' => $admin->email,
                    'name' => $admin->name,
                    'type' => 'admin'
                ];

                Mail::to($recipient['email'])
                    ->send(new ExpressInterest($ocdRequest, $interestedUser, $recipient));
            }

            // Log the activity
            \Illuminate\Support\Facades\Log::info('Express interest emails sent', [
                'request_id' => $requestId,
                'interested_user_id' => $interestedUser->id,
                'admin_count' => $admins->count()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Your interest has been expressed successfully. The CDF Secretariat will follow up within three business days.'
            ]);
        } catch (Exception $e) {
            \Illuminate\Support\Facades\Log::error('Failed to express interest', [
                'request_id' => $requestId,
                'user_id' => $request->user()->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to express interest. Please try again.'
            ], 500);
        }
    }
}