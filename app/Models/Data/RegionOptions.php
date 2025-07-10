<?php

namespace App\Models\Data;

class RegionOptions
{
    /**
     * Get all region options
     */
    public static function getOptions(): array
    {
        return [
            ['value' => 'Africa', 'label' => 'Africa'],
            ['value' => 'Asia and the Pacific', 'label' => 'Asia and the Pacific'],
            ['value' => 'Europe', 'label' => 'Europe'],
            ['value' => 'Latin America and the Caribbean', 'label' => 'Latin America and the Caribbean'],
            ['value' => 'North America', 'label' => 'North America'],
            ['value' => 'Middle East', 'label' => 'Middle East'],
            ['value' => 'Polar Regions (Arctic and Antarctic)', 'label' => 'Polar Regions (Arctic and Antarctic)'],
        ];
    }

    /**
     * Get label for a region value
     */
    public static function getLabel(string $value): string
    {
        $options = self::getOptions();
        
        foreach ($options as $option) {
            if ($option['value'] === $value) {
                return $option['label'];
            }
        }
        
        return $value; // Return original value if not found
    }
} 