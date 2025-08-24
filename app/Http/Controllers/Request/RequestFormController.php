<?php

namespace App\Http\Controllers\Request;

use App\Enums\Common\Country;
use App\Enums\Common\Language;
use App\Enums\Common\TargetAudience;
use App\Enums\Common\YesNo;
use App\Enums\Opportunity\DeliveryFormat;
use App\Enums\Request\ProjectStage;
use App\Enums\Request\RelatedActivity;
use App\Enums\Request\SubTheme;
use App\Enums\Request\SupportType;
use App\Http\Requests\StoreRequest;
use App\Http\Resources\RequestResource;
use App\Models\Request;
use App\Services\RequestService;
use Exception;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class RequestFormController extends BaseRequestController
{
    public function __construct(
        private readonly RequestService $service
    ) {
    }

    /**
     * Show the form for creating a new resource or editing an existing one.
     */
    public function form(?int $id = null): Response|RedirectResponse
    {
        // Check if this is edit mode (ID provided) or create mode (no ID)
        $isEditMode = !is_null($id);
        if ($isEditMode) {
            $request = $this->service->findRequest($id);
            // Edit mode - fetch the existing request
            if (!$request) {
                return to_route('request.me.list')->with('error', 'Request not found.');
            }
        }
        $data = [
            'formOptions' => [
                'subthemes' => SubTheme::getOptions(),
                'support_types' => SupportType::getOptions(),
                'related_activity' => RelatedActivity::getOptions(),
                'delivery_format' => DeliveryFormat::getOptions(),
                'target_audience' => TargetAudience::getOptions(),
                'target_languages' => Language::getOptions(),
                'delivery_countries' => Country::getOptions(),
                'project_stage' => ProjectStage::getOptions(),
                'yes_no' => YesNo::getOptions(),
            ],
        ];
        if ($isEditMode) {
            $requestTitle = $request->detail?->capacity_development_title ?? 'Untitled';
            $data = array_merge($data, [
                'title' => 'Request : ' . $requestTitle,
                'banner' => $this->buildBanner(
                    'Request : ' . $requestTitle,
                    'Edit my request details here.'
                ),
                'request' => new RequestResource($request)
            ]);
        } else {
            // Create mode - new request
            $data = array_merge($data, [
                'title' => 'Create a new request',
                'banner' => [
                    'title' => 'Create a new request',
                    'description' => 'Create a new request to get started.',
                    'image' => '/assets/img/sidebar.png',
                ]
            ]);
        }

        return Inertia::render('Request/Create', $data);
    }

    /**
     * Handle all form submissions (store, submit, draft)
     */
    public function submit(StoreRequest $request, ?int $id = null): RedirectResponse
    {
        $mode = $request->input('mode', 'submit');
        try {
            $request = $this->service->storeRequest(
                $request->user(),
                $request->validated(),
                $id ? $this->service->findRequest($id) : null,
                $mode
            );
            return match ($mode) {
                'draft' => to_route('request.edit', ['id' => $request->id])->with(
                    'success',
                    'Request draft saved successfully.'
                ),
                default => to_route('request.me.list')->with('success', 'Request submitted successfully.'),
            };
        } catch (Exception $e) {
            if ($id) {
                return to_route('request.edit', ['id' => $id])->with('error', $e->getMessage());
            }
            return to_route('request.create')->with('error', $e->getMessage());
        }
    }
}
