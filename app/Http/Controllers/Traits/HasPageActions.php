<?php

namespace App\Http\Controllers\Traits;

use App\Models\User;
use Illuminate\Support\Facades\Auth;

trait HasPageActions
{
    /**
     * Build page actions array with permission filtering
     */
    protected function buildActions(array $actions, ?User $user = null): array
    {
        if (!$user) {
            $user = Auth::user();
        }

        return collect($actions)
            ->filter(function ($action) use ($user) {
                // If no permission specified, include the action
                if (!isset($action['permission'])) {
                    return true;
                }
                
                // Simple permission check using user flags and Laravel Gates
                return $user && (
                    $user->is_admin || 
                    $user->can($action['permission'])
                );
            })
            ->values()
            ->toArray();
    }

    /**
     * Quick helper to create common action patterns
     */
    protected function createAction(
        string $label,
        string $route,
        string $variant = 'secondary',
        ?string $icon = null,
        ?string $permission = null
    ): array {
        return array_filter([
            'label' => $label,
            'href' => $route,
            'variant' => $variant,
            'icon' => $icon,
            'permission' => $permission,
        ]);
    }

    /**
     * Create a primary action (common for "Create" buttons)
     */
    protected function createPrimaryAction(string $label, string $route, ?string $icon = 'PlusIcon', ?string $permission = null): array
    {
        return $this->createAction($label, $route, 'primary', $icon, $permission);
    }

    /**
     * Create a secondary action (common for "View" or "Export" buttons)
     */
    protected function createSecondaryAction(string $label, string $route, ?string $icon = null, ?string $permission = null): array
    {
        return $this->createAction($label, $route, 'secondary', $icon, $permission);
    }

    /**
     * Create a danger action (common for "Delete" buttons)
     */
    protected function createDangerAction(string $label, string $route, ?string $icon = 'TrashIcon', ?string $permission = null): array
    {
        return $this->createAction($label, $route, 'danger', $icon, $permission);
    }
}