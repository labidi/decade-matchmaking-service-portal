import React from 'react';
import { Dropdown, DropdownButton, DropdownItem, DropdownMenu, DropdownDivider } from '@ui/primitives/dropdown';
import { ChevronDownIcon } from '@heroicons/react/16/solid';

export interface Action {
    key: string;
    label: string;
    onClick: () => void;
    divider?: boolean;
    disabled?: boolean;
}

interface DropdownActionsProps {
    actions: Action[];
}

export function DropdownActions({ actions }: DropdownActionsProps) {
    if (!actions || actions.length === 0) {
        return null;
    }

    return (
        <Dropdown>
            <DropdownButton color="white" className="flex items-center gap-2">
                Actions
                <ChevronDownIcon className="h-4 w-4" />
            </DropdownButton>
            <DropdownMenu anchor="bottom end">
                {actions.map((action, index) => (
                    <React.Fragment key={action.key}>
                        {action.divider && index > 0 && <DropdownDivider />}
                        <DropdownItem
                            onClick={action.onClick}
                            disabled={action.disabled}
                        >
                            {action.label}
                        </DropdownItem>
                    </React.Fragment>
                ))}
            </DropdownMenu>
        </Dropdown>
    );
}
