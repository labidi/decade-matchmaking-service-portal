<?php

namespace App\Enums\Opportunity;

enum Type: string
{
    case TRAINING = 'training-workshop';
    case ONBOARDING_EXPEDITIONS = 'onboarding-expeditions';
    case FELLOWSHIPS = 'fellowships';
    case INTERNSHIPS_JOBS_CONSULTANCIES = 'internships-jobs-consultancies';
    case MENTORSHIPS = 'mentorships';
    case VISITING_LECTURERS = 'visiting-lecturers';
    case TRAVEL_GRANTS = 'travel-grants';
    case AWARDS = 'awards';
    case RESEARCH_FUNDING = 'research-funding';
    case ACCESS_INFRASTRUCTURE = 'access-infrastructure';
    case OCEAN_DATA = 'ocean-data';
    case NETWORKS_COMMUNITY = 'networks-community';
    case OCEAN_LITERACY = 'ocean-literacy';
    case WEBINAR = 'webinar';
    case ACCESS_EQUIPMENT = 'access-equipment';
    case CONFERENCE_FORUMS = 'conference-forums';
    case ONLINE_COURSES = 'online-courses';
    case TECHNICAL_ASSISTANCE = 'technical-assistance-advisory-support';

    public function label(): string
    {
        return match ($this) {
            self::TRAINING => 'Blended or In-Person Training Programmes/Workshops',
            self::ONBOARDING_EXPEDITIONS => 'Onboarding Expeditions, Research and Training Opportunities',
            self::FELLOWSHIPS => 'Fellowships',
            self::INTERNSHIPS_JOBS_CONSULTANCIES => 'Internships and Jobs',
            self::MENTORSHIPS => 'Mentorships',
            self::VISITING_LECTURERS => 'Visiting Lecturers and Scholars Programmes',
            self::TRAVEL_GRANTS => 'Travel Grants',
            self::AWARDS => 'Awards',
            self::RESEARCH_FUNDING => 'Funding, Grants and Scholarships',
            self::ACCESS_INFRASTRUCTURE => 'Access to Infrastructure',
            self::OCEAN_DATA => 'Ocean Data, Information and Documentation Resources',
            self::NETWORKS_COMMUNITY => 'Professional Networks and Community Building Opportunities',
            self::OCEAN_LITERACY => 'Ocean Literacy, Public Information and Communication Activities',
            self::WEBINAR => 'Webinars',
            self::ACCESS_EQUIPMENT => 'Access to Equipment',
            self::CONFERENCE_FORUMS => 'Conferences and Forums',
            self::ONLINE_COURSES => 'Online Courses',
            self::TECHNICAL_ASSISTANCE => 'Technical Assistance/Advisory Support',
        };
    }

    public static function getOptions(): array
    {
        $options = array_map(
            fn($case) => ['value' => $case->value, 'label' => $case->label()],
            self::cases()
        );

        usort($options, fn(array $a, array $b): int => strcmp($a['label'], $b['label']));

        return $options;
    }

    public static function getLabelByValue(string $value): ?string
    {
        $opportunityType = self::tryFrom($value);
        return $opportunityType?->label();
    }
}
