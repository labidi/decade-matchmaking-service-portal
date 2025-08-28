import React from 'react';
import {Head} from '@inertiajs/react';
import FrontendLayout from '@/components/ui/layouts/frontend-layout';
import {Opportunity, PageProps} from '@/types';
import {Heading, Subheading} from '@/components/ui/heading';
import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {Text, TextLink} from '@/components/ui/text';
import {Divider} from '@/components/ui/divider';
import {CalendarIcon, GlobeAltIcon, UsersIcon, ArrowTopRightOnSquareIcon} from '@heroicons/react/16/solid';
import {opportunityStatusBadgeRenderer} from '@/utils/status-badge-renderer';

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
            <div>
                {/* Header Section */}
                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="flex-1">
                            <Heading level={1} className="break-words">
                                {opportunity.title}
                            </Heading>
                        </div>
                        <div className="flex-shrink-0">
                            {opportunityStatusBadgeRenderer(opportunity)}
                        </div>
                    </div>
                </div>

                <Divider soft/>

                {/* Basic Information Grid */}
                <section className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                        <div className="space-y-2">
                            <span className="font-medium text-firefly-800 text-lg">Type</span>
                            <Text>{opportunity.type.label}</Text>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <CalendarIcon data-slot="icon" className="size-4 text-zinc-500"/>
                                <span className="font-medium text-firefly-800 text-lg">Closing Date</span>
                            </div>
                            <Text>{opportunity.closing_date}</Text>
                        </div>


                        <div className="space-y-2">
                            <span className="font-medium text-firefly-800 text-lg">Coverage of CD Activity</span>
                            <Text>{opportunity.coverage_activity.label}</Text>
                        </div>


                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <GlobeAltIcon data-slot="icon" className="size-4 text-zinc-500"/>
                                <span className="font-medium text-firefly-800 text-lg">Implementation Location</span>
                            </div>
                            <Text>
                                <ul className="list-disc pl-5 list-outside">
                                    {opportunity.implementation_location.map((implementation_location) =>
                                        <li>{implementation_location.label}</li>
                                    )}
                                </ul>
                            </Text>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <UsersIcon data-slot="icon" className="size-4 text-zinc-500"/>
                                <span className="font-medium text-firefly-800 text-lg">Target Audience</span>
                            </div>
                            <Text>
                                <ul className="list-disc pl-5 list-outside">
                                    {opportunity.target_audience.map((target_audience) =>
                                        <li>{target_audience.label}</li>
                                    )}
                                </ul>
                            </Text>
                        </div>

                        <div className="space-y-2">
                            <span className="font-medium text-firefly-800 text-lg">Created</span>
                            <Text>{formatDate(opportunity.created_at)}</Text>
                        </div>

                        {opportunity.updated_at && (
                            <div className="space-y-2">
                                <span className="font-medium text-firefly-800 text-lg">Last Updated</span>
                                <Text>{formatDate(opportunity.updated_at)}</Text>
                            </div>
                        )}
                    </div>

                    {opportunity.url && (
                        <div className="pt-4 border-t border-zinc-950/10 dark:border-white/10">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <ArrowTopRightOnSquareIcon data-slot="icon" className="size-4 text-zinc-500"/>
                                    <span className="font-medium text-firefly-800 text-lg">Application Link</span>
                                </div>
                                <TextLink
                                    href={opportunity.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="break-all"
                                >
                                    {opportunity.url}
                                </TextLink>
                            </div>
                        </div>
                    )}
                </section>

                <Divider soft/>

                {/* Summary Section */}
                {opportunity.summary && (
                    <section className="space-y-4">
                        <Subheading level={2}>Summary</Subheading>
                        <Text className="whitespace-pre-wrap leading-relaxed">
                            {opportunity.summary}
                        </Text>
                    </section>
                )}

                {/* Keywords/Tags Section */}
                {opportunity.key_words.length > 0 && (
                    <>
                        <Divider soft/>
                        <section className="space-y-4">
                            <Subheading level={2}>Keywords</Subheading>
                            <div className="flex flex-wrap gap-2">
                                {opportunity.key_words.map((keyword) => (
                                    <Badge color="blue">
                                        {keyword}
                                    </Badge>
                                ))}
                            </div>
                        </section>
                    </>
                )}

                <Divider soft/>

                {/* Action Buttons */}
                <section className="flex flex-col sm:flex-row gap-4">

                </section>
            </div>
        </FrontendLayout>
    );
}
