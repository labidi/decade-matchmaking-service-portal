# Request Actions Components

This directory contains reusable components for managing request actions throughout the Ocean Decade Portal application.

## Components Overview

### 1. RequestActionsProvider
A provider component that generates request actions based on user permissions and context.

### 2. RequestActionButtons  
A component that renders request actions as buttons with multiple layout options.

### 3. useRequestActions Hook
A custom hook that contains the core business logic for generating request actions.

### 4. getRequestActionsLegacy Function
A legacy-compatible function for existing data table implementations.

## Usage Examples

### Using RequestActionButtons in a Page

```tsx
import React, { useState } from 'react';
import { RequestActionButtons } from '@/components/ui/request/actions';
import { UpdateStatusDialog } from '@/components/ui/dialogs/UpdateStatusDialog';

export default function RequestShowPage({ request, availableStatuses }) {
    const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);

    const handleUpdateStatus = (request) => {
        setSelectedRequest(request);
        setIsStatusDialogOpen(true);
    };

    return (
        <div>
            {/* Action buttons in horizontal layout */}
            <RequestActionButtons
                request={request}
                config={{
                    context: 'show',
                    showViewDetails: false, // Hide since we're on details page
                    showUpdateStatus: true,
                    showOfferActions: true
                }}
                availableStatuses={availableStatuses}
                onStatusUpdate={handleUpdateStatus}
                layout="horizontal"
                buttonSize="md"
            />

            {/* Status Update Dialog */}
            <UpdateStatusDialog
                isOpen={isStatusDialogOpen}
                onClose={() => {
                    setIsStatusDialogOpen(false);
                    setSelectedRequest(null);
                }}
                request={selectedRequest}
                availableStatuses={availableStatuses}
            />
        </div>
    );
}
```

### Using RequestActionsProvider with Custom Rendering

```tsx
import { RequestActionsProvider } from '@/components/ui/request/actions';

function CustomActionsRenderer({ request }) {
    return (
        <RequestActionsProvider
            request={request}
            config={{
                context: 'modal',
                showViewDetails: true,
                showUpdateStatus: false,
                customActions: [
                    {
                        key: 'custom-action',
                        label: 'Custom Action',
                        onClick: () => console.log('Custom action clicked'),
                        variant: 'primary'
                    }
                ]
            }}
            onStatusUpdate={(req) => console.log('Status update for:', req.id)}
        >
            {(actions) => (
                <div className="grid grid-cols-1 gap-2">
                    {actions.map((action) => (
                        <button
                            key={action.key}
                            onClick={action.onClick}
                            disabled={action.disabled}
                            className="p-2 bg-blue-500 text-white rounded"
                        >
                            {action.label}
                        </button>
                    ))}
                </div>
            )}
        </RequestActionsProvider>
    );
}
```

### Using with Legacy Data Tables

```tsx
import { getRequestActionsLegacy } from '@/components/ui/request/actions';

export default function RequestListPage({ requests }) {
    const handleUpdateStatus = (request) => {
        // Handle status update
    };

    const getActionsForRequest = (request) => {
        return getRequestActionsLegacy(request, handleUpdateStatus);
    };

    return (
        <RequestsDataTable
            requests={requests}
            getActionsForRequest={getActionsForRequest}
            // ... other props
        />
    );
}
```

### Using the Hook Directly

```tsx
import { useRequestActions } from '@/components/ui/request/actions';

function MyComponent({ request }) {
    const actions = useRequestActions(
        request,
        {
            context: 'list',
            showViewDetails: true,
            showUpdateStatus: true,
            showOfferActions: false
        },
        (req) => console.log('Update status for:', req.id)
    );

    return (
        <div>
            {actions.map((action) => (
                <button key={action.key} onClick={action.onClick}>
                    {action.label}
                </button>
            ))}
        </div>
    );
}
```

## Configuration Options

### RequestActionsConfig

```typescript
interface RequestActionsConfig {
    /** Whether to show the "View Details" action */
    showViewDetails?: boolean;
    /** Whether to show the "Update Status" action */
    showUpdateStatus?: boolean;
    /** Whether to show offer-related actions */
    showOfferActions?: boolean;
    /** Custom context for action generation */
    context?: 'list' | 'show' | 'modal';
    /** Additional custom actions to include */
    customActions?: RequestAction[];
}
```

### Layout Options for RequestActionButtons

- `horizontal`: Buttons arranged horizontally (default)
- `vertical`: Buttons stacked vertically
- `dropdown`: Actions in a dropdown menu

### Button Sizes

- `sm`: Small buttons
- `md`: Medium buttons (default)
- `lg`: Large buttons

## Action Variants

Actions support different visual variants:
- `primary`: Blue styling (default for important actions)
- `secondary`: Gray styling (default for secondary actions)
- `success`: Green styling (for positive actions)
- `danger`: Red styling (for destructive actions)

## Permissions-Based Actions

Actions are automatically generated based on request permissions:

- **View Details**: Shown if `request.can_view` is true
- **Update Status**: Shown if `request.can_update_status` is true
- **Add New Offer**: Shown if `request.can_manage_offers` is true
- **See Request Offers**: Shown if `request.can_manage_offers` is true

## Context-Aware Behavior

The `context` configuration affects which actions are shown:

- `list`: Shows all applicable actions including "View Details"
- `show`: Hides "View Details" since user is already viewing details
- `modal`: Custom context for modal dialogs

## Extensibility

You can easily add custom actions using the `customActions` configuration:

```typescript
const customActions: RequestAction[] = [
    {
        key: 'export-pdf',
        label: 'Export PDF',
        icon: DocumentArrowDownIcon,
        onClick: () => exportToPDF(request),
        variant: 'secondary'
    },
    {
        key: 'duplicate',
        label: 'Duplicate Request',
        icon: DocumentDuplicateIcon,
        onClick: () => duplicateRequest(request),
        variant: 'primary',
        divider: true
    }
];
```

## Best Practices

1. **Always provide onStatusUpdate**: When using status update functionality, always provide the handler
2. **Use appropriate context**: Set the correct context to avoid showing irrelevant actions
3. **Handle permissions**: The components respect request permissions automatically
4. **Provide availableStatuses**: Include available statuses for status update functionality
5. **Use consistent layouts**: Stick to one layout pattern within the same interface
6. **Consider mobile**: Horizontal layouts work well on desktop, dropdown might be better for mobile

## Integration with Existing Code

The components are designed to work alongside existing implementations:

- Use `getRequestActionsLegacy` for data table compatibility
- Use `RequestActionButtons` for new UI implementations
- Use `RequestActionsProvider` for custom rendering requirements
- Use `useRequestActions` hook for direct access to action logic

This approach ensures backward compatibility while providing modern, reusable components for future development.