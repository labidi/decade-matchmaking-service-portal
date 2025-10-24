<?php

namespace App\Http\Controllers\Request;

use App\Models\SystemNotification;
use App\Services\RequestService;
use Illuminate\Http\Request;
use App\Mail\ExpressInterest;
use App\Models\Request as OCDRequest;
use App\Services\UserService;
use Illuminate\Support\Facades\Mail;
use Exception;

class ExpressInterestController extends BaseRequestController
{
    public function __construct(
        private readonly UserService    $userService,
        private readonly RequestService $requestService
    )
    {
    }

    /**
     * Express interest in a request
     */
    public function __invoke(Request $request, int $requestId)
    {
        // Validate request existence
        try {
            $ocdRequest = $this->requestService->findRequest($requestId);
            $this->createSystemNotificationForAdmins($partner, $ocdRequest);
            return back()->with(
                'success',
                'Your interest has been expressed successfully. The CDF Secretariat will follow up within three business days.'
            );
        } catch (Exception $e) {
            return back()->with(
                'error',
                'Failed to express interest. Please try again.'
            );
        }
    }

    private function createSystemNotificationForAdmins($partner, $ocdRequest)
    {
        foreach ($this->userService->getAllAdmins() as $admin) {
            SystemNotification::create([
                'user_id' => $admin->id,
                'title' => 'this user has expressed interest  Interest in this request ',
                'description' => '',
                'is_read' => false,
            ]);
        }
    }

    private function sentConfirmationEmailToUser($user)
    {

    }
}
