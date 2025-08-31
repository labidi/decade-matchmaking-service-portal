import React from 'react';
import {Head} from '@inertiajs/react';
import FrontendLayout from '@/components/ui/layouts/frontend-layout';
import {Opportunity, PageProps} from '@/types';
import {Subheading} from '@/components/ui/heading';
import {Badge} from '@/components/ui/badge';
import {Text,} from '@/components/ui/text';
import {Divider} from '@/components/ui/divider';
import {UsersIcon} from '@heroicons/react/16/solid';


interface ShowPageProps extends PageProps {
    opportunity: Opportunity;
}


/**
 * Format date string to a readable format
 */
function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

export default function Show({opportunity}: Readonly<ShowPageProps>) {
    return (
        <FrontendLayout>
            <Head title={`Opportunity: ${opportunity.title}`}/>
            <div className="mx-auto">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="px-4 sm:px-0">
                        <h3 className="text-base/7 font-semibold text-gray-900">{opportunity.title}</h3>
                        <p className="mt-1 max-w-2xl text-sm/6 text-gray-500 truncate">{opportunity.summary}</p>
                    </div>
                </div>

                <div className="mt-6">
                    <dl className="grid grid-cols-1 sm:grid-cols-2">
                        <div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 sm:px-0">
                            <dt className="text-sm/6 font-medium text-gray-900">Type</dt>
                            <dd className="mt-1 text-sm/6 text-gray-700 sm:mt-2">{opportunity.type.label}</dd>
                        </div>
                        <div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 sm:px-0">
                            <dt className="text-sm/6 font-medium text-gray-900">Status</dt>
                            <dd className="mt-1 text-sm/6 text-gray-700 sm:mt-2">{opportunity.status.label}</dd>
                        </div>
                        <div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 sm:px-0">
                            <dt className="text-sm/6 font-medium text-gray-900">Closing Date</dt>
                            <dd className="mt-1 text-sm/6 text-gray-700 sm:mt-2">{opportunity.closing_date}</dd>
                        </div>
                        <div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 sm:px-0">
                            <dt className="text-sm/6 font-medium text-gray-900">Status</dt>
                            <dd className="mt-1 text-sm/6 text-gray-700 sm:mt-2">{opportunity.status.label}</dd>
                        </div>
                        <div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 sm:px-0">
                            <dt className="text-sm/6 font-medium text-gray-900">Coverage of CD Activity</dt>
                            <dd className="mt-1 text-sm/6 text-gray-700 sm:mt-2">{opportunity.coverage_activity.label}</dd>
                        </div>
                        <div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 sm:px-0">
                            <dt className="text-sm/6 font-medium text-gray-900">Implementation Location</dt>
                            <dd className="mt-1 text-sm/6 text-gray-700 sm:mt-2">{opportunity.implementation_location?.map((item, index) => (
                                <Badge key={item.value} color="blue" className="mr-1 mb-1">
                                    {item.label}
                                </Badge>
                            ))}</dd>
                        </div>
                        <div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 sm:px-0">
                            <dt className="text-sm/6 font-medium text-gray-900">Target Audience</dt>
                            <dd className="mt-1 text-sm/6 text-gray-700 sm:mt-2">{opportunity.target_audience?.map((item, index) => (
                                <Badge key={item.value} color="blue" className="mr-1 mb-1">
                                    {item.label}
                                </Badge>
                            ))}
                                {opportunity.target_audience_other && (
                                    <Badge color="blue"
                                           className="mr-1 mb-1">{opportunity.target_audience_other}</Badge>
                                )}
                            </dd>
                        </div>
                        <div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 sm:px-0">
                            <dt className="text-sm/6 font-medium text-gray-900">Language of participation</dt>
                            <dd className="mt-1 text-sm/6 text-gray-700 sm:mt-2">{opportunity.target_languages?.map((item, index) => (
                                <Badge key={item.value} color="blue" className="mr-1 mb-1">
                                    {item.label}
                                </Badge>
                            ))}
                                {opportunity.target_languages_other && (
                                    <Badge color="blue"
                                           className="mr-1 mb-1">{opportunity.target_languages_other}</Badge>
                                )}
                            </dd>
                        </div>
                        <div className="border-t border-gray-100 px-4 py-6 sm:col-span-2 sm:px-0">
                            <dt className="text-sm/6 font-medium text-gray-900">Full summary</dt>
                            <dd className="mt-1 text-sm/6 text-gray-700 sm:mt-2">
                                {opportunity.summary}
                            </dd>
                        </div>

                        <div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 sm:px-0">
                            <dt className="text-sm/6 font-medium text-gray-900">Application site URL</dt>
                            <dd className="mt-1 text-sm/6 text-gray-700 sm:mt-2">
                                <a href={opportunity.url} target="_blank" rel="noopener noreferrer">
                                    {opportunity.url}
                                </a>
                            </dd>
                        </div>
                        <div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 sm:px-0">
                            <dt className="text-sm/6 font-medium text-gray-900">Key words</dt>
                            <dd className="mt-1 text-sm/6 text-gray-700 sm:mt-2">
                                {opportunity.key_words?.map((item, index) => (
                                    <Badge key={item} color="blue" className="mr-1 mb-1">
                                        {item}
                                    </Badge>
                                ))}
                            </dd>
                        </div>
                    </dl>
                </div>
            </div>
        </FrontendLayout>
    );
}
