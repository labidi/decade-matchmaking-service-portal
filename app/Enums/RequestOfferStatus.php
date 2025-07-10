<?php

namespace App\Enums;

enum RequestOfferStatus: int
{
    case ACTIVE = 1;
    case INACTIVE = 2;

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
