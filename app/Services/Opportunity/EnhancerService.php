<?php

namespace App\Services\Opportunity;

use App\Enums\OpportunityStatus;
use App\Models\Opportunity;

class EnhancerService
{

    public static function enhanceOpportunity(Opportunity $opportunity): array
    {
        $opportunityData = $opportunity->toArray();

        if (isset($opportunity['status'])) {
            $opportunityData['status'] = [
                'label' => $opportunity->status->label(),
                'value' => $opportunity->status->value,
            ] ;
        }
        if (isset($opportunity['type'])) {
            $opportunityData['type'] = $opportunity->type->label();
        }

        if (isset($opportunity['target_audience'])) {
            foreach ($opportunity->target_audience as $key => $audience) {
                $opportunityData['target_audience'][$key] = [
                    'label' => $audience->label(),
                    'value' => $audience->value,
                ];
            }
        }

/*        if (isset($opportunity['implementation_location'])) {
            $opportunityData['implementation_location'] = array_map(function ($location) {
                return [
                    'label' => $location['label'] ?? '',
                    'value' => $location['value'] ?? '',
                ];
            }, $opportunity->implementation_location);
        }*/

        return $opportunityData;
    }
}
