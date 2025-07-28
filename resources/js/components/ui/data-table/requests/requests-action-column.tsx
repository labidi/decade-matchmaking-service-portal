import {Dropdown, DropdownButton, DropdownItem, DropdownMenu, DropdownDivider} from '@/components/ui/dropdown'
import {ChevronDownIcon} from '@heroicons/react/16/solid'
import {OCDRequest} from '@/types';

export interface RequestAction {
    key: string;
    label: string;
    onClick: (request: OCDRequest) => void;
    href?: string;
    divider?: boolean;
}

interface RequestsActionColumnProps {
    row: OCDRequest;
    actions?: RequestAction[];
}

export function RequestsActionColumn({
                                         row,
                                         actions = []
                                     }: Readonly<RequestsActionColumnProps>) {
    if (actions.length === 0) {
        return null;
    }

    return (
        <Dropdown>
            <DropdownButton color="white" className="flex items-center gap-2">
                Actions
                <ChevronDownIcon className="h-4 w-4"/>
            </DropdownButton>
            <DropdownMenu>
                {actions.map((action, index) => (
                    <>
                        <DropdownItem onClick={() => action.onClick(row)}>
                            {action.label}
                        </DropdownItem>
                        {action.divider && index < actions.length - 1 && <DropdownDivider/>}
                    </>
                ))}
            </DropdownMenu>
        </Dropdown>
    )
}
