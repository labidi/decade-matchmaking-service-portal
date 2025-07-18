<?php

namespace App\Services;

use App\Models\Setting;

class SettingService
{
    public function getSiteName(): ?string
    {
        return $this->getValueByPath(Setting::SITE_NAME);
    }

    public function getSupportEmail(): ?string
    {
        return $this->getValueByPath(Setting::SUPPORT_EMAIL);
    }

    public function getValueByPath(string $path): ?string
    {
        return optional(Setting::where('path', $path)->first())->value;
    }
} 