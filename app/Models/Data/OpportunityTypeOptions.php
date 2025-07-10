<?php

namespace App\Models\Data;

class OpportunityTypeOptions
{
    public static function getOptions(): array
    {
        return [
            ['value' => 'training', 'label' => 'Training'],
            ['value' => 'onboarding-expeditions', 'label' => 'Onboarding Expeditions, Research & Training'],
            ['value' => 'fellowships', 'label' => 'Fellowships'],
            ['value' => 'internships-jobs', 'label' => 'Internships/Jobs'],
            ['value' => 'mentorships', 'label' => 'Mentorships'],
            ['value' => 'visiting-lecturers', 'label' => 'Visiting Lecturers/Scholars'],
            ['value' => 'travel-grants', 'label' => 'Travel Grants'],
            ['value' => 'awards', 'label' => 'Awards'],
            ['value' => 'research-funding', 'label' => 'Research Fundings, Grants & Scholarships'],
            ['value' => 'access-infrastructure', 'label' => 'Access to Infrastructure'],
            ['value' => 'ocean-data', 'label' => 'Ocean Data, Information and Documentation'],
            ['value' => 'networks-community', 'label' => 'Professional Networks & Community Building'],
            ['value' => 'ocean-literacy', 'label' => 'Ocean Literacy, Public Information and Communication'],
        ];
    }

    public static function getLabel(string $value): string
    {
        foreach (self::getOptions() as $option) {
            if ($option['value'] === $value) {
                return $option['label'];
            }
        }
        return $value;
    }
} 