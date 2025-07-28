import React from 'react';
import {RequestOffer} from '@/types';
import {EllipsisHorizontalIcon} from '@heroicons/react/16/solid';
import {Dropdown, DropdownButton, DropdownDivider, DropdownItem, DropdownMenu} from '@/components/ui/dropdown';

export interface OfferAction {
    key: string;
    label: string;
    onClick: (offer: RequestOffer) => void;
    divider?: boolean;
    className?: string;
}

interface OffersActionColumnProps {
    row: RequestOffer;
    actions: OfferAction[];
}

export function OffersActionColumn({row, actions}: OffersActionColumnProps) {
    if (!actions || actions.length === 0) {
        return null;
    }

    return (
        <Dropdown>
            <DropdownButton plain>
                <EllipsisHorizontalIcon className="size-4"/>
            </DropdownButton>
            <DropdownMenu anchor="bottom end">
                {actions.map((action, index) => (
                    <React.Fragment key={action.key}>
                        {action.divider && index > 0 && <DropdownDivider/>}
                        <DropdownItem
                            onClick={() => action.onClick(row)}
                            className={action.className}
                        >
                            {action.label}
                        </DropdownItem>
                    </React.Fragment>
                ))}
            </DropdownMenu>
        </Dropdown>
    );
}