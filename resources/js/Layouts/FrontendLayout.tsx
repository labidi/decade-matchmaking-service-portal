import React from 'react';
import Header from '@/Components/Layout/Header';
import Footer from '@/Components/Layout/Footer';
import Banner from '@/Components/Common/Banner';
import UserGuide from '@/Components/Common/UserGuide';
import { usePage } from '@inertiajs/react';
import Breadcrumb from '@/components/ui/breadcrumb';

interface FrontendLayoutProps {
  children: React.ReactNode;
}

const FrontendLayout: React.FC<FrontendLayoutProps> = ({ children }) => {
  const { auth } = usePage().props ;
  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      <Header />
      <Banner />
      <UserGuide />
      <Breadcrumb />
      <main className="flex-grow container mx-auto py-8">
        <div className="container shadow rounded bg-white p-6">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FrontendLayout;
