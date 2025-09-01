<?php

namespace App\Enums\Opportunity;

enum CoverageActivity: string
{
    case GLOBAL = 'global';
    case REGIONS = 'regions';
    case COUNTRY = 'country';
    case OCEANBASED = 'ocean-based';

    public function label(): string
    {
        return match ($this) {
            self::GLOBAL => 'Global',
            self::REGIONS => 'Regions',
            self::COUNTRY => 'Country',
            self::OCEANBASED => 'Ocean-based',
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
        $coverageActivity = self::tryFrom($value);
        return $coverageActivity?->label();
    }
}
