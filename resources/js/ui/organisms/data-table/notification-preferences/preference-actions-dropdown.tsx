import React from 'react';
import { DropdownActions, Action } from '@ui/organisms/data-table/common';
import { PreferenceActionsDropdownProps } from '@/types';

export function PreferenceActionsDropdown({ 
    preference, 
    onEdit, 
    onDelete, 
    disabled = false 
}: PreferenceActionsDropdownProps) {
    
    const actions: Action[] = [];

    // Add edit action if handler is provided
    if (onEdit) {
        actions.push({
            key: 'edit',
            label: 'Edit Preference',
            onClick: () => onEdit(preference),
            disabled
        });
    }

    // Add delete action
    actions.push({
        key: 'delete',
        label: 'Delete Preference',
        onClick: () => onDelete(preference),
        disabled,
        divider: actions.length > 0
    });

    return (
        <DropdownActions actions={actions} />
    );
}