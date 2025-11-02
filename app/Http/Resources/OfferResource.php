<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\Request\Offer;
use App\Services\Actions\OfferActionProvider;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Offer
 */
class OfferResource extends JsonResource
{
    public static $wrap = null;

    public function __construct(
        $resource
    ) {
        parent::__construct($resource);
    }

    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $baseData = [
            'id' => $this->id,
            'description' => $this->description,
            'status' => [
                'value' => $this->status->value,
                'label' => $this->status->label(),
            ],
            'is_accepted' => $this->is_accepted,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,

            // Relationships
            'request' => $this->whenLoaded('request', function () {
                return new RequestResource($this->request);
            }),
            'matched_partner' => $this->whenLoaded('matchedPartner'),
            'documents' => $this->whenLoaded('documents', function () {
                return DocumentResource::collection($this->documents);
            }),
        ];

        // Determine context from route
        $context = str_starts_with($request->route()?->getPrefix() ?? '', '/admin') ? 'admin' : 'user';

        // Get available actions using simplified Action Provider Pattern
        $actionProvider = app(OfferActionProvider::class);
        $baseData['actions'] = $actionProvider->getActions(
            $this->resource,
            $request->user(),
            $context
        );

        // Keep legacy permissions for backward compatibility during migration
        // TODO: Remove this after frontend migration is complete
        $baseData['permissions'] = [
            'can_view' => $request->user()->can('view', [Offer::class, $this->resource]),
            'can_edit' => $request->user()->can('update', [Offer::class, $this->resource]),
            'can_enable' => $request->user()->can('canEnableOrDisable', [Offer::class, $this->resource]),
            'can_disable' => $request->user()->can('canEnableOrDisable', [Offer::class, $this->resource]),
            'can_delete' => $request->user()->can('delete', [Offer::class, $this->resource]),
            'can_accept' => $request->user()->can('accept', [Offer::class, $this->resource]),
            'can_reject' => $request->user()->can('reject', [Offer::class, $this->resource]),
            'can_request_clarifications' => $request->user()->can(
                'requestClarifications',
                [Offer::class, $this->resource]
            ),
            'can_manage_documents' => $request->user()->can('manageDocuments', [Offer::class, $this->resource]),
        ];

        return $baseData;
    }
}
