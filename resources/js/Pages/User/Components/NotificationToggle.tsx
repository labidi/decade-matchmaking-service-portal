import React from 'react';
import { Switch, SwitchField } from '@/components/ui/switch';
import { Text } from '@/components/ui/text';

interface NotificationToggleProps {
    label: string;
    description?: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
    color?: 'blue' | 'amber' | 'green' | 'red';
    icon?: React.ReactNode;
}

export default function NotificationToggle({
    label,
    description,
    checked,
    onChange,
    disabled = false,
    color = 'blue',
    icon
}: NotificationToggleProps) {
    return (
        <SwitchField>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    {icon && (
                        <div className="flex-shrink-0">
                            {icon}
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        <Text className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                            {label}
                        </Text>
                        {description && (
                            <Text className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                                {description}
                            </Text>
                        )}
                    </div>
                </div>
                <Switch
                    color={color}
                    checked={checked}
                    onChange={onChange}
                    disabled={disabled}
                />
            </div>
        </SwitchField>
    );
}