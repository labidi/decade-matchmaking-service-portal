import React from 'react';
import { Header, Footer } from '@layouts/components';
import BannerSection from "@layouts/frontend-layout/banner-section"
import {usePage} from '@inertiajs/react';
import {Breadcrumb} from '@ui/molecules';
import {FlashMessages, ActionsBar} from '@ui/organisms';
import {ActionButton} from '@/types';
import {Divider} from "@ui/primitives";

interface FrontendLayoutProps {
    children: React.ReactNode;
}

const FrontendLayout: React.FC<FrontendLayoutProps> = ({children}) => {
    const actions = usePage().props?.actions as ActionButton[] | undefined;

    return (
        <div className="min-h-screen flex flex-col text-gray-900 dark:text-gray-100 dark:bg-gray-900">
            <Header/>
            <BannerSection/>
            <main className="flex-grow container mx-auto py-4">
                <div className="container mx-auto px-4">
                    <Breadcrumb/>
                </div>
                <div className="">
                    <FlashMessages className=""/>
                </div>
                <div className="container p-4">
                    { actions && (<ActionsBar actions={actions}/>)}
                </div>
                <div className="container shadow rounded bg-white dark:bg-gray-800 p-4">
                    {children}
                </div>
            </main>
            <Footer/>
        </div>
    );
};

export default FrontendLayout;
