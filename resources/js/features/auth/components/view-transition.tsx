import { Transition } from '@headlessui/react';
import { Fragment, ReactNode } from 'react';

type TransitionDirection = 'forward' | 'backward';

interface ViewTransitionProps {
    show: boolean;
    direction?: TransitionDirection;
    children: ReactNode;
}

/**
 * ViewTransition Component
 *
 * Provides smooth slide transitions for view switching in dialogs.
 * - Forward navigation: slides in from right
 * - Backward navigation: slides in from left
 * - Includes fade effect for polish
 */
export function ViewTransition({ show, direction = 'forward', children }: ViewTransitionProps) {
    const isForward = direction === 'forward';

    return (
        <Transition
            show={show}
            as={Fragment}
            enter="transform transition duration-1500 ease-out"
            enterFrom={isForward ? 'translate-x-full opacity-100' : '-translate-x-full opacity-100'}
            enterTo="translate-x-0 opacity-100"
            leave="transform transition duration-1500 ease-in"
            leaveFrom="translate-x-0 opacity-100"
            leaveTo={isForward ? '-translate-x-full opacity-100' : 'translate-x-full opacity-100'}
        >
            <div className="w-full">
                {children}
            </div>
        </Transition>
    );
}
