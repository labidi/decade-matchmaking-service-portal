<?php

namespace App\Enums;

enum DeliveryFormat: string
{
    case ONLINE = 'Online';
    case ON_SITE = 'On-site';
    case BLENDED = 'Blended';

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
        $deliveryFormat = self::tryFrom($value);
        return $deliveryFormat?->label();
    }
}