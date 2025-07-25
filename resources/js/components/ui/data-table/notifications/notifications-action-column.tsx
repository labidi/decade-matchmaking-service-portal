import {Dropdown, DropdownButton, DropdownItem, DropdownMenu} from '@/components/ui/dropdown'
import {ChevronDownIcon} from '@heroicons/react/16/solid'
import {Notification} from '@/types';

interface NotificationsActionColumnProps {
    row: Notification;
    onMarkAsRead: (id: number) => void;
    onViewDetails: (id: number) => void;
}

export function NotificationsActionColumn({
                                              row,
                                              onMarkAsRead,
                                              onViewDetails
                                          }: Readonly<NotificationsActionColumnProps>) {
    return (
        <Dropdown>
            <DropdownButton color="white" className="flex items-center gap-2">
                Actions
                <ChevronDownIcon className="h-4 w-4"/>
            </DropdownButton>
            <DropdownMenu>
                <DropdownItem onClick={() => onMarkAsRead(row.id)}>Mark as Read</DropdownItem>
                <DropdownItem onClick={() => onViewDetails(row.id)}>View more Details</DropdownItem>
            </DropdownMenu>
        </Dropdown>
    )
}
