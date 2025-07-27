import {Dropdown, DropdownButton, DropdownItem, DropdownMenu, DropdownDivider} from '@/components/ui/dropdown'
import {ChevronDownIcon} from '@heroicons/react/16/solid'
import {OCDRequest} from '@/types';


interface RequestsActionColumnProps {
    row: OCDRequest;
    onViewDetails?: (id: number) => void | null;
    onUpdateStatus?: (id: number) => void | null;
    onSeeActiveOffer?: (id: number) => void | null;
}

export function RequestsActionColumn({
                                         row,
                                         onViewDetails,
                                         onUpdateStatus,
                                         onSeeActiveOffer
                                     }: Readonly<RequestsActionColumnProps>) {
    return (
        <Dropdown>
            <DropdownButton color="white" className="flex items-center gap-2">
                Actions
                <ChevronDownIcon className="h-4 w-4"/>
            </DropdownButton>
            <DropdownMenu>
                <DropdownItem href={route('admin.request.show', row.id)}>View</DropdownItem>
                {onViewDetails && <DropdownItem onClick={() => onViewDetails(row.id)}>Quick view</DropdownItem>}
                {onUpdateStatus && <DropdownItem onClick={() => onUpdateStatus(row.id)}>Update Status</DropdownItem>}
                <DropdownDivider/>
                {onSeeActiveOffer &&
                    <DropdownItem onClick={() => onSeeActiveOffer(row.id)}>See active offer</DropdownItem>}
            </DropdownMenu>
        </Dropdown>
    )
}
