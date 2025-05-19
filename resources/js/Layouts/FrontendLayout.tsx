import React from 'react';
import Header from '@/Components/Header';
import Footer from '@/Components/Footer';
import Breadcrumb from '@/Components/Breadcrumb';

interface FrontendLayoutProps {
  children: React.ReactNode;
}

const FrontendLayout: React.FC<FrontendLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      <Header />
      <nav className="flex-grow container mx-auto px-4 py-6 bg-gray-100 py-3">
        <div className="container mx-auto px-4">
          <Breadcrumb />
        </div>
      </nav>
      <main className="flex-grow container mx-auto px-4 py-6">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default FrontendLayout;