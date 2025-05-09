import React from 'react';
import { Link } from '@inertiajs/react';

const Header: React.FC = () => {
    return (
        <header className="bg-white text-gray-900">
            <header className="bg-firefly-950 text-white py-6 px-4 shadow">
                <div className="container mx-auto flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Ocean Portal</h1>
                    <nav className="space-x-6">
                        <a href="#about" className="hover:underline">Welcome Back</a>
                    </nav>
                </div>
            </header>
        </header>
    );
};

export default Header;
