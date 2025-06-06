<?php

namespace App\Http\Controllers\Partner;

use App\Models\Request as OCDRequest;
use Illuminate\Http\Request;
use App\Models\Request\RequestStatus;
use Inertia\Inertia;
use Inertia\Response;
use App\Http\Controllers\Controller;
use Illuminate\Database\Eloquent\Builder;


class RequestController extends Controller
{


    public function matchedRequest(){
        $request = OCDRequest::with('status')->whereHas(
            'status',
            function (Builder $query) {
                $query->orWhere('status_code', 'match_made');
            }
        )->get();

        return Inertia::render('Partner/Request/List', [
            'title' => 'My requests',
            'banner' => [
                'title' => 'List of My Matched Requests',
                'description' => 'View requests for training and workshops.',
                'image' => '/assets/img/sidebar.png',
            ],
            'requests' => $request,
            'breadcrumbs' => [
                ['name' => 'Dashboard', 'url' => route('dashboard')],
                ['name' => 'Requests', 'url' => route('partner.request.list')],
            ],
        ]);
    }
}
