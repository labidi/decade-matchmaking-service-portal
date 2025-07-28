import React from 'react';
import {OCDRequest} from '@/types';
import {SidebarLayout} from '@/components/ui/sidebar/sidebar-layout'
import {Head} from "@inertiajs/react";
import {Heading} from "@/components/ui/heading";
import RequestDetails from '@/components/ui/request/show/request-details';


interface RequestShowPageProps {
    request: OCDRequest;
}

export default function RequestShowPage({request}: Readonly<RequestShowPageProps>) {
    return (
        <SidebarLayout>
            <Head title="Request Details"/>
            <div className="mx-auto">
                <Heading level={1} className="text-2xl/7 font-bold text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                    Request Details
                </Heading>
                <hr className="my-2 border-zinc-200 dark:border-zinc-700"/>
            </div>
            <RequestDetails request={request}/>
        </SidebarLayout>
    )
}
