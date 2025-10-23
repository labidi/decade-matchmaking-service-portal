import React from 'react';
import {OCDRequest, OCDRequestStatus} from '@/types';
import {SidebarLayout} from '@/components/ui/layouts/sidebar-layout'
import {Head} from "@inertiajs/react";
import {Heading} from "@/components/ui/heading";
import RequestDetails from '@/components/ui/request/show/request-details';
import { DropdownActions } from '@/components/ui/data-table/common/dropdown-actions';
import {useRequestActions} from "@/hooks/useRequestActions";
import {UpdateStatusDialog} from "@/components/ui/dialogs/UpdateStatusDialog";

interface RequestShowPageProps {
    request: OCDRequest;
    availableStatuses?: OCDRequestStatus[];
}

export default function RequestShowPage({request, availableStatuses = []}: Readonly<RequestShowPageProps>) {
    const {
        isStatusDialogOpen,
        selectedRequest,
        closeStatusDialog,
        getActionsForRequest,
        availableStatuses: dialogStatuses,
    } = useRequestActions('admin');
    return (
        <SidebarLayout>
            <Head title="Request Details"/>
            <div className="mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <Heading level={1} className="text-2xl/7 font-bold text-gray-900 dark:text-gray-100 sm:truncate sm:text-3xl sm:tracking-tight">
                        Request Details
                    </Heading>

                    {/* Action Dropdown */}
                    <div className="flex-shrink-0">
                        <DropdownActions
                            actions={getActionsForRequest(request)}
                        />
                    </div>
                </div>
                <hr className="my-2 border-zinc-200 dark:border-zinc-700"/>
            </div>

            {request.detail && (
                <RequestDetails request={request}/>
            )}

            <UpdateStatusDialog
                isOpen={isStatusDialogOpen}
                onClose={closeStatusDialog}
                request={selectedRequest}
                availableStatuses={dialogStatuses.length > 0 ? dialogStatuses : availableStatuses}
            />
        </SidebarLayout>
    )
}
