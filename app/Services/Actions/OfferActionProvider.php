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

        if ($user && $user->can('uploadFinancialBreakDown', $entity)) {
            $actions[] = [
                'key' => 'upload_financial_breakdown',
                'label' => 'Upload Financial Breakdown report',
                'route' => route('offer.documents.upload', ['id' => $entity->id, 'type' => 'financial_breakdown']),
                'method' => 'POST',
                'enabled' => true,
                'style' => [
                    'color' => 'blue',
                    'icon' => 'document-arrow-up',
                    'variant' => 'outline',
                ],
                'metadata' => [
                    'handler' => 'dialog',
                    'dialog_component' => 'FileUploadDialogProps',
                    'dialog_props' => [
                        'accept' => '.pdf,.xlsx,.xls,.csv',
                        'maxSize' => 10,  // MB
                        'multiple' => false,
                        'endpoint' => route('offer.documents.upload', ['id' => $entity->id, 'type' => 'financial_breakdown']),
                        'documentType' => 'financial_breakdown',
                        'title' => 'Upload Financial Breakdown',
                        'description' => 'Please upload a detailed financial breakdown document (PDF, Excel, or CSV format)',
                        'validationRules' => [
                            'required' => true,
                            'mimeTypes' => ['application/pdf', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv'],
                            'maxSizeBytes' => 10485760,  // 10MB
                        ],
                    ],
                ],
            ];
        }
        if ($user && $user->can('uploadLessonLearned', $entity)) {
            $actions[] = [
                'key' => 'upload_lesson_learned',
                'label' => 'Upload Lesson Learned Report',
                'route' => route('offer.documents.upload', ['id' => $entity->id, 'type' => 'lesson_learned']),
                'method' => 'POST',
                'enabled' => true,
                'style' => [
                    'color' => 'blue',
                    'icon' => 'document-arrow-up',
                    'variant' => 'outline',
                ],
                'metadata' => [
                    'handler' => 'dialog',
                    'dialog_component' => 'FileUploadDialogProps',
                    'dialog_props' => [
                        'accept' => '.pdf,.xlsx,.xls,.csv',
                        'maxSize' => 10,  // MB
                        'multiple' => false,
                        'endpoint' => route('offer.documents.upload', ['id' => $entity->id, 'type' => 'lesson_learned']),
                        'documentType' => 'financial_breakdown',
                        'title' => 'Upload Lesson Learned report',
                        'description' => 'Please Upload Lesson Learned report document (PDF, Excel, or CSV format)',
                        'validationRules' => [
                            'required' => true,
                            'mimeTypes' => ['application/pdf', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv'],
                            'maxSizeBytes' => 10485760,  // 10MB
                        ],
                    ],
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
