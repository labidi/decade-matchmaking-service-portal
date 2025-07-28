import React from 'react';

import {SidebarLayout} from '@/components/ui/sidebar/sidebar-layout'

import Footer from '@/Components/Layout/Footer'

interface BackendLayoutProps {
    children: React.ReactNode;
}

const BackendLayout: React.FC<BackendLayoutProps> = ({children}) => {
    return (
        <SidebarLayout>
            <main className="container py-2">
                    <section className="">
                        {children}
                    </section>
            </main>
            <Footer/>
        </SidebarLayout>
    );
};

export default BackendLayout;
