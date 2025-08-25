import {router} from '@inertiajs/react';
import {RequestOffer} from '@/types';

/**
 * OfferActionService - Centralized service for all offer-related actions
 *
 * This service consolidates all offer action handlers to eliminate code duplication
 * between useOfferActions hook and components.
 * It provides consistent route handling and error management across the application.
 */
export class OfferActionService {
    /**
     * Accept an offer
     */
    static accept(offer: RequestOffer): void {
        router.post(route('offer.accept', {
            id: offer.id,
        }));
    }

    /**
     * Reject an offer
     */
    static reject(offer: RequestOffer): void {
        router.post(route('admin.offer.update-status', {
            id: offer.id
        }), {
            status: 'rejected'
        });
    }

    /**
     * Request clarifications for an offer
     */
    static requestClarifications(offer: RequestOffer): void {
        router.post(route('offer.clarification-request', {
            id: offer.id
        }));
    }

    /**
     * Navigate to view offer details page
     */
    static viewDetails(offer: RequestOffer, context: 'admin' | 'user' = 'admin'): void {
        const routeName = context === 'admin' ? 'admin.offer.show' : 'admin.offer.show';
        router.visit(route(routeName, {id: offer.id}));
    }

    /**
     * Navigate to edit offer page
     */
    static edit(offer: RequestOffer): void {
        router.visit(route('admin.offer.edit', {id: offer.id}));
    }

    /**
     * Delete an offer with confirmation and error handling
     */
    static delete(offer: RequestOffer, onError?: (errors: any) => void): void {
        const confirmMessage = 'Are you sure you want to delete this offer? This action cannot be undone.';

        if (confirm(confirmMessage)) {
            router.delete(route('admin.offer.destroy', {id: offer.id}), {
                onError: (errors) => {
                    console.error('Error deleting offer:', errors);
                    if (onError) {
                        onError(errors);
                    }
                }
            });
        }
    }

    /**
     * Navigate to manage documents page for offer
     */
    static manageDocuments(offer: RequestOffer): void {
        // This route might need to be created - for now using the edit page
        router.visit(route('admin.offer.edit', {id: offer.id}));
    }

    /**
     * Update offer status (requires status dialog management)
     * This is a specialized action that requires additional state management
     * and should be handled by the calling component
     */
    static updateStatus(offer: RequestOffer, onStatusUpdate: (offer: RequestOffer, statuses?: any[]) => void, availableStatuses?: any[]): void {
        onStatusUpdate(offer, availableStatuses);
    }

    /**
     * Export offer as PDF (if supported)
     */
    static exportPdf(offer: RequestOffer): void {
        // This route might need to be created
        window.open(route('admin.offer.show', {id: offer.id}) + '?format=pdf', '_blank');
    }

    /**
     * Navigate to the related request
     */
    static viewRequest(offer: RequestOffer): void {
        if (offer.request) {
            router.visit(route('admin.request.show', {id: offer.request.id}));
        } else {
            console.warn('No request associated with this offer');
        }
    }
}