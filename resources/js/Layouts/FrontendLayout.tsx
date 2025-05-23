import React from 'react';
import Header from '@/Components/Header';
import Footer from '@/Components/Footer';
import Banner from '@/Components/Banner';
import Userguide from '@/Components/UserGuide';
import { usePage } from '@inertiajs/react';

interface FrontendLayoutProps {
  children: React.ReactNode;
}

const FrontendLayout: React.FC<FrontendLayoutProps> = ({ children }) => {
  const { auth } = usePage().props ;
  console.log(auth);
  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      <Header />
      <Banner />
      <Userguide />
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