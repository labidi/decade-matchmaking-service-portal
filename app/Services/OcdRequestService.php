<?php

namespace App\Services;

use App\Models\Request as OCDRequest;
use App\Models\Request\RequestStatus;
use App\Models\User;

class OcdRequestService
{
    public function saveDraft(User $user, array $data, ?OCDRequest $request = null): OCDRequest
    {
        if (!$request) {
            $request = new OCDRequest();
            $request->status()->associate(RequestStatus::getDraftStatus());
            $request->user()->associate($user);
        }
        $request->request_data = json_encode($data);
        $request->save();
        return $request;
    }

    public function storeRequest(User $user, array $data, ?OCDRequest $request = null): OCDRequest
    {
        if (!$request) {
            $request = new OCDRequest();
            $request->user()->associate($user);
        }
        $request->request_data = json_encode($data);
        $request->status()->associate(RequestStatus::getUnderReviewStatus());
        $request->save();
        return $request;
    }
}
