<?php

namespace App\Models\Data;

class TargetAudienceOptions
{
    /**
     * Get all target audience options
     */
    public static function getOptions(): array
    {
        return [
            ['value' => 'Academic', 'label' => 'Academic'],
            ['value' => 'Alumni', 'label' => 'Alumni'],
            ['value' => 'Civil Society', 'label' => 'Civil Society'],
            ['value' => 'Small Island Developing States (SIDS)', 'label' => 'Small Island Developing States (SIDS)'],
            ['value' => 'Decision Makers', 'label' => 'Decision Makers'],
            ['value' => 'Early Career Professionals', 'label' => 'Early Career Professionals'],
            ['value' => 'Researchers', 'label' => 'Researchers'],
            ['value' => 'Doctoral or Postdoctoral', 'label' => 'Doctoral or Postdoctoral'],
            ['value' => 'Scientists', 'label' => 'Scientists'],
            ['value' => 'Executives', 'label' => 'Executives'],
            ['value' => 'Technicians', 'label' => 'Technicians'],
            ['value' => 'Women', 'label' => 'Women'],
            ['value' => 'Government', 'label' => 'Government'],
            ['value' => 'Youth', 'label' => 'Youth'],
            ['value' => 'Other (Please Specify)', 'label' => 'Other (Please Specify)'],
        ];
    }

    /**
     * Get label for a target audience value
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