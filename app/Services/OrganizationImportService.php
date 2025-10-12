<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Organization;
use Exception;
use Illuminate\Support\Facades\Log;

class OrganizationImportService
{
    /**
     * Import organizations from stored CSV file path
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

            Log::info('Starting CSV import from stored file', [
                'file_path' => $filePath,
                'full_path' => $fullPath
            ]);

            return $this->processImportWithoutTransaction($csvData);
        } catch (Exception $e) {
            Log::error('CSV import failed from stored file: ' . $e->getMessage(), [
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
        Log::info('Parsing CSV file from storage', [
            'file_path' => $filePath,
            'file_size' => filesize($filePath)
        ]);

        $csvData = array_map('str_getcsv', file($filePath));

        Log::info('Raw CSV data parsed from storage', [
            'total_rows' => count($csvData),
            'first_row' => $csvData[0] ?? 'No data'
        ]);

        // Remove header row if present
        $header = array_shift($csvData);

        Log::info('CSV structure from storage', [
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

        if (empty($data) || count($header) !== 3) {
            throw new Exception('Invalid CSV format. Expected 3 columns: name, description, link.');
        }
    }

    /**
     * Process the import without transaction management (for use within existing transaction)
     */
    private function processImportWithoutTransaction(array $csvData): array
    {
        Log::info('Truncating organizations table before import');
        
        // Truncate the organizations table to remove all existing data
        Organization::truncate();
        
        // Prepare data for bulk insert
        $organizationsData = [];
        foreach ($csvData['data'] as $row) {
            // Basic validation - skip empty rows and ensure minimum required columns
            if (!empty(array_filter($row)) && count($row) >= 3 && !empty(trim($row[0]))) {
                $organizationsData[] = [
                    'name' => trim($row[0]),
                    'description' => !empty(trim($row[1])) ? trim($row[1]) : null,
                    'link' => !empty(trim($row[2])) ? trim($row[2]) : null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
        }
        
        Log::info('Bulk inserting organizations', [
            'organizations_to_insert' => count($organizationsData)
        ]);
        
        // Bulk insert all organizations
        if (!empty($organizationsData)) {
            Organization::insert($organizationsData);
        }
        
        Log::info('CSV import completed successfully', [
            'imported' => count($organizationsData),
            'total_processed' => count($csvData['data'])
        ]);

        return [
            'imported' => count($organizationsData),
            'total_processed' => count($csvData['data'])
        ];
    }
}
