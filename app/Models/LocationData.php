<?php

namespace App\Models;

use App\Models\Data\CountryOptions;
use App\Models\Data\RegionOptions;
use App\Models\Data\OceanOptions;
use App\Models\Data\TargetAudienceOptions;

class LocationData
{
    /**
     * Get implementation location options based on coverage activity
     */
    public static function getImplementationLocationOptions(string $coverageActivity): array
    {
        return match ($coverageActivity) {
            'country' => CountryOptions::getOptions(),
            'Regions' => RegionOptions::getOptions(),
            'Ocean-based' => OceanOptions::getOptions(),
            'Global' => [['value' => 'Global', 'label' => 'Global']],
            default => [],
        };
    }

    /**
     * Get label for implementation location value
     */
    public static function getImplementationLocationLabel(string $value, string $coverageActivity): string
    {
        return match ($coverageActivity) {
            'country' => CountryOptions::getLabel($value),
            'Regions' => RegionOptions::getLabel($value),
            'Ocean-based' => OceanOptions::getLabel($value),
            'Global' => $value === 'Global' ? 'Global' : $value,
            default => $value,
        };
    }
}
