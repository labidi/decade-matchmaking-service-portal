<?php

namespace App\Enums;

enum OpportunityStatus: int
{
    case ACTIVE = 1;
    case CLOSED = 2;
    case REJECTED = 3;
    case PENDING_REVIEW = 4;
}
