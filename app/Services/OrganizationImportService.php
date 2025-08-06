<?php

namespace App\Services;

use App\Models\Organization;
use Exception;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class OrganizationImportService
{
    /**
     * Import organizations from CSV file
     */
    public function importFromCsv(UploadedFile $file): array
    {
        try {
            $csvData = $this->parseCsvFile($file);
            
            $this->validateCsvStructure($csvData);
            
            return $this->processImport($csvData);
            
        } catch (Exception $e) {
            Log::error('CSV import failed: ' . $e->getMessage(), [
                'file_name' => $file->getClientOriginalName(),
                'file_size' => $file->getSize()
            ]);
            
            throw $e;
        }
    }

    /**
     * Parse CSV file and return data array
     */
    private function parseCsvFile(UploadedFile $file): array
    {
        Log::info('Parsing CSV file', [
            'file_path' => $file->getRealPath(),
            'file_size' => $file->getSize()
        ]);

        $csvData = array_map('str_getcsv', file($file->getRealPath()));
        
        Log::info('Raw CSV data parsed', [
            'total_rows' => count($csvData),
            'first_row' => $csvData[0] ?? 'No data'
        ]);
        
        // Remove header row if present
        $header = array_shift($csvData);
        
        Log::info('CSV structure', [
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
     * Process the import with transaction management
     */
    private function processImport(array $csvData): array
    {
        $imported = 0;
        $skipped = 0;
        $errors = [];
        
        DB::beginTransaction();
        
        try {
            foreach ($csvData['data'] as $rowIndex => $row) {
                $result = $this->processRow($row, $rowIndex);
                
                switch ($result['status']) {
                    case 'imported':
                        $imported++;
                        break;
                    case 'skipped':
                        $skipped++;
                        break;
                    case 'error':
                        $errors[] = $result['message'];
                        break;
                }
            }
            
            DB::commit();
            
            Log::info('CSV import completed successfully', [
                'imported' => $imported,
                'skipped' => $skipped,
                'errors' => count($errors)
            ]);
            
            return [
                'imported' => $imported,
                'skipped' => $skipped,
                'errors' => $errors
            ];
            
        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Process a single CSV row
     */
    private function processRow(array $row, int $rowIndex): array
    {
        Log::debug('Processing CSV row', [
            'row_index' => $rowIndex,
            'row_data' => $row
        ]);

        // Skip empty rows
        if (empty(array_filter($row))) {
            Log::debug('Skipping empty row', ['row_index' => $rowIndex]);
            return ['status' => 'skipped'];
        }

        // Validate row has exactly 3 columns
        if (count($row) !== 3) {
            $error = "Row " . ($rowIndex + 2) . ": Invalid number of columns.";
            Log::warning($error, ['row_data' => $row]);
            return [
                'status' => 'error',
                'message' => $error
            ];
        }

        [$name, $description, $link] = $row;

        // Validate required name field
        $name = trim($name);
        if (empty($name)) {
            $error = "Row " . ($rowIndex + 2) . ": Organization name is required.";
            Log::warning($error, ['row_data' => $row]);
            return [
                'status' => 'error',
                'message' => $error
            ];
        }

        // Check for duplicate organization names
        if ($this->organizationExists($name)) {
            Log::debug('Skipping duplicate organization', ['name' => $name]);
            return ['status' => 'skipped'];
        }

        // Create organization
        $organizationData = [
            'name' => $name,
            'description' => !empty(trim($description)) ? trim($description) : null,
            'link' => !empty(trim($link)) ? trim($link) : null,
        ];

        Log::info('Creating organization', $organizationData);
        
        try {
            $organization = $this->createOrganization($organizationData);
            Log::info('Organization created successfully', [
                'id' => $organization->id,
                'name' => $organization->name
            ]);
        } catch (Exception $e) {
            Log::error('Failed to create organization', [
                'data' => $organizationData,
                'error' => $e->getMessage()
            ]);
            return [
                'status' => 'error',
                'message' => "Row " . ($rowIndex + 2) . ": Failed to create organization - " . $e->getMessage()
            ];
        }

        return ['status' => 'imported'];
    }

    /**
     * Check if organization with given name exists
     */
    private function organizationExists(string $name): bool
    {
        return Organization::where('name', $name)->exists();
    }

    /**
     * Create a new organization
     */
    private function createOrganization(array $data): Organization
    {
        return Organization::create($data);
    }

    /**
     * Format import results message
     */
    public function formatImportMessage(array $stats): string
    {
        $message = "Import completed successfully. ";
        $message .= "Imported: {$stats['imported']} organizations.";
        
        if ($stats['skipped'] > 0) {
            $message .= " Skipped: {$stats['skipped']} duplicates.";
        }

        if (!empty($stats['errors'])) {
            $errorMessages = is_array($stats['errors']) ? $stats['errors'] : [$stats['errors']];
            $message .= " Errors: " . implode(' ', array_slice($errorMessages, 0, 3));
            if (count($errorMessages) > 3) {
                $message .= " (and " . (count($errorMessages) - 3) . " more)";
            }
        }

        return $message;
    }
}