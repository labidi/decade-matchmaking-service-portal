<?php

namespace App\Http\Resources;

use App\Enums\Common\Country;
use App\Enums\Common\Ocean;
use App\Enums\Common\Region;
use App\Models\Opportunity;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Gate;

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
            'status' => $this->status,
            'closing_date' => $this->closing_date,
            'coverage_activity' => [
                'value' => $this->coverage_activity->value,
                'label' => $this->coverage_activity->label(),
            ],
            'implementation_location' => $this->transformImplementationLocation(),
            'target_audience' => $this->transformEnumArray($this->target_audience),
            'target_audience_other' => $this->target_audience_other,
            'summary' => $this->summary,
            'url' => $this->url,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'key_words' => explode(',', $this->key_words),
            // Relationships
            'user' => $this->whenLoaded('user'),
        ];

//        if()

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
     * Transform implementation location based on coverage activity.
     *
     * @return mixed
     */
    private function transformImplementationLocation(): mixed
    {
        $locations = $this->resource->getImplementationLocationAsArray();
        
        // Handle global coverage
        if ($this->resource->isGlobal()) {
            return 'Global';
        }

        // Transform each location to value/label format
        $transformed = array_map(
            fn($location) => $this->transformSingleLocation($location),
            $locations
        );

        // Return single value if only one location, array otherwise
        return count($transformed) === 1 ? $transformed[0] : $transformed;
    }

    /**
     * Transform a single location enum to value/label format.
     *
     * @param mixed $location
     * @return array<string, string>|string
     */
    private function transformSingleLocation(mixed $location): array|string
    {
        if (is_string($location)) {
            return $location;
        }

        if ($location instanceof Country || $location instanceof Region || $location instanceof Ocean) {
            return [
                'value' => $location->value,
                'label' => $location->label(),
            ];
        }

        return is_string($location) ? $location : '';
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
