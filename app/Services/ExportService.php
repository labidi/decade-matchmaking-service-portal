<?php

namespace App\Services;

use App\Services\RequestService;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ExportService
{
    public function __construct(private RequestService $requestService)
    {
    }

    public function exportRequestsCsv(): StreamedResponse
    {
        $requests = $this->requestService->getAllRequests();

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="requests.csv"',
        ];

        return new StreamedResponse(function () use ($requests) {
            $handle = fopen('php://output', 'w');
            // CSV header
            fputcsv($handle, [
                'ID',
                'Title',
                'Submitter',
                'Status',
                'Created At',
                'Capacity Development Title',
                'First Name',
                'Last Name',
                'Email',
                'Project Stage',
                'Related Activity',
                'Has Partner',
                'Partner Name',
                'Needs Financial Support',
                'Completion Date',
                'Expected Outcomes',
                'Success Metrics',
                'Long Term Impact',
            ]);
            foreach ($requests as $request) {
                $detail = $request->detail ?? null;
                fputcsv($handle, [
                    $request->id,
                    $request->title ?? '',
                    $request->user?->name ?? '',
                    $request->status?->status_label ?? '',
                    $request->created_at,
                    $detail?->capacity_development_title ?? '',
                    $detail?->first_name ?? '',
                    $detail?->last_name ?? '',
                    $detail?->email ?? '',
                    $detail?->project_stage ?? '',
                    $detail?->related_activity ?? '',
                    $detail?->has_partner ?? '',
                    $detail?->partner_name ?? '',
                    $detail?->needs_financial_support ?? '',
                    $detail?->completion_date ?? '',
                    $detail?->expected_outcomes ?? '',
                    $detail?->success_metrics ?? '',
                    $detail?->long_term_impact ?? '',
                ]);
            }
            fclose($handle);
        }, 200, $headers);
    }
} 