// resources/js/Pages/Opportunities/Show.tsx
import React from 'react';
import { Head, usePage, Link } from '@inertiajs/react';
import FrontendLayout from '@/Layouts/FrontendLayout';
import { OCDOpportunity } from '@/types';

export default function Show() {
    const opportunity = usePage().props.opportunity as OCDOpportunity;
    return (
        <FrontendLayout>
            <Head title={`Opportunity: ${opportunity.title}`} />

            <div className="mx-auto p-6 space-y-8">
                {/* Title */}
                <h1 className="text-3xl font-bold border-b pb-4">{opportunity.title}</h1>

                {/* Basic Info */}
                <section>
                    <h2 className="text-xl font-semibold mb-4 text-firefly-800">Basic Information</h2>
                    <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <dt className="text-2xl text-firefly-800">Status</dt>
                            <dd className="mt-1">
                                <span
                                    className={`inline-block px-2 py-1 text-sm font-medium rounded-full ${opportunity.status === 1
                                        ? 'bg-green-100 text-green-800'
                                        : opportunity.status === 2
                                            ? 'bg-red-100 text-red-800'
                                            : 'bg-gray-100 text-gray-800'
                                        }`}
                                >
                                    {opportunity.status_label ?? opportunity.status}
                                </span>
                            </dd>
                        </div>
                        <div>
                            <dt className="text-2xl text-firefly-800">Type</dt>
                            <dd className="text-2xl mt-1 text-gray-900">{opportunity.type}</dd>
                        </div>
                        <div>
                            <dt className="text-2xl text-firefly-800">Closing Date</dt>
                            <dd className="text-2xl mt-1 text-gray-900">{new Date(opportunity.closing_date).toLocaleDateString()}</dd>
                        </div>
                        <div>
                            <dt className="text-2xl text-firefly-800">Coverage of CD Activity</dt>
                            <dd className="text-2xl mt-1 text-gray-900">{opportunity.coverage_activity}</dd>
                        </div>
                        <div>
                            <dt className="text-2xl text-firefly-800">Implementation Location</dt>
                            <dd className="text-2xl mt-1 text-gray-900">{opportunity.implementation_location}</dd>
                        </div>
                        <div>
                            <dt className="text-2xl text-firefly-800">Target Audience</dt>
                            <dd className="text-2xl mt-1 text-gray-900">
                                {opportunity.target_audience === 'other' ? opportunity.target_audience_other : opportunity.target_audience}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-2xl text-firefly-800">Created</dt>
                            <dd className="text-2xl mt-1 text-gray-900">{new Date(opportunity.created_at).toLocaleDateString()}</dd>
                        </div>
                        {opportunity.updated_at && (
                            <div>
                                <dt className="text-2xl text-firefly-800">Last Updated</dt>
                                <dd className="text-2xl mt-1 text-gray-900">{new Date(opportunity.updated_at).toLocaleDateString()}</dd>
                            </div>
                        )}
                        {opportunity.url && (
                            <div className="md:col-span-2">
                                <dt className="text-2xl text-firefly-800">Link to Application</dt>
                                <dd className="mt-1">
                                    <a
                                        href={opportunity.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline"
                                    >
                                        {opportunity.url}
                                    </a>
                                </dd>
                            </div>
                        )}
                    </dl>
                </section>

                {/* summary */}
                <div className="mb-6">
                    <h2 className="text-sm font-semibold text-gray-500">Summary</h2>
                    <p className="mt-1 text-gray-900 whitespace-pre-line">
                        {opportunity.summary}
                    </p>
                </div>

                {/* Tags */}
                {opportunity.keywords && opportunity.keywords.split(',').length > 0 && (
                    <div className="mb-6">
                        <h2 className="text-sm font-semibold text-gray-500">Tags</h2>
                        <div className="mt-2 flex flex-wrap gap-2">
                            {opportunity.keywords.split(',').map(keyword => (
                                <span
                                    key={keyword}
                                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                                >
                                    {keyword}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="mt-8 flex space-x-4">
                    <a
                        target="_blank"
                        href={opportunity.url}
                        className="px-4 py-2 bg-firefly-600 text-white rounded hover:bg-firefly-700"
                    >
                        Apply Now
                    </a>
                </div>
            </div>
        </FrontendLayout>
    );
}
