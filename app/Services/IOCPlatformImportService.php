<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\IOCPlatform;
use Exception;
use Illuminate\Support\Facades\Log;

class IOCPlatformImportService
{
    /**
     * Import IOC platforms from stored CSV file path
     */
    public function import(string $filePath): array
    {
        try {
            $fullPath = storage_path('app/public/' . $filePath);

            if (!file_exists($fullPath)) {
                throw new Exception('CSV file not found at path: ' . $filePath);
            }

            $csvData = $this->parseCsvFileFromPath($fullPath);

            $this->validateCsvStructure($csvData);

            Log::info('Starting IOC Platform CSV import from stored file', [
                'file_path' => $filePath,
                'full_path' => $fullPath
            ]);

            return $this->processImportWithoutTransaction($csvData);
        } catch (Exception $e) {
            Log::error('IOC Platform CSV import failed from stored file: ' . $e->getMessage(), [
                'file_path' => $filePath
            ]);

            throw $e;
        }
    }

    /**
     * Parse CSV file from storage path and return data array
     */
    private function parseCsvFileFromPath(string $filePath): array
    {
        Log::info('Parsing IOC Platform CSV file from storage', [
            'file_path' => $filePath,
            'file_size' => filesize($filePath)
        ]);

        $csvData = array_map('str_getcsv', file($filePath));

        Log::info('Raw IOC Platform CSV data parsed from storage', [
            'total_rows' => count($csvData),
            'first_row' => $csvData[0] ?? 'No data'
        ]);

        // Remove header row if present
        $header = array_shift($csvData);

        Log::info('IOC Platform CSV structure from storage', [
            'header' => $header,
            'data_rows' => count($csvData),
            'sample_row' => $csvData[0] ?? 'No data rows'
        ]);

        return [
            'header' => $header,
            'data' => $csvData
        ];
    }

    /**
     * Validate CSV structure
     */
    private function validateCsvStructure(array $csvData): void
    {
        $header = $csvData['header'];
        $data = $csvData['data'];

        if (empty($data) || count($header) !== 4) {
            throw new Exception('Invalid CSV format. Expected 4 columns: name, description, link, contact.');
        }
    }

    /**
     * Process the import without transaction management (for use within existing transaction)
     */
    private function processImportWithoutTransaction(array $csvData): array
    {
        Log::info('Truncating ioc_platforms table before import');

        // Truncate the ioc_platforms table to remove all existing data
        IOCPlatform::truncate();

        // Prepare data for bulk insert
        $platformsData = [];
        foreach ($csvData['data'] as $row) {
            // Basic validation - skip empty rows and ensure minimum required columns
            if (!empty(array_filter($row)) && count($row) >= 4 && !empty(trim($row[0]))) {
                $platformsData[] = [
                    'name' => trim($row[0]),
                    'description' => !empty(trim($row[1])) ? trim($row[1]) : null,
                    'link' => !empty(trim($row[2])) ? trim($row[2]) : null,
                    'contact' => !empty(trim($row[3])) ? trim($row[3]) : null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
        }

        Log::info('Bulk inserting IOC platforms', [
            'platforms_to_insert' => count($platformsData)
        ]);

        // Bulk insert all platforms
        if (!empty($platformsData)) {
            IOCPlatform::insert($platformsData);
        }

        Log::info('IOC Platform CSV import completed successfully', [
            'imported' => count($platformsData),
            'total_processed' => count($csvData['data'])
        ]);

        return [
            'imported' => count($platformsData),
            'total_processed' => count($csvData['data'])
        ];
    }
}