<?php

namespace App\Enums;

enum SupportType: string
{
    case FUNDING_WORKSHOP = 'Funding to organize a workshop ou formation';
    case TECHNICAL_SUPPORT = 'Technical support for planning and delivering a workshop ou training';
    case FACILITATION_SUPPORT = 'Facilitation or coordination support';
    case PARTICIPATION_EXISTING = 'Participation in an existing training or capacity-building event';
    case ACCESS_MATERIALS = 'Access to training materials or curriculum';
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
        $supportType = self::tryFrom($value);
        return $supportType?->label();
    }
}