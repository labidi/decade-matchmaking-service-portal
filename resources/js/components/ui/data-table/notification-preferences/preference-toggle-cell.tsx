import React from 'react';
import { Switch } from '@/components/ui/switch';
import { PreferenceToggleCellProps } from '@/types';

export function PreferenceToggleCell({ 
    preference, 
    type, 
    onToggle, 
    disabled = false 
}: PreferenceToggleCellProps) {
    const isEnabled = preference[type];
    
    const handleToggle = () => {
        if (!disabled) {
            onToggle(preference, type);
        }
    };

    return (
        <div className="flex justify-center">
            <Switch 
                checked={isEnabled}
                onChange={handleToggle}
                disabled={disabled}
                color={isEnabled ? 'indigo' : 'dark/zinc'}
                aria-label={`Toggle email notifications for ${preference.attribute_value}`}
            />
        </div>
    );
}