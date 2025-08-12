<?php

namespace App\Models;

use App\Enums\Country;
use App\Enums\Region;
use App\Enums\Ocean;
use App\Enums\TargetAudience;

class LocationData
{
    /**
     * Get implementation location options based on coverage activity
     */
    public static function getImplementationLocationOptions(string $coverageActivity): array
    {
        return match ($coverageActivity) {
            'country' => Country::getOptions(),
            'Regions' => Region::getOptions(),
            'Ocean-based' => Ocean::getOptions(),
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
            'country' => Country::getLabelByValue($value),
            'Regions' => Region::getLabelByValue($value),
            'Ocean-based' => Ocean::getLabelByValue($value),
            'Global' => $value === 'Global' ? 'Global' : $value,
            default => $value,
        };
    }
}
