<?php

namespace App\Models\Data;

class OceanOptions
{
    /**
     * Get all ocean options
     */
    public static function getOptions(): array
    {
        return [
            ['value' => 'Atlantic Ocean', 'label' => 'Atlantic Ocean'],
            ['value' => 'Pacific Ocean', 'label' => 'Pacific Ocean'],
            ['value' => 'Indian Ocean', 'label' => 'Indian Ocean'],
            ['value' => 'Arctic Ocean', 'label' => 'Arctic Ocean'],
            ['value' => 'Southern Ocean', 'label' => 'Southern Ocean'],
            ['value' => 'Mediterranean Sea', 'label' => 'Mediterranean Sea'],
            ['value' => 'Caspian Sea', 'label' => 'Caspian Sea'],
        ];
    }

    /**
     * Get label for an ocean value
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