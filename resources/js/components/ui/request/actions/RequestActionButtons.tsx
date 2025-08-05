import React from 'react';
import { Button } from '@/components/ui/button';
import { Dropdown, DropdownButton, DropdownItem, DropdownMenu, DropdownDivider } from '@/components/ui/dropdown';
import { ChevronDownIcon } from '@heroicons/react/16/solid';
import { RequestActionsProvider } from './RequestActionsProvider';
import { RequestActionButtonsProps, RequestAction } from '@/types/request-actions';
import { clsx } from 'clsx';

/**
 * RequestActionButtons - Renders request actions as buttons
 *
 * This component provides multiple layout options for displaying request actions:
 * - horizontal: Buttons arranged horizontally
 * - vertical: Buttons stacked vertically
 * - dropdown: Actions in a dropdown menu
 */
export function RequestActionButtons({
    request,
    config = {},
    availableStatuses = [],
    onStatusUpdate,
    layout = 'horizontal',
    className,
    buttonSize = 'md'
}: RequestActionButtonsProps) {

    const renderHorizontalButtons = (actions: RequestAction[]) => (
        <div className={clsx('flex flex-wrap gap-2', className)}>
            {actions.map((action) => (
                <Button
                    key={action.key}
                    onClick={action.onClick}
                    disabled={action.disabled}
                    className={clsx(
                        action.className,
                        {
                            'text-sm px-3 py-1.5': buttonSize === 'sm',
                            'text-sm px-4 py-2': buttonSize === 'md',
                            'text-base px-6 py-3': buttonSize === 'lg'
                        }
                    )}
                    color={getButtonColor(action.variant)}
                >
                    {action.icon && (
                        <action.icon className="h-4 w-4 mr-2" data-slot="icon" />
                    )}
                    {action.label}
                </Button>
            ))}
        </div>
    );

    const renderVerticalButtons = (actions: RequestAction[]) => (
        <div className={clsx('flex flex-col gap-2', className)}>
            {actions.map((action, index) => (
                <React.Fragment key={action.key}>
                    {action.divider && index > 0 && (
                        <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
                    )}
                    <Button
                        onClick={action.onClick}
                        disabled={action.disabled}
                        className={clsx(
                            'justify-start',
                            action.className,
                            {
                                'text-sm px-3 py-1.5': buttonSize === 'sm',
                                'text-sm px-4 py-2': buttonSize === 'md',
                                'text-base px-6 py-3': buttonSize === 'lg'
                            }
                        )}
                        color={getButtonColor(action.variant)}
                    >
                        {action.icon && (
                            <action.icon className="h-4 w-4 mr-2" data-slot="icon" />
                        )}
                        {action.label}
                    </Button>
                </React.Fragment>
            ))}
        </div>
    );

    const renderDropdownButtons = (actions: RequestAction[]) => (
        <div className={className}>
            <Dropdown>
                <DropdownButton
                    color="white"
                    className="flex items-center gap-2"
                >
                    Actions
                    <ChevronDownIcon className="h-4 w-4" />
                </DropdownButton>
                <DropdownMenu anchor="bottom end">
                    {actions.map((action, index) => (
                        <React.Fragment key={action.key}>
                            {action.divider && index > 0 && <DropdownDivider />}
                            <DropdownItem
                                onClick={action.onClick}
                                className={action.className}
                                disabled={action.disabled}
                            >
                                <div className="flex items-center">
                                    {action.icon && (
                                        <action.icon className="h-4 w-4 mr-2" data-slot="icon" />
                                    )}
                                    {action.label}
                                </div>
                            </DropdownItem>
                        </React.Fragment>
                    ))}
                </DropdownMenu>
            </Dropdown>
        </div>
    );

    return (
        <RequestActionsProvider
            request={request}
            config={config}
            availableStatuses={availableStatuses}
            onStatusUpdate={onStatusUpdate}
        >
            {(actions) => {
                if (!actions || actions.length === 0) {
                    return null;
                }

                switch (layout) {
                    case 'vertical':
                        return renderVerticalButtons(actions);
                    case 'dropdown':
                        return renderDropdownButtons(actions);
                    case 'horizontal':
                    default:
                        return renderHorizontalButtons(actions);
                }
            }}
        </RequestActionsProvider>
    );
}

// Helper function to map action variants to button colors
function getButtonColor(variant?: string) {
    switch (variant) {
        case 'primary':
            return 'blue';
        case 'danger':
            return 'red';
        case 'success':
            return 'green';
        case 'secondary':
        default:
            return 'zinc';
    }
}
