<?php

namespace App\Services;

use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\View;

class EmailTemplateService
{
    protected string $templatePath;
    
    public function __construct()
    {
        $this->templatePath = resource_path('email-templates');
    }

    /**
     * Template types
     */
    public const TYPE_REQUEST_SUBMITTED = 'request_submitted';
    public const TYPE_REQUEST_STATUS_CHANGED = 'request_status_changed';
    public const TYPE_REQUEST_MATCHED = 'request_matched';
    public const TYPE_OFFER_RECEIVED = 'offer_received';
    public const TYPE_OFFER_ACCEPTED = 'offer_accepted';
    public const TYPE_OFFER_REJECTED = 'offer_rejected';

    /**
     * Get email template configuration
     */
    public function getTemplate(string $type, string $language = 'en'): ?array
    {
        $templateFile = $this->templatePath . "/{$type}.{$language}.json";
        
        if (!File::exists($templateFile)) {
            // Fallback to English if language not found
            $templateFile = $this->templatePath . "/{$type}.en.json";
        }
        
        if (!File::exists($templateFile)) {
            return null;
        }
        
        $content = File::get($templateFile);
        return json_decode($content, true);
    }

    /**
     * Render template with data
     */
    public function renderTemplate(string $type, array $data, string $language = 'en'): array
    {
        $template = $this->getTemplate($type, $language);
        
        if (!$template) {
            return [
                'subject' => 'Ocean Decade Portal Notification',
                'body' => 'You have received a notification from Ocean Decade Portal.'
            ];
        }
        
        $subject = $this->replaceVariables($template['subject'], $data);
        $body = $this->replaceVariables($template['body'], $data);
        
        return [
            'subject' => $subject,
            'body' => $body,
            'template' => $template
        ];
    }

    /**
     * Replace template variables in content
     */
    private function replaceVariables(string $content, array $data): string
    {
        foreach ($data as $key => $value) {
            if (is_scalar($value) || is_null($value)) {
                $content = str_replace("{{$key}}", (string) $value, $content);
            }
        }
        
        return $content;
    }

    /**
     * Get all available template types
     */
    public static function getAvailableTypes(): array
    {
        return [
            self::TYPE_REQUEST_SUBMITTED => 'New Request Submitted',
            self::TYPE_REQUEST_STATUS_CHANGED => 'Request Status Changed',
            self::TYPE_REQUEST_MATCHED => 'Request Matched with Partner',
            self::TYPE_OFFER_RECEIVED => 'New Offer Received',
            self::TYPE_OFFER_ACCEPTED => 'Offer Accepted',
            self::TYPE_OFFER_REJECTED => 'Offer Rejected',
        ];
    }

    /**
     * Create a new template file
     */
    public function createTemplate(string $type, array $templateData, string $language = 'en'): bool
    {
        $templateFile = $this->templatePath . "/{$type}.{$language}.json";
        
        $content = json_encode($templateData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        
        return File::put($templateFile, $content) !== false;
    }

    /**
     * Get template variables from template file
     */
    public function getTemplateVariables(string $type, string $language = 'en'): array
    {
        $template = $this->getTemplate($type, $language);
        
        return $template['variables'] ?? [];
    }
}