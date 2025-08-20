<?php

namespace App\Enums\Opportunity;

enum OpportunityType: string
{
    case TRAINING = 'training-workshop';
    case ONBOARDING_EXPEDITIONS = 'onboarding-expeditions';
    case FELLOWSHIPS = 'fellowships';
    case INTERNSHIPS_JOBS = 'internships-jobs';
    case MENTORSHIPS = 'mentorships';
    case VISITING_LECTURERS = 'visiting-lecturers';
    case TRAVEL_GRANTS = 'travel-grants';
    case AWARDS = 'awards';
    case RESEARCH_FUNDING = 'research-funding';
    case ACCESS_INFRASTRUCTURE = 'access-infrastructure';
    case OCEAN_DATA = 'ocean-data';
    case NETWORKS_COMMUNITY = 'networks-community';
    case OCEAN_LITERACY = 'ocean-literacy';

    public function label(): string
    {
        return match ($this) {
            self::TRAINING => 'Training/Workshop',
            self::ONBOARDING_EXPEDITIONS => 'Onboarding Expeditions, Research & Training',
            self::FELLOWSHIPS => 'Fellowships',
            self::INTERNSHIPS_JOBS => 'Internships/Jobs',
            self::MENTORSHIPS => 'Mentorships',
            self::VISITING_LECTURERS => 'Visiting Lecturers/Scholars',
            self::TRAVEL_GRANTS => 'Travel Grants',
            self::AWARDS => 'Awards',
            self::RESEARCH_FUNDING => 'Research Fundings, Grants & Scholarships',
            self::ACCESS_INFRASTRUCTURE => 'Access to Infrastructure',
            self::OCEAN_DATA => 'Ocean Data, Information and Documentation',
            self::NETWORKS_COMMUNITY => 'Professional Networks & Community Building',
            self::OCEAN_LITERACY => 'Ocean Literacy, Public Information and Communication',
        };
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
        $opportunityType = self::tryFrom($value);
        return $opportunityType?->label();
    }
}
