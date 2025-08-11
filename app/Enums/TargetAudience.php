<?php

namespace App\Enums;

enum TargetAudience: string
{
    case ACADEMIC = 'Academic';
    case ALUMNI = 'Alumni';
    case CIVIL_SOCIETY = 'Civil Society';
    case SMALL_ISLAND_DEVELOPING_STATES = 'Small Island Developing States (SIDS)';
    case DECISION_MAKERS = 'Decision Makers';
    case EARLY_CAREER_PROFESSIONALS = 'Early Career Professionals';
    case RESEARCHERS = 'Researchers';
    case DOCTORAL_OR_POSTDOCTORAL = 'Doctoral or Postdoctoral';
    case SCIENTISTS = 'Scientists';
    case EXECUTIVES = 'Executives';
    case TECHNICIANS = 'Technicians';
    case WOMEN = 'Women';
    case GOVERNMENT = 'Government';
    case YOUTH = 'Youth';
    case OTHER = 'Other (Please Specify)';

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
        $audience = self::tryFrom($value);
        return $audience?->label();
    }
}