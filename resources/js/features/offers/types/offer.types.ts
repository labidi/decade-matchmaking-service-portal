import {Document, OCDRequest, User} from "@/types/index";
import {EntityAction} from '@/types/actions';

export interface RequestOfferPermissions {
    can_view: boolean;
    can_edit: boolean;
    can_enable: boolean;
    can_disable: boolean;
    can_delete: boolean;
    can_accept: boolean;
    can_reject: boolean;
    can_request_clarifications: boolean;
    can_manage_documents: boolean;
}

export interface RequestOffer {
    id: number;
    description: string;
    matched_partner_id: number;
    status: { value: string; label: string };
    created_at: string;
    updated_at: string;
    is_accepted: boolean;
    documents?: Document[];
    request: OCDRequest;
    matched_partner?: User;
    permissions: RequestOfferPermissions;
    actions?: EntityAction[]; // Actions from backend Action Provider Pattern
}

export type RequestOfferList = RequestOffer[];
