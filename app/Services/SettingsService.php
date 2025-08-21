<?php

namespace App\Services;

use App\Models\Setting;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class SettingsService
{
    /**
     * Update or create settings
     */
    public function updateSettings(array $settingsData): array
    {
        $updatedSettings = [];

        DB::transaction(function () use ($settingsData, &$updatedSettings) {
            foreach ($settingsData as $path => $value) {
                // Skip null values for file uploads that weren't changed
                if ($value === null && Setting::isFileUpload($path)) {
                    continue;
                }

                $setting = Setting::where('path', $path)->first();

                if ($setting) {
                    // Update existing setting
                    $setting->update(['value' => $value]);
                    Log::info('Setting updated', ['path' => $path, 'is_file' => Setting::isFileUpload($path)]);
                } else {
                    // Create new setting
                    $setting = Setting::create([
                        'path' => $path,
                        'value' => $value
                    ]);
                    Log::info('Setting created', ['path' => $path, 'is_file' => Setting::isFileUpload($path)]);
                }

                $updatedSettings[$path] = $setting;
            }
        });

        return $updatedSettings;
    }

    /**
     * Get all settings as key-value pairs
     */
    public function getAllSettings(): array
    {
        $settings = Setting::all();
        $result = [];

        foreach ($settings as $setting) {
            $path = $setting->path;
            $value = $setting->value;

            // If this is a file upload setting, return the public URL
            if (Setting::isFileUpload($path) && $value) {
                $result[$path] = asset('storage/' . $value);
            } else {
                $result[$path] = $value;
            }
        }

        return $result;
    }

    /**
     * Get a specific setting value
     */
    public function getSetting(string $path, $default = null)
    {
        $setting = Setting::where('path', $path)->first();

        if (!$setting) {
            return $default;
        }

        // If this is a file upload setting, return the public URL
        if (Setting::isFileUpload($path) && $setting->value) {
            return asset('storage/' . $setting->value);
        }

        return $setting->value;
    }

    /**
     * Validate settings data against defined constants
     */
    public function validateSettingsData(array $data): array
    {
        $validatedData = [];

        foreach ($data as $path => $value) {
            if (in_array($path, Setting::VALID_PATHS)) {
                $validatedData[$path] = $value;
            }
        }

        return $validatedData;
    }

    /**
     * Handle file upload for settings
     */
    public function handleFileUpload(string $path, UploadedFile $file): string
    {
        // Delete old file if it exists
        $this->deleteOldFile($path);

        // Store the new file
        $storageDirectory = Setting::getStorageDirectory($path);
        $fileName = time() . '_' . $file->getClientOriginalName();

        $filePath = $file->storeAs($storageDirectory, $fileName, 'public');

        Log::info('File uploaded for setting', [
            'path' => $path,
            'file_path' => $filePath,
            'original_name' => $file->getClientOriginalName()
        ]);

        return $filePath;
    }

    /**
     * Delete old file when updating file settings
     */
    private function deleteOldFile(string $path): void
    {
        $existingSetting = Setting::where('path', $path)->first();

        if ($existingSetting && $existingSetting->value) {
            $oldFilePath = $existingSetting->value;

            if (Storage::disk('public')->exists($oldFilePath)) {
                Storage::disk('public')->delete($oldFilePath);
                Log::info('Old file deleted', ['path' => $path, 'file_path' => $oldFilePath]);
            }
        }
    }

    /**
     * Get file validation rules for all file upload settings
     */
    public function getFileValidationRules(): array
    {
        $rules = [];

//        foreach (Setting::FILE_UPLOAD_SETTINGS as $path) {
//            $rules[$path] = Setting::getFileValidationRules($path);
//        }

        // Add non-file validation rules
        $rules[Setting::SITE_NAME] = ['nullable', 'string', 'max:255'];
        $rules[Setting::SITE_DESCRIPTION] = ['nullable', 'string', 'max:1000'];
        $rules[Setting::HOMEPAGE_YOUTUBE_VIDEO] = ['nullable', 'string', 'max:500'];
        $rules[Setting::SUCCESSFUL_MATCHES_METRIC] = ['nullable', 'integer:strict',];
        $rules[Setting::COMMITTED_FUNDING_METRIC] = ['nullable', 'integer:strict',];
        $rules[Setting::FULLY_CLOSED_MATCHES_METRIC] = ['nullable', 'integer:strict',];
        $rules[Setting::REQUEST_IN_IMPLEMENTATION_METRIC] = ['nullable', 'integer:strict',];
        $rules[Setting::OPEN_PARTNER_OPPORTUNITIES_METRIC] = ['nullable', 'integer:strict',];

        return $rules;
    }
}
