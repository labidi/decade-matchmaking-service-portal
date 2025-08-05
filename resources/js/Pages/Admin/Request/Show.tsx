import React from 'react';
import {OCDRequest, RequestStatus} from '@/types';
import {SidebarLayout} from '@/components/ui/layouts/sidebar-layout'
import {Head} from "@inertiajs/react";
import {Heading} from "@/components/ui/heading";
import RequestDetails from '@/components/ui/request/show/request-details';
import { RequestActions } from '@/components/ui/data-table/requests/requests-actions-columns';


interface RequestShowPageProps {
    request: OCDRequest;
    availableStatuses?: RequestStatus[];
}

export default function RequestShowPage({request, availableStatuses = []}: Readonly<RequestShowPageProps>) {
    return (
        <SidebarLayout>
            <Head title="Request Details"/>
            <div className="mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <Heading level={1} className="text-2xl/7 font-bold text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                        Request Details
                    </Heading>

                    {/* Action Dropdown */}
                    <div className="flex-shrink-0">
                        <RequestActions
                            request={request}
                            showViewDetails={false}
                            availableStatuses={availableStatuses}
                        />
                    </div>
                </div>
                <hr className="my-2 border-zinc-200 dark:border-zinc-700"/>
            </div>

            {request.detail && (
                <RequestDetails request={request}/>
            )}
        </SidebarLayout>
    )
}
