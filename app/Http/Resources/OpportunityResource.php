<?php

namespace App\Http\Resources;

use App\Enums\Common\Country;
use App\Enums\Common\Ocean;
use App\Enums\Common\Region;
use App\Enums\Opportunity\CoverageActivity;
use App\Models\Opportunity;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\Gate;
use Carbon\Carbon;

/**
 * @mixin Opportunity
 */
class OpportunityResource extends JsonResource
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
            'title' => $this->title,
            'type' => [
                'value' => $this->type->value,
                'label' => $this->type->label(),
            ],
            'status' => [
                'value' => $this->status->value,
                'label' => $this->status->label(),
            ],
            'closing_date' => Carbon::parse($this->closing_date)->toDateString(),
            'coverage_activity' => [
                'value' => $this->coverage_activity->value,
                'label' => $this->coverage_activity->label(),
            ],
            'implementation_location' => $this->transformEnumArray($this->implementation_location),
            'target_audience' => $this->transformEnumArray($this->target_audience),
            'target_audience_other' => $this->target_audience_other,
            'target_languages' => $this->transformEnumArray($this->target_languages),
            'target_languages_other' => $this->target_languages_other,
            'summary' => $this->summary,
            'url' => $this->url,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'key_words' => explode(',', $this->key_words),
            // Relationships
            'user' => $this->whenLoaded('user'),
        ];


        $baseData['permissions'] = [
            'can_view' => $request->user()->can('view', [Opportunity::class, $this->resource]),
            'can_edit' => $request->user()->can('update', [Opportunity::class, $this->resource]),
            'can_delete' => $request->user()->can('delete', [Opportunity::class, $this->resource]),
            'can_approve' => $request->user()->can('approve', [Opportunity::class, $this->resource]),
            'can_apply' => $request->user()->can('apply', [Opportunity::class, $this->resource]),
        ];

        return $baseData;
    }

    /**
     * Transform an enum array to value/label format.
     *
     * @param mixed $enumArray
     * @return array<int, array<string, string>>
     */
    private function transformEnumArray($enumArray): array
    {
        if (!$enumArray) {
            return [];
        }

        $result = [];
        foreach ($enumArray as $enum) {
            $result[] = [
                'value' => $enum->value,
                'label' => $enum->label(),
            ];
        }

        return $result;
    }
}
