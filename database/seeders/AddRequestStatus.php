<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Request\RequestStatus;

class AddRequestStatus extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        RequestStatus::create([
            'status_label' => 'Draft',
            'status_code' => 'draft',
        ]);
        RequestStatus::create([
            'status_label' => 'Under Review',
            'status_code' => 'under_review',
        ]);
        RequestStatus::create([
            'status_label' => 'Validated',
            'status_code' => 'validated',
        ]);
        RequestStatus::create([
            'status_label' => 'Offer made',
            'status_code' => 'offer_made',
        ]);
        RequestStatus::create([
            'status_label' => 'In Implementation',
            'status_code' => 'in_implementation',
        ]);
        RequestStatus::create([
            'status_label' => 'Rejected',
            'status_code' => 'rejected',
        ]);
        RequestStatus::create([
            'status_label' => 'Unmatched',
            'status_code' => 'unmatched',
        ]);
        RequestStatus::create([
            'status_label' => 'Closed',
            'status_code' => 'closed',
        ]);
    }
}
