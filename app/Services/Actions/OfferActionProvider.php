<?php

declare(strict_types=1);

namespace App\Services\Actions;

use App\Contracts\Actions\ActionProviderInterface;
use App\Models\Request\Offer;
use App\Models\User;

/**
 * Provides available actions for request offers.
 */
class OfferActionProvider implements ActionProviderInterface
{
    /**
     * Get available actions for an offer.
     *
     * @param mixed $entity The offer entity
     * @param User|null $user The current user
     * @param string|null $context The UI context (admin, user, etc.)
     * @return array<int, array<string, mixed>>
     */
    public function getActions(mixed $entity, ?User $user = null, ?string $context = null): array
    {
        if (!$entity instanceof Offer) {
            return [];
        }

        $actions = [];
        $request = $entity->request;

        // Accept Offer - for request owner
        if ($user && $request && $user->can('accept', $entity)) {
            $actions[] = [
                'key' => 'accept_offer',
                'label' => 'Accept Offer',
                'route' => route('offer.accept', ['id' => $entity->id]),
                'method' => 'POST',
                'enabled' => true,
                'style' => [
                    'color' => 'green',
                    'icon' => 'check',
                    'variant' => 'solid',
                ],
                'confirm' => 'Are you sure you want to accept this offer?',
            ];
        }


        // Request Clarifications - for request owner
        if ($user && $user->can('requestClarifications', $entity)) {
            $actions[] = [
                'key' => 'request_clarifications',
                'label' => 'Request Clarifications',
                'route' => route('offer.clarification-request', ['id' => $entity->id]),
                'method' => 'POST',
                'enabled' => true,
                'style' => [
                    'color' => 'blue',
                    'icon' => 'question-mark-circle',
                    'variant' => 'outline',
                ],
            ];
        }

        // Admin actions
        if ($context === 'admin' && $user) {
            // Edit Offer
            if ($user->can('update', $entity)) {
                $actions[] = [
                    'key' => 'edit',
                    'label' => 'Edit Offer',
                    'route' => route('admin.offer.edit', ['id' => $entity->id]),
                    'method' => 'GET',
                    'enabled' => true,
                    'style' => [
                        'color' => 'blue',
                        'icon' => 'pencil-square',
                        'variant' => 'outline',
                    ],
                ];
            }

            // Enable/Disable Offer
            if ($user->can('canEnableOrDisable', $entity)) {
                $isActive = $entity->status === 'active';
                
                $actions[] = [
                    'key' => $isActive ? 'disable' : 'enable',
                    'label' => $isActive ? 'Disable Offer' : 'Enable Offer',
//                    'route' => route('admin.offer.toggle', ['id' => $entity->id]),
                    'method' => 'POST',
                    'enabled' => true,
                    'style' => [
                        'color' => $isActive ? 'yellow' : 'green',
                        'icon' => $isActive ? 'pause' : 'play',
                        'variant' => 'outline',
                    ],
                ];
            }

            // Delete Offer
            if ($user->can('delete', $entity)) {
                $actions[] = [
                    'key' => 'delete',
                    'label' => 'Delete Offer',
                    'route' => route('admin.offer.destroy', ['id' => $entity->id]),
                    'method' => 'DELETE',
                    'enabled' => true,
                    'style' => [
                        'color' => 'red',
                        'icon' => 'trash',
                        'variant' => 'outline',
                    ],
                    'confirm' => 'This action cannot be undone. Are you sure you want to delete this offer?',
                ];
            }
        }

        return array_values($actions);
    }
}
