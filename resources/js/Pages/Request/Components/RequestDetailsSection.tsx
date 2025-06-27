import {usePage} from '@inertiajs/react';
import {AttachmentsProps} from '@/types';
import {UIRequestForm} from '@/Forms/UIRequestForm';

export default function RequestDetailsSection({OcdRequest, canEdit = false, documents = [],fieldsToShow = []}: AttachmentsProps) {
    return (
        <section id="request_details" className='my-8'>
            <div className="grid grid-cols-1">
                <div>
                    <h1 className="border-b-2 border-black-500 pb-4 text-2xl font-semibold tracking-tight text-pretty text-firefly-900 sm:text-3xl">
                        Request Details
                    </h1>
                </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                    <div className="max-w-screen-xl mx-auto px-5 bg-white min-h-sceen">
                        <div className="grid divide-y divide-neutral-200 mx-auto">
                            {UIRequestForm.map(step => {
                                const visibleFields = Object.entries(step.fields).filter(([key, field]) => {
                                    if (fieldsToShow.length > 0 && !fieldsToShow.includes(key)) return false;
                                    if (!field.label || field.type === 'hidden') return false;
                                    if (field.show && !field.show(OcdRequest.request_data)) return false;
                                    const value = (OcdRequest.request_data as any)[key];
                                    return !(value === undefined || value === '');
                                });

                                if (visibleFields.length === 0) return null;

                                return (
                                    <div className="py-5" key={step.label}>
                                        <details className="group">
                                            <summary
                                                className="flex justify-between items-center font-medium cursor-pointer list-none">
                                                <span className="text-2xl text-firefly-800">{step.label}</span>
                                                <span className="transition group-open:rotate-180">
                                                    <svg
                                                        fill="none"
                                                        height="24"
                                                        shapeRendering="geometricPrecision"
                                                        stroke="currentColor"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="1.5"
                                                        viewBox="0 0 24 24"
                                                        width="24"
                                                    >
                                                        <path d="M6 9l6 6 6-6"></path>
                                                    </svg>
                                                </span>
                                            </summary>
                                            <ul className=" group-open:animate-fadeIn list-none">
                                                {visibleFields.map(([key, field]) => {
                                                    const value = (OcdRequest.request_data as any)[key];
                                                    const formatted = Array.isArray(value) ? value.join(', ') : value;
                                                    return (
                                                        <li key={key} className='py-2 text-xl'>
                                                            <span className="text-firefly-600">{field.label}: </span> <br/>
                                                            {formatted ?? 'N/A'}
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        </details>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                </div>
                <div>
                    <div className='py-2'>
                        <h2 className="text-2xl text-firefly-800">Submission Date</h2>
                        <p className="mt-1 text-xl text-gray-900">
                            {new Date(OcdRequest.created_at).toLocaleDateString()}
                        </p>
                    </div>
                    <div>
                        <h2 className="text-2xl text-firefly-800">Status</h2>
                        <p className="mt-1 text-xl text-gray-900">
                            {OcdRequest.status.status_label}
                        </p>
                        {OcdRequest.status.status_code == "rejected" && (
                            <p className="text-red-500 mt-2 text-lg">
                                Your request has been carefully reviewed IOC Review Panel, and we regret to tell you
                                that Capacity Development Facility is not able to meet your request.
                            </p>
                        )}
                        {OcdRequest.status.status_code == "unmatched" && (
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
