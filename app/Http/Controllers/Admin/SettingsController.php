<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\SettingsService;
use App\Traits\HasBreadcrumbs;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SettingsController extends Controller
{
    use HasBreadcrumbs;

    public function __construct(
        private readonly SettingsService $settingsService
    ) {
    }

    public function index()
    {
        $settings = $this->settingsService->getAllSettings();

        return Inertia::render('Admin/Portal/Settings', [
            'title' => 'Portal Settings',
            'breadcrumbs' => $this->buildAdminSectionBreadcrumbs('settings'),
            'request' => $settings, // Pass current settings to form
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

            return redirect()->route('admin.settings.index')
                ->with('success', 'Settings updated successfully.');

        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Failed to update settings: ' . $e->getMessage())
                ->withInput();
        }
    }
}
