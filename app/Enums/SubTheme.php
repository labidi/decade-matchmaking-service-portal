<?php

namespace App\Enums;

enum SubTheme: string
{
    case MAPPING_OCEAN_CLIMATE = 'Mapping & modeling ocean-climate interactions';
    case MARINE_CO2_REMOVAL = 'Marine CO2 removal';
    case OCEAN_ACIDIFICATION = 'Ocean acidification';
    case OCEANS_HUMAN_HEALTH = 'Impact of oceans on human health';
    case CUMULATIVE_IMPACTS = 'Measuring cumulative impacts and multiple stressors';
    case LOW_COST_TECHNOLOGY = 'Low-cost technology & infrastructure solutions for data gathering and management';
    case DATA_MANAGEMENT = 'Data management (FAIR and CARE principles)';
    case MAPPING_BIODIVERSITY = 'Mapping and modelling biodiversity';
    case ECOSYSTEM_APPROACH_FISHERIES = 'Ecosystem Approach to Fisheries';
    case BBNJ_AGREEMENT = 'Implementing the BBNJ Agreement';
    case EDNA_TECHNIQUES = 'eDNA techniques';
    case SCIENCE_COMMUNICATION = 'Science communication for policy development';
    case POLICY_INFLUENCE = 'Working with & influencing policymakers';
    case SUSTAINABLE_OCEAN_PLANNING = 'Sustainable Ocean Planning';
    case STAKEHOLDER_ENGAGEMENT = 'Stakeholder engagement via transdisciplinary approaches';
    case LOCAL_INDIGENOUS_KNOWLEDGE = 'Engaging Local & Indigenous Knowledge holders';
    case PROJECT_MANAGEMENT = 'Managing, leading, & financing ocean projects';
    case OTHER = 'Other';

    public function label(): string
    {
        return $this->value;
    }

    public static function getOptions(): array
    {
        return array_map(
            fn($case) => ['value' => $case->value, 'label' => $case->label()],
            self::cases()
        );
    }

    public static function getLabelByValue(string $value): ?string
    {
        $subTheme = self::tryFrom($value);
        return $subTheme?->label();
    }
}