<?php

namespace App\Http\Controllers\Request;

use App\Models\SystemNotification;
use App\Services\Request\RequestContextService;
use App\Services\RequestService;
use App\Services\UserService;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ExpressInterestController extends BaseRequestController
{
    public function __construct(
        private readonly UserService $userService,
        private readonly RequestService $requestService,
        RequestContextService $contextService
    ) {
        parent::__construct($contextService);
    }

    /**
     * Express interest in a request
     */
    public function __invoke(Request $request, int $requestId)
    {
        // Validate request existence
        try {
            $user = Auth::user();
            $ocdRequest = $this->requestService->findRequest($requestId);
            if ($user->can('express-interest', $ocdRequest)) {
                $this->createSystemNotificationForAdmins($user, $ocdRequest);

                return back()->with(
                    'success',
                    'Your interest has been expressed successfully. The CDF Secretariat will follow up within three business days.'
                );
            } else {
                throw new Exception('Unauthorized action.');
            }
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
                'title' => 'Express interest in a request',
                'description' => sprintf(
                    'User <span class="font-bold">%s</span> has expressed interest in request <a href="%s" target="_blank" class="font-bold underline">%s</a> ',
                    $partner->name,
                    route('request.show', ['id' => $ocdRequest->id]),
                    $ocdRequest->detail->capacity_development_title
                ),
                'is_read' => false,
            ]);
        }
    }
}
