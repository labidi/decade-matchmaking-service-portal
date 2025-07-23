import React from 'react';
import { Link } from '@inertiajs/react';

interface ActionButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    href?: string;
    type?: 'button' | 'link' | 'external';
    className?: string;
    id?: string;
}

const baseClasses = 'px-4 py-2 bg-firefly-200 text-gray-800 rounded hover:bg-firefly-300';

export default function ActionButton({ 
    children, 
    onClick, 
    href, 
    type = 'button', 
    className = '', 
    id 
}: ActionButtonProps) {
    const classes = `${baseClasses} ${className}`;

    if (type === 'external' && href) {
        return (
            <a href={href} className={classes} id={id}>
                {children}
            </a>
        );
    }

    if (type === 'link' && href) {
        return (
            <Link href={href} className={classes} id={id}>
                {children}
            </Link>
        );
    }

    return (
        <button onClick={onClick} className={classes} id={id} type="button">
            {children}
        </button>
    );
}