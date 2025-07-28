import React from 'react';
import {OCDRequest} from '@/types';
import {SidebarLayout} from '@/components/ui/sidebar/sidebar-layout'
import {Head} from "@inertiajs/react";
import {GeneralInformations} from "@/Pages/Admin/Request/view/general-informations";


interface RequestShowPageProps {
    request: OCDRequest;
}

export default function RequestShowPage({request}: Readonly<RequestShowPageProps>) {
    return (
        <SidebarLayout>
            <Head title="Request Details"/>
            <div className="mx-auto">
                <h2 className="text-2xl/7 font-bold text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                    Requests Details
                </h2>
                <hr className="my-2 border-zinc-200 dark:border-zinc-700"/>
            </div>
            <GeneralInformations request={request}/>
        </SidebarLayout>
    )
}
