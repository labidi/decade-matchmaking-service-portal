import React from 'react';
import { Link } from '@inertiajs/react';
import { ChevronRightIcon, LockClosedIcon } from '@heroicons/react/20/solid';
import { Opportunity } from '@features/opportunities/types';
import { SignInDialog } from '@features/auth';
import { formatDateShort } from '@shared/utils/date-formatter';
import clsx from 'clsx';

const CLOSING_SOON_DAYS = 7;
const MS_PER_DAY = 1000 * 60 * 60 * 24;

function getDaysRemaining(closingDate: string): number {
    return Math.ceil((new Date(closingDate).getTime() - Date.now()) / MS_PER_DAY);
}

function describeDaysRemaining(days: number): string {
    if (days < 0) return 'Closed';
    if (days === 0) return 'Closes today';
    if (days === 1) return 'Closes tomorrow';
    return `Closes in ${days} days`;
}

function organiserLabel(opportunity: Opportunity): string {
    const organisers = opportunity.co_organizers ?? [];
    return organisers.length > 0 ? organisers.join(' · ') : 'N/A';
}

const gridClasses = 'grid grid-cols-12 items-center gap-4 px-5';

function ODCTravelSupportRow({ opportunity, interactive }: Readonly<{ opportunity: Opportunity; interactive: boolean }>) {
    const days = getDaysRemaining(opportunity.closing_date);
    const closingSoon = days >= 0 && days <= CLOSING_SOON_DAYS;
    const showHref = route('opportunity.show', opportunity.id);

    const title = interactive ? (
        <Link
            href={showHref}
            className="truncate text-sm font-medium text-gray-900 hover:text-firefly-700 hover:underline dark:text-gray-100 dark:hover:text-firefly-300"
        >
            {opportunity.title}
        </Link>
    ) : (
        <span className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">{opportunity.title}</span>
    );

    return (
        <li className={clsx(gridClasses, 'border-b border-gray-100 py-3.5 last:border-b-0 dark:border-gray-700/60')}>
            <div className="col-span-6 flex min-w-0 flex-col gap-0.5">{title}</div>
            <div className="col-span-3 truncate text-sm text-gray-700 dark:text-gray-300">{organiserLabel(opportunity)}</div>
            <div className="col-span-2 flex flex-col">
                <span className="text-sm text-gray-900 dark:text-gray-100">{formatDateShort(opportunity.closing_date)}</span>
                <span className={clsx('text-xs font-medium', closingSoon ? 'text-amber-700 dark:text-amber-400' : 'text-gray-500 dark:text-gray-400')}>
                    {describeDaysRemaining(days)}
                </span>
            </div>
            <div className="col-span-1 flex justify-end">
                {interactive ? (
                    <Link
                        href={showHref}
                        aria-label={`View ${opportunity.title}`}
                        className="inline-flex size-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-firefly-300 hover:text-firefly-700 dark:border-gray-700 dark:text-gray-400"
                    >
                        <ChevronRightIcon className="size-4" aria-hidden="true" />
                    </Link>
                ) : (
                    <span className="inline-flex size-8 rounded-lg border border-gray-200 dark:border-gray-700" />
                )}
            </div>
        </li>
    );
}

function LockedOverlay() {
    return (
        <div className="absolute inset-0 flex items-center justify-center bg-white/55 p-4 dark:bg-gray-900/55">
            <div className="flex w-full max-w-md flex-col items-center gap-3 rounded-xl border border-gray-200 bg-white p-6 text-center shadow-lg dark:border-gray-700 dark:bg-gray-800">
                <span className="flex size-11 items-center justify-center rounded-full bg-firefly-100 text-firefly-700 dark:bg-firefly-900/40 dark:text-firefly-300">
                    <LockClosedIcon className="size-5" aria-hidden="true" />
                </span>
                <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">Sign in to see active ODC travel support</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                    The list of ODC travel support opportunities is available to signed-in users.
                </span>
                <div className="mt-1">
                    <SignInDialog />
                </div>
            </div>
        </div>
    );
}

interface ODCTravelSupportListProps {
    opportunities: Opportunity[];
    /** When false the rows are blurred, non-interactive and covered by a sign-in prompt. */
    unlocked: boolean;
}

export default function ODCTravelSupportList({ opportunities, unlocked }: Readonly<ODCTravelSupportListProps>) {
    if (unlocked && opportunities.length === 0) {
        return (
            <div className="rounded-lg border border-dashed border-gray-300 px-6 py-10 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
                No ODC travel support opportunities are open right now. Check back soon or upload one your organisation offers.
            </div>
        );
    }

    return (
        <div className="relative overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <div
                aria-hidden={!unlocked}
                className={clsx(!unlocked && 'pointer-events-none select-none blur-sm')}
            >
                <div className={clsx(gridClasses, 'border-b border-gray-200 bg-gray-50 py-2.5 text-xs font-medium text-gray-500 dark:border-gray-700 dark:bg-gray-800/60 dark:text-gray-400')}>
                    <div className="col-span-6">Opportunity</div>
                    <div className="col-span-3">Organiser</div>
                    <div className="col-span-2">Closing date</div>
                    <div className="col-span-1" />
                </div>
                <ul>
                    {opportunities.map(opportunity => (
                        <ODCTravelSupportRow key={opportunity.id} opportunity={opportunity} interactive={unlocked} />
                    ))}
                </ul>
            </div>
            {!unlocked && <LockedOverlay />}
        </div>
    );
}
