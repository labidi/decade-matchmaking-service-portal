<?php

namespace App\Models\Data;

class SupportTypeOptions
{
    /**
     * Get all support type options
     */
    public static function getOptions(): array
    {
        return [
            ['value' => 'Funding to organize a workshop ou formation', 'label' => 'Funding to organize a workshop ou formation'],
            ['value' => 'Technical support for planning and delivering a workshop ou training', 'label' => 'Technical support for planning and delivering a workshop ou training'],
            ['value' => 'Facilitation or coordination support', 'label' => 'Facilitation or coordination support'],
            ['value' => 'Participation in an existing training or capacity-building event', 'label' => 'Participation in an existing training or capacity-building event'],
            ['value' => 'Access to training materials or curriculum', 'label' => 'Access to training materials or curriculum'],
            ['value' => 'Other', 'label' => 'Other'],
        ];
    }

    /**
     * Get label for a support type value
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