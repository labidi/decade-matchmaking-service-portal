<?php

namespace App\Models\Data;

class DeliveryFormatOptions
{
    /**
     * Get all delivery format options
     */
    public static function getOptions(): array
    {
        return [
            ['value' => 'Online', 'label' => 'Online'],
            ['value' => 'On-site', 'label' => 'On-site'],
            ['value' => 'Blended', 'label' => 'Blended'],
        ];
    }

    /**
     * Get label for a delivery format value
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