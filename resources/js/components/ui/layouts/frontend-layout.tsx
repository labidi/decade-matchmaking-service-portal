import React from 'react';
import Header from '@/Components/Layout/Header';
import Footer from '@/Components/Layout/Footer';
import BannerSection from "@/components/ui/layouts/frontend-layout/banner-section"
import {usePage} from '@inertiajs/react';
import Breadcrumb from '@/components/ui/breadcrumb';
import {FlashMessages} from '@/components/ui/flash-messages'

interface FrontendLayoutProps {
    children: React.ReactNode;
}

const FrontendLayout: React.FC<FrontendLayoutProps> = ({children}) => {
    const {auth} = usePage().props;
    return (
        <div className="min-h-screen flex flex-col  text-gray-900">
            <Header/>
            <BannerSection/>
            <Breadcrumb />
            <main className="flex-grow container mx-auto py-8 ">
                <div className="">
                    <FlashMessages className="" />
                </div>
                <div className="container shadow rounded bg-white p-6">
                    {children}
                </div>
            </main>
            <Footer/>
        </div>
    );
};

export default FrontendLayout;
