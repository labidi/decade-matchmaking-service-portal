<?php 

namespace App\Models\Request;
use App\Models\Request;

class RequestData
{
    public function __construct(
        public string $title,
        public string $description,
        public string $type,
        public string $category,
        public string $location,
        public string $start_date,
        public string $end_date,
        public string $status,
        public ?string $submit_date = null,
    ) {
    }
}