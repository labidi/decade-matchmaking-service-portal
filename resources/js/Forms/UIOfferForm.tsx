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
                type: 'raw_select',
                required: true,
                label: 'Partner',
                description: 'Select a partner from the list',
                placeholder: 'Select a partner',
                options: [], // Will be filled dynamically in FieldRenderer
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
