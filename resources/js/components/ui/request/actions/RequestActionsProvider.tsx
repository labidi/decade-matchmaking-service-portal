import React from 'react';
import { RequestActionsProviderProps } from '@/types/request-actions';
import { useRequestActions } from './useRequestActions';

/**
 * RequestActionsProvider - Provides request actions based on permissions and context
 * 
 * This component generates appropriate actions for a request based on user permissions
 * and provides them to child components via render props pattern.
 */
export function RequestActionsProvider({
    request,
    config = {},
    availableStatuses = [],
    onStatusUpdate,
    children
}: RequestActionsProviderProps) {
    const actions = useRequestActions(request, config, onStatusUpdate);

    return <>{children(actions)}</>;
}