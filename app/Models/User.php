<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use App\Models\Request;
use App\Models\Notification;
use App\Models\RequestSubscription;
use Illuminate\Database\Eloquent\Casts\Attribute;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasRoles;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'first_name',
        'last_name',
        'country',
        'city',
        'provider',
        'provider_id',
        'avatar',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $appends = ['is_partner', 'is_admin'];


    public function getIsAdminAttribute()
    {
        return $this->hasRole('administrator');
    }

    public function getIsPartnerAttribute()
    {
        return $this->hasRole('partner');
    }



    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function requests(): HasMany
    {
        return $this->hasMany(Request::class);
    }

    public function matched_request(): HasOne
    {
        return $this->hasOne(Request::class);
    }

    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class);
    }

    public function notificationPreferences(): HasMany
    {
        return $this->hasMany(UserNotificationPreference::class);
    }

    public function requestSubscriptions(): HasMany
    {
        return $this->hasMany(RequestSubscription::class);
    }

    public function subscribedRequests(): BelongsToMany
    {
        return $this->belongsToMany(Request::class, 'request_subscriptions')
            ->withPivot(['subscribed_by_admin', 'admin_user_id'])
            ->withTimestamps();
    }

    /**
     * Check if user is authenticated via social provider
     */
    public function isSocialUser(): bool
    {
        return !empty($this->provider) && !empty($this->provider_id);
    }

    /**
     * Check if user is authenticated via LinkedIn
     */
    public function isLinkedInUser(): bool
    {
        return $this->provider === 'linkedin';
    }

    /**
     * Get the user's avatar URL with fallback
     */
    public function getAvatarUrl(): string
    {
        if ($this->avatar) {
            return $this->avatar;
        }

        // Fallback to Gravatar or default avatar
        $hash = md5(strtolower(trim($this->email)));
        return "https://www.gravatar.com/avatar/{$hash}?d=identicon&s=150";
    }

}
