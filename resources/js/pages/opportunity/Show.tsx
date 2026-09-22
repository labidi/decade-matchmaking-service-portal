import React, { useState } from 'react';
import {Head} from '@inertiajs/react';
import { FrontendLayout } from '@layouts/index';
import {PageProps} from '@/types';
import { Opportunity } from '@features/opportunities/types';
import {Badge} from '@ui/primitives/badge';
import { Button } from '@ui/primitives/button';
import { ExtendOpportunityDialog } from '@features/opportunities';


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

type LabelledOption = { value: string; label: string };

/**
 * Render a badge list, or "N/A" when neither the list nor its free-text companion has a value
 * (fields not collected for some opportunity types, e.g. ODC travel support).
 */
function renderBadgeList(items: LabelledOption[] | undefined, other?: string | null): React.ReactNode {
    if ((items?.length ?? 0) === 0 && !other) {
        return 'N/A';
    }

    return (
        <>
            {items?.map(item => (
                <Badge key={item.value} color="blue" className="mr-1 mb-1">
                    {item.label}
                </Badge>
            ))}
            {other && (
                <Badge color="blue" className="mr-1 mb-1">{other}</Badge>
            )}
        </>
    );
}

export default function Show({opportunity}: Readonly<ShowPageProps>) {
    const [isExtendDialogOpen, setIsExtendDialogOpen] = useState(false);

    return (
        <FrontendLayout>
            <Head title={`Opportunity: ${opportunity.title}`}/>
            <div className="mx-auto">

                {/* Header Section */}
                <div className="mb-8">
                    <div className="px-4 sm:px-0">
                        <h3 className="text-base/7 font-semibold text-gray-900 dark:text-gray-100">{opportunity.title}</h3>
                    </div>
                </div>

                <div className="mt-6">
                    <dl className="grid grid-cols-1 sm:grid-cols-2">
                        <div className="border-t border-gray-100 dark:border-gray-700 px-4 py-6 sm:col-span-1 sm:px-0">
                            <dt className="text-sm/6 font-medium text-gray-900 dark:text-gray-100">Organizers</dt>
                            <dd className="mt-1 text-sm/6 text-gray-700 dark:text-gray-300 sm:mt-2">
                                {opportunity.co_organizers?.map((item: string) => (
                                    <Badge key={item} color="blue" className="mr-1 mb-1">
                                        {item}
                                    </Badge>
                                ))}
                            </dd>
                        </div>
                        <div className="border-t border-gray-100 dark:border-gray-700 px-4 py-6 sm:col-span-1 sm:px-0">
                            <dt className="text-sm/6 font-medium text-gray-900 dark:text-gray-100">Type</dt>
                            <dd className="mt-1 text-sm/6 text-gray-700 dark:text-gray-300 sm:mt-2">{opportunity.type.label}</dd>
                        </div>
                        <div className="border-t border-gray-100 dark:border-gray-700 px-4 py-6 sm:col-span-1 sm:px-0">
                            <dt className="text-sm/6 font-medium text-gray-900 dark:text-gray-100">Status</dt>
                            <dd className="mt-1 text-sm/6 text-gray-700 dark:text-gray-300 sm:mt-2">{opportunity.status.label}</dd>
                        </div>
                        <div className="border-t border-gray-100 dark:border-gray-700 px-4 py-6 sm:col-span-1 sm:px-0 ">
                            <dt className="text-sm/6 font-medium text-gray-900 dark:text-gray-100">Closing Date</dt>
                            <dd className="mt-1 text-sm/6 text-gray-700 dark:text-gray-300 sm:mt-2 flex items-center justify-between">
                                <span>
                                    {formatDate(opportunity.closing_date)}
                                    {opportunity.permissions?.can_extend && (
                                        <Button
                                            color="red"
                                            onClick={() => setIsExtendDialogOpen(true)}
                                            className="ml-3"
                                        >
                                            Extend
                                        </Button>
                                    )}
                                </span>
                            </dd>
                        </div>
                        <div className="border-t border-gray-100 dark:border-gray-700 px-4 py-6 sm:col-span-1 sm:px-0">
                            <dt className="text-sm/6 font-medium text-gray-900 dark:text-gray-100">Coverage of CD Activity</dt>
                            <dd className="mt-1 text-sm/6 text-gray-700 dark:text-gray-300 sm:mt-2">{opportunity.coverage_activity?.label ?? 'N/A'}</dd>
                        </div>
                        <div className="border-t border-gray-100 dark:border-gray-700 px-4 py-6 sm:col-span-1 sm:px-0">
                            <dt className="text-sm/6 font-medium text-gray-900 dark:text-gray-100">Implementation Location</dt>
                            <dd className="mt-1 text-sm/6 text-gray-700 dark:text-gray-300 sm:mt-2">{renderBadgeList(opportunity.implementation_location)}</dd>
                        </div>
                        <div className="border-t border-gray-100 dark:border-gray-700 px-4 py-6 sm:col-span-1 sm:px-0">
                            <dt className="text-sm/6 font-medium text-gray-900 dark:text-gray-100">Target Audience</dt>
                            <dd className="mt-1 text-sm/6 text-gray-700 dark:text-gray-300 sm:mt-2">{opportunity.target_audience?.map((item: { value: string; label: string }) => (
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
                        <div className="border-t border-gray-100 dark:border-gray-700 px-4 py-6 sm:col-span-1 sm:px-0">
                            <dt className="text-sm/6 font-medium text-gray-900 dark:text-gray-100">Thematic areas</dt>
                            <dd className="mt-1 text-sm/6 text-gray-700 dark:text-gray-300 sm:mt-2">{renderBadgeList(opportunity.thematic_areas, opportunity.thematic_areas_other)}</dd>
                        </div>
                        <div className="border-t border-gray-100 dark:border-gray-700 px-4 py-6 sm:col-span-1 sm:px-0">
                            <dt className="text-sm/6 font-medium text-gray-900 dark:text-gray-100">Language of participation</dt>
                            <dd className="mt-1 text-sm/6 text-gray-700 dark:text-gray-300 sm:mt-2">{renderBadgeList(opportunity.target_languages, opportunity.target_languages_other)}</dd>
                        </div>
                        <div className="border-t border-gray-100 dark:border-gray-700 px-4 py-6 sm:col-span-2 sm:px-0">
                            <dt className="text-sm/6 font-medium text-gray-900 dark:text-gray-100">Full summary</dt>
                            <dd className="mt-1 text-sm/6 text-gray-700 dark:text-gray-300 sm:mt-2">
                                {opportunity.summary}
                            </dd>
                        </div>

                        <div className="border-t border-gray-100 dark:border-gray-700 px-4 py-6 sm:col-span-1 sm:px-0">
                            <dt className="text-sm/6 font-medium text-gray-900 dark:text-gray-100">Application site URL</dt>
                            <dd className="mt-1 text-sm/6 text-gray-700 dark:text-gray-300 sm:mt-2">
                                <a href={opportunity.apply_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline">
                                    {opportunity.url}
                                </a>
                            </dd>
                        </div>
                        <div className="border-t border-gray-100 dark:border-gray-700 px-4 py-6 sm:col-span-1 sm:px-0">
                            <dt className="text-sm/6 font-medium text-gray-900 dark:text-gray-100">Key words</dt>
                            <dd className="mt-1 text-sm/6 text-gray-700 dark:text-gray-300 sm:mt-2">
                                {opportunity.key_words?.map((item: string) => (
                                    <Badge key={item} color="blue" className="mr-1 mb-1">
                                        {item}
                                    </Badge>
                                ))}
                            </dd>
                        </div>
                    </dl>
                </div>
            </div>

            {/* Extend Dialog */}
            <ExtendOpportunityDialog
                isOpen={isExtendDialogOpen}
                onClose={() => setIsExtendDialogOpen(false)}
                opportunity={opportunity}
            />
        </FrontendLayout>
    );
}
