import React, { useState, useRef, useEffect } from 'react';
import { usePage, Link , useForm} from '@inertiajs/react';
import { Auth, User } from '@/types';

export default function UserDropdown() {
    const auth = usePage().props.auth as Auth;
    const user = auth.user;
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!user) {
        return null;
    }

    const form = useForm({});

    const handleSignOutFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(route('sign.out'), {
            onSuccess: () => {
                // close dialog or handle success
            },
        });
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
                    {user.first_name} {user.last_name}
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
                    <Link
                        href={route('request.list')}
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                        role="menuitem"
                    >
                        My Requests List
                    </Link>
                    <Link
                        href="#"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                        role="menuitem"
                    >
                        View Opportunties
                    </Link>

                    <form method="POST" onSubmit={handleSignOutFormSubmit}>
                        {/* Include CSRF token if needed */}
                        <button
                            type="submit"
                            className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                            role="menuitem"
                        >
                            Sign Out
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}
