import React from 'react';
import {Head} from '@inertiajs/react';
import {SidebarLayout} from '@/components/ui/layouts/sidebar-layout';
import {OCDRequest, User} from '@/types';
import {FormProvider} from '@/Forms/FormProvider';
import {UIOfferForm} from '@/Forms/UIOfferForm';
import {Heading} from "@/components/ui/heading";

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
                <Heading>
                    Create New Offer
                </Heading>
                <hr className="my-2 border-zinc-200 dark:border-zinc-700"/>
                {/* Form */}
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
                            label: `${request.detail?.capacity_development_title} - ${request.user.name}`
                        }))
                    }}
                />
            </div>
        </SidebarLayout>
    );
}
