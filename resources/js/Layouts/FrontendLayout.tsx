import React from 'react';
import Header from '@/Components/Header';

interface FrontendLayoutProps {
  children: React.ReactNode;
}

const FrontendLayout: React.FC<FrontendLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <footer className="bg-blue-600 text-white py-6 text-center">
        <p>&copy; {new Date().getFullYear()} Ocean Decade Portal. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default FrontendLayout;