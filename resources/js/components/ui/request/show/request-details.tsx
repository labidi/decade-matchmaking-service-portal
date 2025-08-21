import {UIRequestForm} from '@/components/forms/UIRequestForm';
import {Document, OCDRequest} from "@/types";
import {Disclosure, DisclosureButton, DisclosurePanel} from '@headlessui/react'
import {ChevronDownIcon} from '@heroicons/react/20/solid'

export interface RequestDetailsSectionProps {
    request: OCDRequest;
    canEdit?: boolean;
    documents?: Document[];
    fieldsToShow?: string[];
}

export default function RequestDetails({
                                           request,
                                           canEdit = false,
                                           documents = [],
                                           fieldsToShow = []
                                       }: Readonly<RequestDetailsSectionProps>) {
    return (
        <section id="request_details" className='my-8'>
            <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                    <div className="max-w-screen-xl mx-auto px-5 bg-white min-h-sceen">
                        <div className="grid divide-y divide-neutral-200 mx-auto">
                            {UIRequestForm.map(step => {
                                const fields = Object.entries(step.fields).filter(([key, field]) => {
                                    if (fieldsToShow.length > 0 && !fieldsToShow.includes(key)) return false;
                                    if (!field.label || field.type === 'hidden') return false;
                                    if (field.show && !field.show(request)) return false;
                                    const value = (request.detail as any)[key];
                                    return !(value === undefined || value === '');
                                });
                                if (fields.length === 0) return null;
                                return (
                                    <Disclosure key={step.label} as="div" className="p-6" defaultOpen={false}>
                                        <DisclosureButton
                                            className="group flex w-full items-center justify-between">
                                            <span
                                                className="text-xl font-medium  group-data-hover:text-firefly-700">
                                             {step.label}
                                            </span>
                                            <ChevronDownIcon
                                                className="size-5 fill-firefly-700/60 group-data-hover:fill-firefly-600 group-data-open:rotate-180"/>
                                        </DisclosureButton>
                                        <DisclosurePanel className="mt-2 text-xl/5 text-firefly-900/80">
                                            <ul className=" group-open:animate-fadeIn list-none">
                                                {fields.map(([key, field]) => {
                                                    const value = (request.detail as any)[key];


                                                    const formatted = Array.isArray(value) ? value.map(u => u.label).join(', ') : value;
                                                    return (
                                                        <li key={key} className='py-2 text-xl capitalize'>
                                                                <span
                                                                    className="text-firefly-800">{field.label}: </span>
                                                            <br/>
                                                            {formatted ?? 'N/A'}
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        </DisclosurePanel>
                                    </Disclosure>
                                );
                            })}
                        </div>
                    </div>

                </div>
                <div>
                    <div className='py-2'>
                        <h2 className="text-2xl text-firefly-800">Submission Date</h2>
                        <p className="mt-1 text-xl text-gray-900">
                            {new Date(request.created_at).toLocaleDateString()}
                        </p>
                    </div>
                    <div>
                        <h2 className="text-2xl text-firefly-800">Status</h2>
                        <p className="mt-1 text-xl text-gray-900">
                            {request.status.status_label}
                        </p>
                        {request.status.status_code == "rejected" && (
                            <p className="text-red-500 mt-2 text-lg">
                                Your request has been carefully reviewed IOC Review Panel, and we regret to tell you
                                that Capacity Development Facility is not able to meet your request.
                            </p>
                        )}
                        {request.status.status_code == "unmatched" && (
                            <p className="text-red-500 mt-2 text-lg">
                                The CDF Secretariat explored multiple potential partnerships on your behalf. However,
                                after three months of outreach, your request was not accepted by any of our partners.
                                That said, your submission has helped inform both the CDF and IOC/UNESCO of an important
                                gap in current training and workshop offerings, and we recognize its relevance. We will
                                continue to keep your request in mind and will reach out if similar opportunities arise
                                in the future. We encourage you to check back with us for updates.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
