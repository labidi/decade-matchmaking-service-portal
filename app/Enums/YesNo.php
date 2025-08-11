<?php

namespace App\Enums;

enum YesNo: string
{
    case YES = 'Yes';
    case NO = 'No';

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
        $case = self::tryFrom($value);
        return $case?->label();
    }

    /**
     * Convert enum value to boolean
     */
    public function toBool(): bool
    {
        return $this === self::YES;
    }

    /**
     * Create enum from boolean value
     */
    public static function fromBool(bool $value): self
    {
        return $value ? self::YES : self::NO;
    }

    /**
     * Get options with lowercase values for backward compatibility
     */
    public static function getOptionsLowercase(): array
    {
        return [
            ['value' => 'yes', 'label' => 'Yes'],
            ['value' => 'no', 'label' => 'No'],
        ];
    }
}