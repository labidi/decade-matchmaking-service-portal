// Notification preferences feature barrel export
// Exports: preference forms, preference management components

// Components
export { default as AddPreferenceDialog } from './components/add-preference-dialog';
export { default as DeletePreferenceDialog } from './components/delete-preference-dialog';
export { default as PreferencesList } from './components/preferences-list';
export { default as PreferenceCard } from './components/preference-card';
export { default as NotificationToggle } from './components/notification-toggle';
export { default as AddPreferenceForm } from './components/add-preference-form';
export { default as EmptyState } from './components/empty-state';

// Hooks
export { useNotificationPreferenceActions } from './hooks/use-notification-preference-actions';

// Types
export type {
    NotificationEntityType,
    UserNotificationPreference,
    NotificationPreferenceFormData,
    NotificationPreferencesPagination,
    NotificationPreferencesPagePropsWithPagination
} from './types/notification-preferences.types';
export { NOTIFICATION_ENTITY_TYPES } from './types/notification-preferences.types';
