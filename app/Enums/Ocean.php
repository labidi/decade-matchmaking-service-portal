<?php

namespace App\Enums;

enum Ocean: string
{
    case ATLANTIC_OCEAN = 'Atlantic Ocean';
    case PACIFIC_OCEAN = 'Pacific Ocean';
    case INDIAN_OCEAN = 'Indian Ocean';
    case ARCTIC_OCEAN = 'Arctic Ocean';
    case SOUTHERN_OCEAN = 'Southern Ocean';
    case MEDITERRANEAN_SEA = 'Mediterranean Sea';
    case CASPIAN_SEA = 'Caspian Sea';

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
        $ocean = self::tryFrom($value);
        return $ocean?->label();
    }
}