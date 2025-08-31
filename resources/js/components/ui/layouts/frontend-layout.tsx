import React from 'react';
import Header from '@/components/layouts/Header';
import Footer from '@/components/layouts/Footer';
import BannerSection from "@/components/ui/layouts/frontend-layout/banner-section"
import {usePage} from '@inertiajs/react';
import Breadcrumb from '@/components/ui/breadcrumb';
import {FlashMessages} from '@/components/ui/flash-messages'
import {ActionsBar} from '@/components/ui/actions-bar';
import {ActionButton} from '@/types';
import {Divider} from "@/components";

interface FrontendLayoutProps {
    children: React.ReactNode;
}

const FrontendLayout: React.FC<FrontendLayoutProps> = ({children}) => {
    const actions = usePage().props?.actions as ActionButton[] | undefined;

    return (
        <div className="min-h-screen flex flex-col  text-gray-900">
            <Header/>
            <BannerSection/>
            <Breadcrumb/>
            <main className="flex-grow container mx-auto py-8 ">
                <div className="">
                    <FlashMessages className=""/>
                </div>
                <div className="container shadow rounded bg-white p-6">
                    {children}
                    <Divider className={'m-4'}/>
                    { actions && (<ActionsBar actions={actions}/>)}
                </div>
            </main>
            <Footer/>
        </div>
    );
};

export default FrontendLayout;
