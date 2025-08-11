<?php

namespace App\Enums;

enum RelatedActivity: string
{
    case TRAINING = 'Training';
    case WORKSHOP = 'Workshop';
    case BOTH = 'Both';

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
        $relatedActivity = self::tryFrom($value);
        return $relatedActivity?->label();
    }
}