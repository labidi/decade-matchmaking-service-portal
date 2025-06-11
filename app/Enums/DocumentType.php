<?php

namespace App\Enums;

enum DocumentType: string
{
    case FINANCIAL_BREAKDOWN_REPORT = 'financial_breakdown_report';
    case LESSON_LEARNED_REPORT = 'lesson_learned_report';
    case OFFER_DOCUMENT = 'offer_document';
}
