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
use App\Models\Request;
use Exception;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class RequestFormController extends BaseRequestController
{
    /**
     * Show the form for creating a new resource or editing an existing one.
     */
    public function form(?int $id = null): Response|RedirectResponse
    {
        // Check if this is edit mode (ID provided) or create mode (no ID)
        $isEditMode = !is_null($id);
        if ($isEditMode) {
            $request = $this->service->findRequest($id, Auth::user());
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
            $requestTitle = $this->service->getRequestTitle($request);
            $data = array_merge($data, [
                'title' => 'Request : ' . $requestTitle,
                'banner' => $this->buildBanner(
                    'Request : ' . $requestTitle,
                    'Edit my request details here.'
                ),
                'request' => $request->toArray(),
                'breadcrumbs' => [
                    ['name' => 'Home', 'url' => route('user.home')],
                    ['name' => 'Requests', 'url' => route('request.me.list')],
                    [
                        'name' => 'Edit Request #' . $request->id,
                        'url' => route('request.edit', ['id' => $request->id])
                    ],
                ],
            ]);
        } else {
            // Create mode - new request
            $data = array_merge($data, [
                'title' => 'Create a new request',
                'banner' => [
                    'title' => 'Create a new request',
                    'description' => 'Create a new request to get started.',
                    'image' => '/assets/img/sidebar.png',
                ],
                'breadcrumbs' => [
                    ['name' => 'Home', 'url' => route('user.home')],
                    ['name' => 'Requests', 'url' => route('request.me.list')],
                    ['name' => 'Create Request', 'url' => route('request.create')],
                ],
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
            if ($mode === 'draft') {
                return $this->saveRequestAsDraft($request, $id);
            }
            return $this->storeRequest($request, $id);
        } catch (Exception $e) {
            if ($id) {
                return to_route('request.edit', ['id' => $id])->with('error', $e->getMessage());
            }
            return to_route('request.create')->with('error', $e->getMessage());
        }
    }

    /**
     * Save request as draft
     * @throws Exception
     */
    private function saveRequestAsDraft(StoreRequest $request, $id = null): RedirectResponse
    {
        $userRequest = $id ? Request::find($id) : null;
        if ($id && !$userRequest) {
            throw new Exception('Request not found');
        }

        $userRequest = $this->service->saveDraft($request->user(), $request->all(), $userRequest);

        return to_route('request.edit', ['id' => $userRequest->id])->with([
            'success' => 'Request draft saved successfully.',
        ]);
    }

    /**
     * Store a newly created resource in storage.
     * @throws Exception
     */
    private function storeRequest(StoreRequest $request, $id = null): RedirectResponse
    {
        $validated = $request->validated();

        $userRequest = $id ? Request::find($id) : null;
        if ($id && !$userRequest) {
            throw new Exception('Request not found');
        }

        $request = $this->service->storeRequest($request->user(), $validated, $userRequest);

        return to_route('request.me.list')->with([
            'success' => 'Request submitted successfully.',
        ]);
    }
}
