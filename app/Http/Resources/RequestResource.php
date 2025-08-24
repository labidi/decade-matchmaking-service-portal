<?php

namespace App\Http\Resources;

use App\Models\Request as RequestModel;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Gate;

/**
 * @mixin RequestModel
 */
class RequestResource extends JsonResource
{

    public static $wrap = null;

    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $baseData = [
            'id' => $this->id,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            // Relationships
            'active_offer' => $this->whenLoaded('activeOffer'),
            'status' => $this->whenLoaded('status'),
            'user' => $this->whenLoaded('user'),
            'matched_partner' => $this->whenLoaded('matchedPartner'),
            'offers' => $this->whenLoaded('offers'),
            'detail' => new DetailResource($this->whenLoaded('detail')),
            'subscriptions' => $this->whenLoaded('subscriptions'),
            'subscribers' => $this->whenLoaded('subscribers'),
        ];

        $baseData['permissions'] = [
            'can_view' => $request->user()->can('view', [RequestModel::class, $this->resource]),
            'can_edit' => $request->user()->can('update', [RequestModel::class, $this->resource]),
            'can_delete' => $request->user()->can('delete', [RequestModel::class, $this->resource]),
            'can_manage_offers' => $request->user()->can('manageOffers', [RequestModel::class, $this->resource]),
            'can_update_status' => $request->user()->can('updateStatus', [RequestModel::class, $this->resource]),
            'can_export_pdf' => $request->user()->can('exportPdf', [RequestModel::class, $this->resource]),
            'can_express_interest' => $request->user()->can('expressInterest', [RequestModel::class, $this->resource]),
        ];

        return $baseData;
    }

}
