import {UIField} from '@/types';

export interface Offer {
    description: string;
    partner_id: string;
    document: File | null;
    [key: string]: any;
}

export interface UIStep {
    label: string;
    fields: Record<string, UIField>;
}

export const UIOfferForm: UIStep[] = [
    {
        label: 'Offer Details',
        fields: {
            partner_id: {
                id: 'partner_id',
                type: 'text',
                required: true,
                label: 'Partner ID',
                description: 'Enter Unique ID (for partner)',
                placeholder: 'Partner ID',
            },
            description: {
                id: 'description',
                type: 'textarea',
                required: true,
                label: 'Offer Description',
                description: 'Add Offer Description',
                placeholder: 'Offer Description',
            },
            document: {
                id: 'document',
                type: 'file',
                required: true,
                label: 'Offer Document',
                description: 'Add Offer Document (PDF only)',
                accept: 'application/pdf',
            },
        },
    },
];
