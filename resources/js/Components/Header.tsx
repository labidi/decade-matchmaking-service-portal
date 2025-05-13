import React from 'react';
import { Link } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';

const Header: React.FC = () => {
    return (
        <header className="bg-white text-gray-900">
            <header className="bg-firefly-900 text-white py-2 px-4 shadow">
                <div className="container mx-auto flex items-center justify-between">
                    <ApplicationLogo />
                    <nav className="space-x-6">
                        <a href="#about" className="hover:underline">Welcome Back</a>
                    </nav>
                </div>
            </header>
        </header>
    );
};

export default Header;
