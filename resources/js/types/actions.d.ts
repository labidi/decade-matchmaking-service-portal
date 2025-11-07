/**
 * Action Provider Pattern - TypeScript Interfaces
 *
 * Type-safe interfaces for backend-driven actions.
 * Matches the simplified PHP array structure from backend.
 */

/**
 * Valid icon names that can be used in actions.
 * These must match the icons available in the icon mapper.
 */
export type ValidIconName =
    | 'check'
    | 'question-mark-circle'
    | 'pencil-square'
    | 'trash'
    | 'document-text'
    | 'document-arrow-up'
    | 'plus'
    | 'pencil'
    | 'arrow-right'
    | 'x-mark'
    | 'pause'
    | 'play';

/**
 * Valid button colors supported by Catalyst UI.
 */
export type ButtonColor =
    | 'red'
    | 'green'
    | 'blue'
    | 'yellow'
    | 'indigo'
    | 'purple'
    | 'orange'
    | 'cyan'
    | 'emerald'
    | 'pink';

/**
 * HTTP methods supported for action routes.
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * Visual styling configuration for an action.
 * Matches backend ActionStyle array structure.
 */
export interface ActionStyle {
    color?: ButtonColor;
    icon: ValidIconName;
    variant?: 'solid' | 'outline' | 'plain';
}

/**
 * File upload configuration for file upload actions.
 */
export interface FileUploadMetadata {
    accept?: string;
    maxSize?: number;
    multiple?: boolean;
    endpoint?: string;
    documentType?: string;
    title?: string;
    description?: string;
    validationRules?: {
        required?: boolean;
        mimeTypes?: string[];
        maxSizeBytes?: number;
    };
}

/**
 * Action metadata for additional configuration.
 * Matches backend metadata structure.
 */
export interface ActionMetadata {
    open_in_new_tab?: boolean;
    handler?: 'route' | 'dialog' | 'custom' | 'file_upload';
    dialog_component?: string;
    file_upload?: FileUploadMetadata;
}

/**
 * Complete action configuration from backend.
 * Matches the simplified PHP array structure.
 */
export interface EntityAction {
    key: string;
    label: string;
    route: string | null;
    method: HttpMethod;
    enabled: boolean;
    style: ActionStyle;
    confirm?: string;
    metadata?: ActionMetadata;
}
