// resources/js/Pages/Opportunities/Show.tsx
import React from 'react';
import { Head, usePage, Link } from '@inertiajs/react';
import FrontendLayout from '@/Layouts/FrontendLayout';
import { OCDOpportunity } from '@/types';

export default function Show() {
    const opportunity = usePage().props.opportunity as OCDOpportunity;
    console.log(opportunity);
    return (
        <FrontendLayout>
            <Head title={`Opportunity: ${opportunity.title}`} />

            <div className="mx-auto p-6">
                {/* Title */}
                <h1 className="text-3xl font-bold mb-4">{opportunity.title}</h1>

                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <h2 className="text-sm font-semibold text-gray-500">ID</h2>
                        <p className="mt-1 text-gray-900">#{opportunity.id}</p>
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold text-gray-500">Status</h2>
                        <span
                            className={`inline-block px-2 py-1 text-sm font-medium rounded-full ${opportunity.status === 'Open'
                                    ? 'bg-green-100 text-green-800'
                                    : opportunity.status === 'Closed'
                                        ? 'bg-red-100 text-red-800'
                                        : 'bg-gray-100 text-gray-800'
                                }`}
                        >
                            {opportunity.status}
                        </span>
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold text-gray-500">Created</h2>
                        <p className="mt-1 text-gray-900">
                            {new Date(opportunity.created_at).toLocaleDateString()}
                        </p>
                    </div>
                    {opportunity.updated_at && (
                        <div>
                            <h2 className="text-sm font-semibold text-gray-500">Last Updated</h2>
                            <p className="mt-1 text-gray-900">
                                {new Date(opportunity.updated_at).toLocaleDateString()}
                            </p>
                        </div>
                    )}
                    {opportunity.url && (
                        <div className="md:col-span-2">
                            <h2 className="text-sm font-semibold text-gray-500">Related Link</h2>
                            <p className="mt-1">
                                <a
                                    href={opportunity.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline"
                                >
                                    {opportunity.url}
                                </a>
                            </p>
                        </div>
                    )}
                </div>

                {/* summary */}
                <div className="mb-6">
                    <h2 className="text-sm font-semibold text-gray-500">Summary</h2>
                    <p className="mt-1 text-gray-900 whitespace-pre-line">
                        {opportunity.summary}
                    </p>
                </div>

                {/* Tags */}
                {/* {opportunity.tags && opportunity.tags.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-gray-500">Tags</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {opportunity.tags.map(tag => (
                <span
                  key={tag}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )} */}

                {/* Actions */}
                <div className="mt-8 flex space-x-4">
                    {(opportunity.can_edit &&
                        <Link
                            href={`/opportunities/${opportunity.id}/edit`}
                            className="px-4 py-2 bg-firefly-600 text-white rounded hover:bg-firefly-700"
                        >
                            Edit Opportunity
                        </Link>
                    )

                    }
                </div>
            </div>
        </FrontendLayout>
    );
}
