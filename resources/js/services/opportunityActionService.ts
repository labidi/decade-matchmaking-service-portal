import { router } from '@inertiajs/react';
import { Opportunity } from '@/types';

/**
 * OpportunityActionService - Centralized service for all opportunity-related actions
 *
 * This service consolidates all opportunity action handlers to eliminate code duplication
 * between useOpportunityActions hook and other opportunity-related components.
 * It provides consistent route handling and error management across the application.
 */
export class OpportunityActionService {
    /**
     * Navigate to opportunity details page
     *
     * @param opportunity - The opportunity to view
     * @param context - The context for determining which route to use ('admin' for admin view, 'user' for user view)
     */
    static view(opportunity: Opportunity, context: 'admin' | 'user' = 'user'): void {
        if (!opportunity?.id) {
            console.warn('Invalid opportunity: missing ID');
            return;
        }
        const routeName = context === 'admin' ? 'admin.opportunity.show' : 'opportunity.show';
        router.visit(route(routeName, { id: opportunity.id }));
    }

    /**
     * Navigate to edit opportunity page
     *
     * @param opportunity - The opportunity to edit
     */
    static edit(opportunity: Opportunity): void {
        if (!opportunity?.id) {
            console.warn('Invalid opportunity: missing ID');
            return;
        }

        router.visit(route('opportunity.edit', { id: opportunity.id }));
    }

    /**
     * Delete an opportunity with confirmation and error handling
     *
     * @param opportunity - The opportunity to delete
     * @param onError - Optional error handler callback
     */
    static delete(opportunity: Opportunity, onError?: (errors: any) => void): void {
        if (!opportunity?.id) {
            console.warn('Invalid opportunity: missing ID');
            return;
        }

        const confirmMessage = 'Are you sure you want to delete this opportunity? This action cannot be undone.';

        if (confirm(confirmMessage)) {
            router.delete(route('partner.opportunity.destroy', { id: opportunity.id }), {
                onError: (errors) => {
                    console.error('Error deleting opportunity:', errors);
                    if (onError) {
                        onError(errors);
                    }
                }
            });
        }
    }

    /**
     * Navigate to create new opportunity page
     */
    static create(): void {
        router.visit(route('opportunity.create'));
    }

    /**
     * Navigate to opportunity list page
     *
     * @param context - The context for determining which route to use ('admin', 'partner', or 'user')
     */
    static list(context: 'admin' | 'partner' | 'user' = 'user'): void {
        let routeName: string;

        switch (context) {
            case 'admin':
                routeName = 'admin.opportunity.list';
                break;
            case 'partner':
                routeName = 'opportunity.me.list';
                break;
            default:
                routeName = 'opportunity.list';
                break;
        }

        router.visit(route(routeName));
    }

    /**
     * Update opportunity status (requires status dialog management)
     * This is a specialized action that requires additional state management
     * and should be handled by the calling component
     *
     * @param opportunity - The opportunity to update status for
     * @param onUpdateStatus - Callback function to handle status update dialog management
     */
    static updateStatus(opportunity: Opportunity, onUpdateStatus?: (opportunity: Opportunity) => void): void {
        if (!opportunity?.id) {
            console.warn('Invalid opportunity: missing ID');
            return;
        }

        if (!onUpdateStatus) {
            console.warn('No status update handler provided');
            return;
        }

        onUpdateStatus(opportunity);
    }


    /**
     * Archive an opportunity (admin only)
     *
     * @param opportunity - The opportunity to archive
     * @param onError - Optional error handler callback
     */
    static archive(opportunity: Opportunity, onError?: (errors: any) => void): void {
        if (!opportunity?.id) {
            console.warn('Invalid opportunity: missing ID');
            return;
        }

        const confirmMessage = 'Are you sure you want to archive this opportunity?';

        if (confirm(confirmMessage)) {
            // This assumes an archive endpoint will be created
            // For now, we could use the status update with 'archived' status
            router.patch(route('partner.opportunity.status', { id: opportunity.id }), {
                status: 'archived'
            }, {
                onError: (errors) => {
                    console.error('Error archiving opportunity:', errors);
                    if (onError) {
                        onError(errors);
                    }
                }
            });
        }
    }

}
