<?php

namespace App\Models\Data;

class RelatedActivityOptions
{
    /**
     * Get all related activity options
     */
    public static function getOptions(): array
    {
        return [
            ['value' => 'Training', 'label' => 'Training'],
            ['value' => 'Workshop', 'label' => 'Workshop'],
            ['value' => 'Both', 'label' => 'Both'],
        ];
    }

    /**
     * Get label for a related activity value
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