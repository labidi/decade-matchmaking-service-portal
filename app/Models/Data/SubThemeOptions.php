<?php

namespace App\Models\Data;

class SubThemeOptions
{
    /**
     * Get all subtheme options
     */
    public static function getOptions(): array
    {
        return [
            ['value' => 'Mapping & modeling ocean-climate interactions', 'label' => 'Mapping & modeling ocean-climate interactions'],
            ['value' => 'Marine CO2 removal', 'label' => 'Marine CO2 removal'],
            ['value' => 'Ocean acidification', 'label' => 'Ocean acidification'],
            ['value' => 'Impact of oceans on human health', 'label' => 'Impact of oceans on human health'],
            ['value' => 'Measuring cumulative impacts and multiple stressors', 'label' => 'Measuring cumulative impacts and multiple stressors'],
            ['value' => 'Low-cost technology & infrastructure solutions for data gathering and management', 'label' => 'Low-cost technology & infrastructure solutions for data gathering and management'],
            ['value' => 'Data management (FAIR and CARE principles)', 'label' => 'Data management (FAIR and CARE principles)'],
            ['value' => 'Mapping and modelling biodiversity', 'label' => 'Mapping and modelling biodiversity'],
            ['value' => 'Ecosystem Approach to Fisheries', 'label' => 'Ecosystem Approach to Fisheries'],
            ['value' => 'Implementing the BBNJ Agreement', 'label' => 'Implementing the BBNJ Agreement'],
            ['value' => 'eDNA techniques', 'label' => 'eDNA techniques'],
            ['value' => 'Science communication for policy development', 'label' => 'Science communication for policy development'],
            ['value' => 'Working with & influencing policymakers', 'label' => 'Working with & influencing policymakers'],
            ['value' => 'Sustainable Ocean Planning', 'label' => 'Sustainable Ocean Planning'],
            ['value' => 'Stakeholder engagement via transdisciplinary approaches', 'label' => 'Stakeholder engagement via transdisciplinary approaches'],
            ['value' => 'Engaging Local & Indigenous Knowledge holders', 'label' => 'Engaging Local & Indigenous Knowledge holders'],
            ['value' => 'Managing, leading, & financing ocean projects', 'label' => 'Managing, leading, & financing ocean projects'],
            ['value' => 'Other', 'label' => 'Other'],
        ];
    }

    /**
     * Get label for a subtheme value
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