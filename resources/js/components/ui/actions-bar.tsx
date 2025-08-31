import React from 'react';
import { Button } from '@/components/ui/button';
import { ActionButton } from '@/types';
import * as HeroIcons from '@heroicons/react/16/solid';

interface ActionsBarProps {
    actions?: ActionButton[];
    className?: string;
}

export function ActionsBar({ actions = [], className = '' }: ActionsBarProps) {
    if (actions.length === 0) return null;

    return (
        <div className={`flex items-center gap-2 mb-6 ${className}`.trim()}>
            {actions.map((action, index) => {
                const Icon = action.icon ? HeroIcons[action.icon as keyof typeof HeroIcons] : null;

                return (
                    <Button
                        key={action.label + index}
                        href={action.href}
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
