<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Request as OCDRequest;
use App\Services\RequestService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Services\ExportService;
use Symfony\Component\HttpFoundation\StreamedResponse;
use App\Models\User;

class OcdRequestController extends Controller
{
    public function __construct(private RequestService $service)
    {
    }

    public function list(Request $httpRequest)
    {
        $sortField = $httpRequest->get('sort', 'created_at');
        $sortOrder = $httpRequest->get('order', 'desc');
        $searchUser = $httpRequest->get('user');
        $searchTitle = $httpRequest->get('title');

        // Validate sort field to prevent SQL injection
        $allowedSortFields = ['id', 'created_at', 'status_id', 'user_id'];
        if (!in_array($sortField, $allowedSortFields)) {
            $sortField = 'created_at';
        }

        // Validate sort order
        $sortOrder = in_array(strtolower($sortOrder), ['asc', 'desc']) ? strtolower($sortOrder) : 'desc';

        $query = OCDRequest::with(['status', 'detail', 'user', 'offers']);

        // Apply search filters
        if ($searchUser) {
            $query->whereHas('user', function ($q) use ($searchUser) {
                $q->where('name', 'like', '%' . $searchUser . '%');
            });
        }

        if ($searchTitle) {
            $query->whereHas('detail', function ($q) use ($searchTitle) {
                $q->where('capacity_development_title', 'like', '%' . $searchTitle . '%');
            });
        }

        // Apply sorting with special handling for user relationship
        if ($sortField === 'user_id') {
            $query->join('users', 'requests.user_id', '=', 'users.id')
                  ->orderBy('users.name', $sortOrder)
                  ->select('requests.*');
        } else {
            $query->orderBy($sortField, $sortOrder);
        }

        // If not sorting by created_at, add it as a secondary sort for consistency
        if ($sortField !== 'created_at') {
            $query->orderBy('created_at', 'desc');
        }

        $requests = $query->paginate(10)->appends($httpRequest->only(['sort', 'order', 'user', 'title']));

        return Inertia::render('Admin/Request/List', [
            'title' => 'My requests',
            'requests' => $requests,
            'currentSort' => [
                'field' => $sortField,
                'order' => $sortOrder,
            ],
            'currentSearch' => [
                'user' => $searchUser ?? '',
                'title' => $searchTitle ?? '',
            ],
        ]);
    }

    public function exportCsv(ExportService $exportService): StreamedResponse
    {
        return $exportService->exportRequestsCsv();
    }
}
