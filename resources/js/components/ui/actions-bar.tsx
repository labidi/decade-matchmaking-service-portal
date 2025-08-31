import React from 'react';
import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { ActionButton } from '@/types';
import * as HeroIcons from '@heroicons/react/16/solid';

interface ActionsBarProps {
    actions?: ActionButton[];
    className?: string;
}

export function ActionsBar({ actions = [], className = '' }: ActionsBarProps) {
    if (actions.length === 0) return null;

    const handleAction = (action: ActionButton, event?: React.MouseEvent) => {
        // Prevent default behavior to avoid conflicts
        if (event) {
            event.preventDefault();
        }

        // Default method is GET - should not reach here for GET methods
        if (!action.method || action.method === 'GET') {
            return;
        }

        // Handle confirmation for destructive actions
        if (action.confirm && !window.confirm(action.confirm)) {
            return;
        }

        // Use Inertia router for non-GET methods
        const routerMethod = action.method.toLowerCase() as 'post' | 'put' | 'patch' | 'delete';

        const routerOptions = {
            data: action.data,
            preserveScroll: false,
            onError: (errors: any) => {
                console.error('Action failed:', errors);
            }
        };

        try {
            if (routerMethod === 'delete') {
                router.delete(action.href, routerOptions);
            } else if (routerMethod === 'post') {
                router.post(action.href, action.data || {}, {
                    preserveScroll: false,
                    onError: (errors: any) => {
                        console.error('POST action failed:', errors);
                    }
                });
            } else if (routerMethod === 'put') {
                router.put(action.href, action.data || {}, {
                    preserveScroll: false,
                    onError: (errors: any) => {
                        console.error('PUT action failed:', errors);
                    }
                });
            } else if (routerMethod === 'patch') {
                router.patch(action.href, action.data || {}, {
                    preserveScroll: false,
                    onError: (errors: any) => {
                        console.error('PATCH action failed:', errors);
                    }
                });
            }
        } catch (error) {
            console.error('Router action error:', error);
        }
    };

    return (
        <div className={`flex items-center gap-2 mb-6 ${className}`.trim()}>
            {actions.map((action, index) => {
                const Icon = action.icon ? HeroIcons[action.icon as keyof typeof HeroIcons] : null;
                const isGetRequest = !action.method || action.method === 'GET';

                return (
                    <Button
                        key={action.label + index}
                        href={isGetRequest ? action.href : undefined}
                        onClick={!isGetRequest ? (event: React.MouseEvent) => handleAction(action, event) : undefined}
                        color={getButtonColor(action.variant)}
                        className={"--color-firefly-900"}
                    >
                        {Icon && <Icon className="size-4" data-slot="icon" />}
                        {action.label}
                    </Button>
                );
            })}
        </div>
    );
}

function getButtonColor(variant?: string) {
    switch (variant) {
        case 'primary':
            return 'firefly';
        case 'secondary':
            return 'zinc';
        case 'danger':
            return 'red';
        default:
            return 'zinc';
    }
}
