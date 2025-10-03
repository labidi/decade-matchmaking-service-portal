<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'country' => $this->country,
            'city' => $this->city,
            'roles' => $this->roles->map(fn ($role) => [
                'id' => $role->id,
                'name' => $role->name,
            ]),
            'permissions' => $this->permissions->pluck('name'),
            'is_blocked' => $this->is_blocked ?? false,
            'email_verified' => ! is_null($this->email_verified_at),
            'email_verified_at' => $this->email_verified_at?->toDateTimeString(),
            'created_at' => $this->created_at->toDateTimeString(),
            'updated_at' => $this->updated_at->toDateTimeString(),
            'requests_count' => $this->whenCounted('requests'),
            'notifications_count' => $this->whenCounted('notifications'),
            'avatar_url' => $this->getAvatarUrl(),
            'is_social_user' => $this->isSocialUser(),
            'provider' => $this->provider,
            'status' => $this->getStatusAttribute(),
        ];
    }

    private function getStatusAttribute(): array
    {
        if ($this->is_blocked) {
            return [
                'value' => 'blocked',
                'label' => 'Blocked',
                'color' => 'red',
            ];
        }

        if (is_null($this->email_verified_at)) {
            return [
                'value' => 'unverified',
                'label' => 'Unverified',
                'color' => 'yellow',
            ];
        }

        return [
            'value' => 'active',
            'label' => 'Active',
            'color' => 'green',
        ];
    }
}
