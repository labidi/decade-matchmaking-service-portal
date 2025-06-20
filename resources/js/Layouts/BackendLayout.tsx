import React from 'react';
import Header from '@/Components/Header';
import Footer from '@/Components/Footer';
import Banner from '@/Components/Banner';
import Userguide from '@/Components/UserGuide';
import Breadcrumb from '@/Components/Breadcrumb';

interface BackendLayoutProps {
  menu: React.ReactNode;
  children: React.ReactNode;
}

const BackendLayout: React.FC<BackendLayoutProps> = ({ menu, children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      <Header />
      <Banner />
      <Userguide />
      <Breadcrumb />
      <main className="flex-grow container mx-auto py-8">
        <div className="container shadow rounded bg-white p-6 grid grid-cols-4 gap-6">
          <aside className="col-span-1">
            {menu}
          </aside>
          <section className="col-span-3">
            {children}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BackendLayout;
