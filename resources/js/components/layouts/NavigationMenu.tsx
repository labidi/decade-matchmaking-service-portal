import React, { useState, useRef, useEffect } from 'react';
import { usePage, Link, useForm } from '@inertiajs/react';
import { Auth, NavigationConfig, NavigationItem } from '@/types';
import * as HeroIcons from '@heroicons/react/16/solid';

export default function NavigationMenu() {
    const { auth, navigation } = usePage<{ 
        auth: Auth; 
        navigation?: NavigationConfig;
    }>().props;
    
    const user = auth.user;
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const form = useForm({});

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!user || !navigation?.user) {
        return null;
    }

    const getIconComponent = (iconName?: string) => {
        if (!iconName) return null;
        return HeroIcons[iconName as keyof typeof HeroIcons] || null;
    };

    const handleAction = (item: NavigationItem, e: React.FormEvent) => {
        e.preventDefault();
        if (item.action === 'sign-out') {
            form.post(route('sign.out'));
        }
    };

    const renderBadge = (badge?: NavigationItem['badge']) => {
        if (!badge) return null;
        
        const badgeClasses = {
            danger: 'bg-red-600 text-white',
            warning: 'bg-yellow-600 text-white',
            info: 'bg-blue-600 text-white',
            primary: 'bg-blue-600 text-white'
        };
        
        const className = badgeClasses[badge.variant ?? 'primary'];
        
        return (
            <span className={`ml-2 rounded-full px-2 text-xs ${className}`}>
                {badge.value}
            </span>
        );
    };

    const renderNavigationItem = (item: NavigationItem, index: number) => {
        if (item.divider) {
            return <hr key={`${item.id}-${index}`} className="border-gray-200 my-1" />;
        }

        if (!item.visible) {
            return null;
        }

        const Icon = getIconComponent(item.icon);

        if (item.action) {
            return (
                <form key={item.id} onSubmit={(e) => handleAction(item, e)}>
                    <button
                        type="submit"
                        className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center"
                        role="menuitem"
                    >
                        {Icon && <Icon className="w-4 h-4 mr-2" />}
                        <span>{item.label}</span>
                        {renderBadge(item.badge)}
                    </button>
                </form>
            );
        }

        const href = item.route ? route(item.route) : item.href;
        
        return (
            <Link
                key={item.id}
                href={href ?? '#'}
                className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
                role="menuitem"
            >
                {Icon && <Icon className="w-4 h-4 mr-2" />}
                <span>{item.label}</span>
                {renderBadge(item.badge)}
            </Link>
        );
    };

    return (
        <div ref={ref} className="relative">
            {/* Toggle Button */}
            <button
                onClick={() => setOpen(!open)}
                aria-haspopup="true"
                aria-expanded={open}
                className="inline-flex items-center px-3 py-2 text-white-700 focus:outline-none text-xl"
            >
                <span className="mr-2">
                    {navigation.user.displayName}
                </span>
                <svg
                    className={`w-4 h-4 transform transition-transform ${open ? 'rotate-180' : ''}`}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Dropdown Menu */}
            {open && (
                <div
                    className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50"
                    role="menu"
                    aria-orientation="vertical"
                >
                    {navigation.items.map((item, index) => 
                        renderNavigationItem(item, index)
                    )}
                </div>
            )}
        </div>
    );
}
