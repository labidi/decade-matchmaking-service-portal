<?php

namespace App\Services\Request;

use App\Models\Request;
use App\Models\User;
use App\Policies\RequestPolicy;
use Illuminate\Support\Facades\Gate;

class RequestPermissionService
{
    public function __construct(
        private readonly RequestPolicy $policy
    ) {
    }

    /**
     * Get all permissions for a request for the current authenticated user.
     */
    public function getPermissions(Request $request, ?User $user = null): array
    {
        $user = $user ?? auth()->user();

        return [
            'can_view' => $this->policy->view($user, $request),
            'can_edit' => $this->policy->update($user, $request),
            'can_delete' => $this->policy->delete($user, $request),
            'can_manage_offers' => $this->policy->manageOffers($user, $request),
            'can_update_status' => $this->policy->updateStatus($user, $request),
            'can_accept_offer' => $this->policy->acceptOffer($user, $request),
            'can_request_clarifications' => $this->policy->requestClarifications($user, $request),
            'can_withdraw' => $this->policy->withdraw($user, $request),
            'can_export_pdf' => $this->policy->exportPdf($user, $request),
            'can_express_interest' => $this->policy->expressInterest($user, $request),
        ];
    }


    /**
     * Get specific actions based on context (e.g., for frontend UI).
     * This method provides a cleaner interface for frontend components.
     */
    public function getRequestDetailActions(Request $request, ?User $user = null): array
    {
        $user = $user ?? auth()->user();
        $permissions = $this->getPermissions($request, $user);

        // Map to frontend-expected action names
        return [
            'canEdit' => $permissions['can_edit'],
            'canDelete' => $permissions['can_delete'],
            'canCreate' => false, // This would be context-dependent
            'canExpressInterest' => $permissions['can_express_interest'],
            'canExportPdf' => $permissions['can_export_pdf'],
            'canAcceptOffer' => $permissions['can_accept_offer'],
            'canRequestClarificationForOffer' => $permissions['can_request_clarifications'],
            'canWithdraw' => $permissions['can_withdraw'],
            'canManageOffers' => $permissions['can_manage_offers'],
            'canUpdateStatus' => $permissions['can_update_status'],
        ];
    }

    /**
     * Get actions for admin context specifically.
     */
    public function getAdminActions(Request $request, User $user): array
    {
        if (!$user->administrator) {
            return [];
        }

        return [
            'can_view' => true,
            'can_manage_offers' => true,
            'can_update_status' => true,
            'can_request_clarifications' => true,
            'can_export_pdf' => true,
            'can_delete' => $this->policy->delete($user, $request),
            'can_edit' => $this->policy->update($user, $request),
        ];
    }

    /**
     * Check if user has any permissions for the request.
     */
    public function hasAnyPermission(Request $request, ?User $user = null): bool
    {
        $permissions = $this->getPermissions($request, $user);

        return collect($permissions)->contains(true);
    }

    /**
     * Get permissions using Laravel's Gate facade for consistency.
     * This method can be used as an alternative approach.
     */
    public function getActionsUsingGate(Request $request, ?User $user = null): array
    {
        $user = $user ?? auth()->user();

        return [
            'can_view' => Gate::forUser($user)->allows('view', $request),
            'can_edit' => Gate::forUser($user)->allows('update', $request),
            'can_delete' => Gate::forUser($user)->allows('delete', $request),
            'can_manage_offers' => Gate::forUser($user)->allows('manageOffers', $request),
            'can_update_status' => Gate::forUser($user)->allows('updateStatus', $request),
            'can_accept_offer' => Gate::forUser($user)->allows('acceptOffer', $request),
            'can_request_clarifications' => Gate::forUser($user)->allows('requestClarifications', $request),
            'can_withdraw' => Gate::forUser($user)->allows('withdraw', $request),
            'can_export_pdf' => Gate::forUser($user)->allows('exportPdf', $request),
            'can_express_interest' => Gate::forUser($user)->allows('expressInterest', $request),
        ];
    }

    /**
     * Validate that a user can perform a specific action on a request.
     */
    public function authorize(string $action, Request $request, ?User $user = null): bool
    {
        $user = $user ?? auth()->user();

        return match($action) {
            'view' => $this->policy->view($user, $request),
            'update', 'edit' => $this->policy->update($user, $request),
            'delete' => $this->policy->delete($user, $request),
            'manageOffers' => $this->policy->manageOffers($user, $request),
            'updateStatus' => $this->policy->updateStatus($user, $request),
            'acceptOffer' => $this->policy->acceptOffer($user, $request),
            'requestClarifications' => $this->policy->requestClarifications($user, $request),
            'withdraw' => $this->policy->withdraw($user, $request),
            'exportPdf' => $this->policy->exportPdf($user, $request),
            'expressInterest' => $this->policy->expressInterest($user, $request),
            default => false,
        };
    }
}
