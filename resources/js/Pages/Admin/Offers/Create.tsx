import React from 'react';
import {Head} from '@inertiajs/react';
import {SidebarLayout} from '@/components/ui/layouts/sidebar-layout';
import {OCDRequest, User} from '@/types';
import {FormProvider} from '@/Forms/FormProvider';
import {UIOfferForm} from '@/Forms/UIOfferForm';

interface CreateOfferPageProps {
    selectedRequest?: OCDRequest;
    partners: User[];
    availableRequests: OCDRequest[];
}

export default function CreateOffer({
                                        selectedRequest,
                                        partners,
                                        availableRequests
                                    }: Readonly<CreateOfferPageProps>) {

    return (
        <SidebarLayout>
            <Head title="Create New Offer"/>

            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                        Create New Offer
                    </h1>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Create a new capacity development offer for a request
                    </p>
                </div>

                {/* Selected Request Info */}
                {selectedRequest && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                            Creating offer for request:
                        </h3>
                        <p className="mt-1 text-sm text-blue-800 dark:text-blue-200">
                            {selectedRequest.detail.capacity_development_title}
                        </p>
                        <p className="text-xs text-blue-600 dark:text-blue-300">
                            Requested by: {selectedRequest.user.name}
                        </p>
                    </div>
                )}

                {/* Form */}
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
                    <FormProvider
                        steps={UIOfferForm}
                        initialData={{
                            request_id: selectedRequest?.id?.toString() || '',
                            partner_id: '',
                            description: '',
                            document: null
                        }}
                        submitUrl={route('admin.offers.store')}
                        method="POST"
                        backUrl={route('admin.offers.list')}
                        backLabel="Back to Offers"
                        submitLabel="Create Offer"
                        dynamicOptions={{
                            partner_id: partners.map(partner => ({
                                value: partner.id.toString(),
                                label: `${partner.name} (${partner.email})`
                            })),
                            request_id: availableRequests.map(request => ({
                                value: request.id.toString(),
                                label: `${request.detail.capacity_development_title} - ${request.user.name}`
                            }))
                        }}
                    />
                </div>
            </div>
        </SidebarLayout>
    );
}
