<?php

namespace App\Models;

use App\Casts\DynamicLocationCast;
use App\Enums\Common\Language;
use App\Enums\Common\TargetAudience;
use App\Enums\Opportunity\CoverageActivity;
use App\Enums\Opportunity\Status;
use App\Enums\Opportunity\Type;
use Illuminate\Database\Eloquent\Casts\AsEnumArrayObject;
use Illuminate\Database\Eloquent\Casts\AsEnumCollection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;


class Opportunity extends Model
{
    protected $table = 'opportunities';
    protected $primaryKey = 'id';

    public $timestamps = true;

    protected function casts(): array
    {
        return [
            'type' => Type::class,
            'status' => Status::class,
            'target_audience' => AsEnumArrayObject::of(TargetAudience::class),
            'coverage_activity' => CoverageActivity::class,
            'implementation_location' => DynamicLocationCast::class,
            'target_languages' => AsEnumArrayObject::of(Language::class),
            'closing_date' => 'datetime:Y-m-d',
            'key_words' => 'array'
        ];
    }

    public static function getTypeOptions(): array
    {
        return Type::getOptions();
    }

    protected $fillable = [
        'title',
        'type',
        'closing_date',
        'coverage_activity',
        'implementation_location',
        'target_audience',
        'target_audience_other',
        'target_languages',
        'target_languages_other',
        'summary',
        'url',
        'key_words',
        'user_id',
        'status'
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get implementation location as array.
     * Helper method for consistent array handling.
     *
     * @return array<mixed>
     */
    public function getImplementationLocationAsArray(): array
    {
        $location = $this->implementation_location;

        if ($location === null) {
            return [];
        }

        if ($location === 'Global') {
            return ['Global'];
        }

        if (is_array($location)) {
            return $location;
        }

        return [$location];
    }

    /**
     * Check if opportunity has multiple locations.
     *
     * @return bool
     */
    public function hasMultipleLocations(): bool
    {
        return count($this->getImplementationLocationAsArray()) > 1;
    }

}
