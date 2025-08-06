<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\OrganizationCsvUploadRequest;
use App\Services\OrganizationImportService;
use App\Services\SettingsService;
use App\Traits\HasBreadcrumbs;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class SettingsController extends Controller
{
    use HasBreadcrumbs;

    public function __construct(
        private readonly SettingsService $settingsService,
        private readonly OrganizationImportService $organizationImportService
    ) {
    }

    public function index()
    {
        $settings = $this->settingsService->getAllSettings();

        return Inertia::render('Admin/Portal/Settings', [
            'title' => 'Portal Settings',
            'breadcrumbs' => $this->buildAdminSectionBreadcrumbs('settings'),
            'settings' => $settings, // Pass current settings to form
        ]);
    }

    public function update(Request $request)
    {
        // Get dynamic validation rules from service
        $validationRules = $this->settingsService->getFileValidationRules();
        $request->validate($validationRules);

        try {
            // Validate settings data against defined constants
            $validatedData = $this->settingsService->validateSettingsData($request->all());

            // Handle file uploads for all file-type settings
            foreach ($validatedData as $path => $value) {
                if ($request->hasFile($path)) {
                    $filePath = $this->settingsService->handleFileUpload($path, $request->file($path));
                    $validatedData[$path] = $filePath;
                }
            }

            // Update settings
            $this->settingsService->updateSettings($validatedData);

            return to_route('admin.settings.index')
                ->with('success', 'Settings updated successfully.');

        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Failed to update settings: ' . $e->getMessage())
                ->withInput();
        }
    }

    /**
     * Handle CSV file upload and import organizations.
     */
    public function uploadOrganizationsCsv(OrganizationCsvUploadRequest $request)
    {


        try {
            $file = $request->file('csv_file');

            if (!$file) {
                throw new \Exception('No CSV file received');
            }

            Log::info('CSV file received', [
                'filename' => $file->getClientOriginalName(),
                'size' => $file->getSize(),
                'mime_type' => $file->getMimeType(),
            ]);

            $stats = $this->organizationImportService->importFromCsv($file);

            Log::info('CSV import completed', [
                'stats' => $stats,
            ]);

            $message = $this->organizationImportService->formatImportMessage($stats);

            return response()->json([
                'success' => true,
                'message' => $message,
                'stats' => [
                    'imported' => $stats['imported'],
                    'skipped' => $stats['skipped'],
                    'errors' => count($stats['errors']),
                ],
            ]);

        } catch (\Exception $e) {
            Log::error('CSV upload failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to import CSV file: ' . $e->getMessage(),
            ], 500);
        }
    }
}
