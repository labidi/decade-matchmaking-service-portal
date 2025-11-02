import React from 'react';
import { clsx } from 'clsx';
import {RequestOffer} from '../types/offer.types';
import {ActionButton} from '@/components/actions/ActionButton';

export interface OfferActionButtonsProps {
    offer: RequestOffer;
    className?: string;
    layout?: 'horizontal' | 'vertical';
    onDialogOpen?: (dialogComponent: string, action: any) => void;
}

/**
 * OfferActionButtons - Renders action buttons for offers
 *
 * This component uses the Action Provider Pattern to render backend-driven actions.
 * Actions are determined server-side based on context, permissions, and entity state.
 */
export function OfferActionButtons({
    offer,
    className,
    layout = 'horizontal',
    onDialogOpen,
}: Readonly<OfferActionButtonsProps>) {

    // Use actions from backend if available, otherwise return null
    const actions = offer.actions || [];

    // Don't render anything if no actions are available
    if (actions.length === 0) {
        return null;
    }

    return (
        <div
            className={clsx(
                'offer-actions-buttons flex gap-3',
                layout === 'horizontal' ? 'flex-wrap items-center justify-end' : 'flex-col items-stretch',
                className
            )}
            role="group"
            aria-label="Offer action buttons"
        >
            {actions.map((action) => (
                <ActionButton
                    key={action.key}
                    action={action}
                    layout={layout}
                    onDialogOpen={onDialogOpen}
                />
            ))}
        </div>
    );
}