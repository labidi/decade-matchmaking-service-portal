import React from 'react';
import Header from '@/Components/Layout/Header';
import Footer from '@/Components/Layout/Footer';
import Breadcrumb from '@/Components/Common/Breadcrumb';
import Sidebar from '@/Components/Layout/Backend/Sidebar';

interface BackendLayoutProps {
    children: React.ReactNode;
}

const BackendLayout: React.FC<BackendLayoutProps> = ({children}) => {
    return (
        <div className="min-h-screen flex flex-col bg-white text-gray-900">
            <Header/>
            <Breadcrumb/>
            <main className="flex-grow container mx-auto py-8">
                <div className="container shadow rounded bg-white p-6 grid grid-cols-4 gap-6">
                    <aside className="col-span-1">
                        <Sidebar/>
                    </aside>
                    <section className="col-span-3">
                        {children}
                    </section>
                </div>
            </main>
            <Footer/>
        </div>
    );
};

export default BackendLayout;
