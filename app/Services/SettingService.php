<?php

namespace App\Services;

use App\Models\Setting;

class SettingService
{
    public function getSiteName(): ?string
    {
        return $this->getValueByPath(Setting::SITE_NAME);
    }
    public function setSiteName(string $value): void
    {
        $this->updateValueByPath(Setting::SITE_NAME, $value);
    }

    public function getSiteDescription(): ?string
    {
        return $this->getValueByPath(Setting::SITE_DESCRIPTION);
    }
    public function setSiteDescription(string $value): void
    {
        $this->updateValueByPath(Setting::SITE_DESCRIPTION, $value);
    }

    public function getLogo(): ?string
    {
        return $this->getValueByPath(Setting::LOGO);
    }
    public function setLogo(string $value): void
    {
        $this->updateValueByPath(Setting::LOGO, $value);
    }

    public function getHomepageYoutubeVideo(): ?string
    {
        return $this->getValueByPath(Setting::HOMEPAGE_YOUTUBE_VIDEO);
    }
    public function setHomepageYoutubeVideo(string $value): void
    {
        $this->updateValueByPath(Setting::HOMEPAGE_YOUTUBE_VIDEO, $value);
    }

    public function getPortalGuide(): ?string
    {
        return $this->getValueByPath(Setting::PORTAL_GUIDE);
    }
    public function setPortalGuide(string $value): void
    {
        $this->updateValueByPath(Setting::PORTAL_GUIDE, $value);
    }

    public function getUserGuide(): ?string
    {
        return $this->getValueByPath(Setting::USER_GUIDE);
    }
    public function setUserGuide(string $value): void
    {
        $this->updateValueByPath(Setting::USER_GUIDE, $value);
    }

    public function getPartnerGuide(): ?string
    {
        return $this->getValueByPath(Setting::PARTNER_GUIDE);
    }
    public function setPartnerGuide(string $value): void
    {
        $this->updateValueByPath(Setting::PARTNER_GUIDE, $value);
    }

    public function getValueByPath(string $path): ?string
    {
        return optional(Setting::where('path', $path)->first())->value;
    }

    public function updateValueByPath(string $path, string $value): void
    {
        Setting::updateOrCreate(['path' => $path], ['value' => $value]);
    }
} 