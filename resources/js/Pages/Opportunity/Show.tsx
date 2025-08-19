import React from 'react';
import { Head, usePage } from '@inertiajs/react';
import FrontendLayout from '@/components/ui/layouts/frontend-layout';
import { OCDOpportunity, PageProps } from '@/types';
import { Heading, Subheading } from '@/components/ui/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Text, TextLink } from '@/components/ui/text';
import { Divider } from '@/components/ui/divider';
import { CalendarIcon, GlobeAltIcon, UsersIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/16/solid';

interface ShowPageProps extends PageProps {
    opportunity: OCDOpportunity;
    title: string;
    userPermissions: {
        canEdit: boolean;
        canDelete: boolean;
        canApply: boolean;
        isOwner: boolean;
    };
    breadcrumbs: Array<{ name: string; url?: string }>;
}

/**
 * Get status badge color based on opportunity status
 */
function getStatusBadgeColor(status: number): 'green' | 'red' | 'zinc' {
    switch (status) {
        case 1:
            return 'green';
        case 2:
            return 'red';
        default:
            return 'zinc';
    }
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

/**
 * Parse keywords string into array, handling empty strings
 */
function parseKeywords(keywords: string): string[] {
    if (!keywords || !keywords.trim()) return [];
    return keywords.split(',').map(keyword => keyword.trim()).filter(Boolean);
}

export default function Show() {
    const { opportunity, userPermissions } = usePage<ShowPageProps>().props;

    const statusColor = getStatusBadgeColor(opportunity.status);
    const keywordsList = parseKeywords(opportunity.keywords);

    return (
        <FrontendLayout>
            <Head title={`Opportunity: ${opportunity.title}`} />

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
                            <Badge color={statusColor}>
                                {opportunity.status_label || `Status ${opportunity.status}`}
                            </Badge>
                        </div>
                    </div>
                </div>

                <Divider soft />

                {/* Basic Information Grid */}
                <section className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                        <div className="space-y-2">
                            <Text className="font-medium text-zinc-950 dark:text-white">Type</Text>
                            <Text>{opportunity.type_label || opportunity.type}</Text>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <CalendarIcon data-slot="icon" className="size-4 text-zinc-500" />
                                <Text className="font-medium text-zinc-950 dark:text-white">Closing Date</Text>
                            </div>
                            <Text>{formatDate(opportunity.closing_date)}</Text>
                        </div>

                        <div className="space-y-2">
                            <Text className="font-medium text-zinc-950 dark:text-white">Coverage of CD Activity</Text>
                            <Text>{opportunity.coverage_activity}</Text>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <GlobeAltIcon data-slot="icon" className="size-4 text-zinc-500" />
                                <Text className="font-medium text-zinc-950 dark:text-white">Implementation Location</Text>
                            </div>
                            <Text>{opportunity.implementation_location_label || opportunity.implementation_location}</Text>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <UsersIcon data-slot="icon" className="size-4 text-zinc-500" />
                                <Text className="font-medium text-zinc-950 dark:text-white">Target Audience</Text>
                            </div>
                            <Text>{opportunity.target_audience_label || opportunity.target_audience}</Text>
                        </div>

                        <div className="space-y-2">
                            <Text className="font-medium text-zinc-950 dark:text-white">Created</Text>
                            <Text>{formatDate(opportunity.created_at)}</Text>
                        </div>

                        {opportunity.updated_at && (
                            <div className="space-y-2">
                                <Text className="font-medium text-zinc-950 dark:text-white">Last Updated</Text>
                                <Text>{formatDate(opportunity.updated_at)}</Text>
                            </div>
                        )}
                    </div>

                    {opportunity.url && (
                        <div className="pt-4 border-t border-zinc-950/10 dark:border-white/10">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <ArrowTopRightOnSquareIcon data-slot="icon" className="size-4 text-zinc-500" />
                                    <Text className="font-medium text-zinc-950 dark:text-white">Application Link</Text>
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

                <Divider soft />

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
                {keywordsList.length > 0 && (
                    <>
                        <Divider soft />
                        <section className="space-y-4">
                            <Subheading level={2}>Keywords</Subheading>
                            <div className="flex flex-wrap gap-2">
                                {keywordsList.map((keyword, index) => (
                                    <Badge key={index} color="blue">
                                        {keyword}
                                    </Badge>
                                ))}
                            </div>
                        </section>
                    </>
                )}

                <Divider />

                {/* Action Buttons */}
                <section className="flex flex-col sm:flex-row gap-4">
                    {userPermissions.canApply && opportunity.url && (
                        <Button
                            color="dark/white"
                            href={opportunity.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="sm:w-auto"
                        >
                            <ArrowTopRightOnSquareIcon data-slot="icon" />
                            Apply Now
                        </Button>
                    )}
                </section>
            </div>
        </FrontendLayout>
    );
}
