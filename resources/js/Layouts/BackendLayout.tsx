import React from 'react';

import {Navbar} from '@/components/ui/navbar'
import {Sidebar} from '@/components/ui/sidebar'
import {SidebarLayout} from '@/components/ui/sidebar-layout'
import {SidebarWrapper} from '@/components/admin/sidebar-content'
import Footer from '@/Components/Layout/Footer'

interface BackendLayoutProps {
    children: React.ReactNode;
}

const BackendLayout: React.FC<BackendLayoutProps> = ({children}) => {
    return (
        <SidebarLayout
            sidebar={<Sidebar><SidebarWrapper/></Sidebar>}
            navbar={<Navbar>{/* Your navbar content */}</Navbar>}
        >
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
