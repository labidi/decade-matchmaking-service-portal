<?php

namespace App\Models;

use App\Enums\Common\TargetAudience;
use App\Enums\Opportunity\Status;
use App\Enums\Opportunity\Type;
use Illuminate\Database\Eloquent\Casts\AsEnumArrayObject;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;


class Opportunity extends Model
{
    protected $table = 'opportunities';
    protected $primaryKey = 'id';

    public $timestamps = true;

    protected $casts = [

    ];

    protected function casts(): array
    {
        return [
            'type'=>Type::class,
            'status' => Status::class,
            'implementation_location' => 'array',
            'target_audience' => AsEnumArrayObject::of(TargetAudience::class),
        ];
    }

    public const STATUS_LABELS = [
        Status::ACTIVE->value => 'Active',
        Status::CLOSED->value => 'Closed',
        Status::REJECTED->value => 'Rejected',
        Status::PENDING_REVIEW->value => 'Pending Review',
    ];

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
        'summary',
        'url',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

}
