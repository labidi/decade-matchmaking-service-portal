import '../css/app.css';
import './bootstrap';

import {createInertiaApp} from '@inertiajs/react';
import {resolvePageComponent} from 'laravel-vite-plugin/inertia-helpers';
import {createRoot} from 'react-dom/client';
import {ConfirmationProvider} from '@/components/ui/confirmation';
import {initDarkMode} from '@/utils/darkMode';

// Initialize dark mode detection
initDarkMode();

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.tsx`,
            import.meta.glob('./Pages/**/*.tsx'),
        ),
    setup({el, App, props}) {
        const root = createRoot(el);
        root.render(
            <ConfirmationProvider>
                <App {...props} />
            </ConfirmationProvider>
        );
    },
    progress: {
        color: '#4B5563',
    },
});
