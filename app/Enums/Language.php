<?php

namespace App\Enums;

enum Language: string
{
    case ARABIC = 'Arabic';
    case ENGLISH = 'English';
    case CHINESE = 'Chinese';
    case RUSSIAN = 'Russian';
    case FRENCH = 'French';
    case PORTUGUESE = 'Portuguese';
    case SPANISH = 'Spanish';
    case GERMAN = 'German';
    case ITALIAN = 'Italian';
    case JAPANESE = 'Japanese';
    case KOREAN = 'Korean';
    case HINDI = 'Hindi';
    case TURKISH = 'Turkish';
    case DUTCH = 'Dutch';
    case SWEDISH = 'Swedish';
    case DANISH = 'Danish';
    case NORWEGIAN = 'Norwegian';
    case FINNISH = 'Finnish';
    case POLISH = 'Polish';
    case GREEK = 'Greek';
    case HUNGARIAN = 'Hungarian';
    case CZECH = 'Czech';
    case ROMANIAN = 'Romanian';
    case BULGARIAN = 'Bulgarian';
    case SLOVAK = 'Slovak';
    case CROATIAN = 'Croatian';
    case SLOVENIAN = 'Slovenian';
    case SERBIAN = 'Serbian';
    case UKRAINIAN = 'Ukrainian';
    case THAI = 'Thai';
    case VIETNAMESE = 'Vietnamese';
    case MALAY = 'Malay';
    case INDONESIAN = 'Indonesian';
    case FILIPINO = 'Filipino';
    case SWAHILI = 'Swahili';
    case PERSIAN = 'Persian';
    case OTHER = 'Other';


    public function label(): string
    {
        return $this->value;
    }

    public static function getOptions(): array
    {
        return array_map(
            fn($case) => ['value' => $case->value, 'label' => $case->label()],
            self::cases()
        );
    }

    public static function getLabelByValue(string $value): ?string
    {
        $language = self::tryFrom($value);
        return $language?->label();
    }
}
