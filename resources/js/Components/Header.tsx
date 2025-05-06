import React from 'react';
import { Link } from '@inertiajs/react';

const Header: React.FC = () => {
  return (
    <header className="bg-blue-600 text-white py-6 px-4 shadow">
      <div className="container mx-auto flex items-center justify-between">
        <h1 className="text-2xl font-bold">Ocean Portal</h1>
        <nav className="space-x-6">
          <Link href="/" className="hover:underline">Home</Link>
          <Link href="/about" className="hover:underline">About</Link>
          <Link href="/contact" className="hover:underline">Contact</Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
