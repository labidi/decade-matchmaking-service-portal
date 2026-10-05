import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Button } from '@ui/primitives/button';
import { ArrowUpTrayIcon, ChevronRightIcon, ListBulletIcon, LockClosedIcon } from '@heroicons/react/16/solid';
import { Auth } from '@/types';
import { Opportunity, OpportunityFormOptions } from '@features/opportunities/types';
import { ODC_TRAVEL_SUPPORT_TYPE } from '../config/odc-travel-support-form-fields';
import ODCTravelSupportList from './odc-travel-support-list';
import ODCTravelSupportUploadDialog from './odc-travel-support-upload-dialog';

/** Placeholder rows shown, blurred, to signed-out visitors. The backend never sends real rows to guests. */
const PLACEHOLDER_OPPORTUNITIES: Opportunity[] = Array.from({ length: 4 }, (_, index) => ({
    id: `placeholder-${index}`,
    title: 'ODC travel support opportunity',
    co_organizers: ['Organiser'],
    type: { value: ODC_TRAVEL_SUPPORT_TYPE, label: 'ODC Travel Support' },
    status: { value: 'active', label: 'Active' },
    closing_date: new Date(Date.now() + (index + 1) * 12 * 24 * 60 * 60 * 1000).toISOString(),
    coverage_activity: null,
    implementation_location: [],
    thematic_areas: [],
    thematic_areas_other: '',
    target_audience: [],
    target_audience_other: '',
    target_languages: [],
    target_languages_other: '',
    summary: '',
    url: '',
    apply_url: '',
    created_at: '',
    updated_at: '',
    user_id: '',
    can_edit: false,
    key_words: [],
}));

interface ODCTravelSupportSectionProps {
    opportunities?: Opportunity[];
    formOptions?: OpportunityFormOptions;
}

export default function ODCTravelSupportSection({ opportunities = [], formOptions }: Readonly<ODCTravelSupportSectionProps>) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const isSignedIn = Boolean(auth?.user);
    const [showUploadDialog, setShowUploadDialog] = useState(false);

    // Only ODC travel support sorted by closing date, soonest first. The backend pre-filters; this is a defensive fallback.
    const openOpportunities = [...opportunities]
        .filter(opportunity => opportunity.type?.value === ODC_TRAVEL_SUPPORT_TYPE)
        .sort((a, b) => new Date(a.closing_date).getTime() - new Date(b.closing_date).getTime());

    const listHref = route('opportunity.list', { type: ODC_TRAVEL_SUPPORT_TYPE });

    return (
        <section id="odc-travel-support" aria-labelledby="odc-travel-support-heading" className="space-y-5">
            <div className="flex flex-col gap-5 rounded-xl border border-firefly-200 bg-firefly-50 px-6 py-5 lg:flex-row lg:items-center lg:justify-between dark:border-firefly-800 dark:bg-firefly-950/40">
                <div className="max-w-2xl space-y-1">
                    <p className="text-xs font-medium text-firefly-700 dark:text-firefly-300">Ocean Decade Conference (ODC)</p>
                    <h2 id="odc-travel-support-heading" className="text-xl font-semibold text-firefly-800 dark:text-gray-100">
                        ODC Travel Support
                    </h2>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                        Browse the ODC travel support opportunities currently open, or post one your organisation offers.
                    </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row lg:shrink-0">
                    {isSignedIn ? (
                        <Button href={listHref} color="firefly">
                            <ListBulletIcon data-slot="icon" aria-hidden="true" />
                            See active ODC travel support
                        </Button>
                    ) : (
                        <Button color="firefly" disabled title="Sign in to see active ODC travel support">
                            <LockClosedIcon data-slot="icon" aria-hidden="true" />
                            See active ODC travel support
                        </Button>
                    )}
                    <Button outline onClick={() => setShowUploadDialog(true)}>
                        <ArrowUpTrayIcon data-slot="icon" aria-hidden="true" />
                        Upload an ODC travel support opportunity
                    </Button>
                </div>
            </div>

            <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                <div>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Open ODC travel support opportunities, closing soonest first</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Only ODC travel support opportunities. Sorted by closing date.</p>
                </div>
                {isSignedIn ? (
                    <Link
                        href={listHref}
                        className="inline-flex items-center gap-1 text-sm font-medium text-firefly-700 hover:underline dark:text-firefly-300"
                    >
                        View all ODC travel support
                        <ChevronRightIcon className="size-4" aria-hidden="true" />
                    </Link>
                ) : (
                    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 dark:text-gray-400">
                        <LockClosedIcon className="size-4" aria-hidden="true" />
                        Sign in to view
                    </span>
                )}
            </div>

            <ODCTravelSupportList
                opportunities={isSignedIn ? openOpportunities : PLACEHOLDER_OPPORTUNITIES}
                unlocked={isSignedIn}
            />

            <ODCTravelSupportUploadDialog
                open={showUploadDialog}
                onClose={() => setShowUploadDialog(false)}
                formOptions={formOptions}
            />
        </section>
    );
}
