// resources/js/Components/RequestsList.tsx
import React from 'react';
import { Head, Link } from '@inertiajs/react';
import FrontendLayout from '@/Layouts/FrontendLayout';
import { OCDOpportunity, OCDOpportunitiesList } from '@/types';
import { usePage } from '@inertiajs/react';
import { Auth, User } from '@/types';


export default function OpportunitiesList() {
    const opportunities = usePage().props.opportunities as OCDOpportunitiesList;
    const { auth } = usePage<{ auth: Auth }>().props;
    return (
        <FrontendLayout>
            <Head title="Welcome" />
            <div className="overflow-x-auto">
                <div className='flex justify-between items-center mb-6'>
                    {auth.user.is_partner && (
                        <Link
                            href={route('partner.opportunity.create')}
                            className="px-4 text-xl py-2 bg-firefly-600 text-white rounded hover:bg-firefly-700"
                        >
                            Submit New Opportunity
                        </Link>
                    )}
                </div>
                <table className="min-w-full table-auto bg-white">
                    <thead className="bg-gray-50">
                        <tr>

                            <th className="px-4 py-2 text-left text-xl font-medium text-gray-500 uppercase">
                                ID
                            </th>
                            <th className="px-4 py-2 text-left text-xl font-medium text-gray-500 uppercase">
                                title
                            </th>
                            <th className="px-4 py-2 text-left text-xl font-medium text-gray-500 uppercase">
                                Submission Date
                            </th>
                            <th className="px-4 py-2 text-left text-xl font-medium text-gray-500 uppercase">
                                Status
                            </th>
                            <th className="px-4 py-2 text-left text-xl font-medium text-gray-500 uppercase">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {opportunities.map((opportunity: OCDOpportunity) => (
                            <tr key={opportunity.id} className="hover:bg-gray-100">
                                <td className="px-4 py-2 whitespace-nowrap text-base text-gray-900">
                                    {opportunity.id}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-base text-gray-900">
                                    {opportunity.title}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-base text-gray-900">
                                    {new Date(opportunity.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-base text-gray-900">
                                    {opportunity.status_label}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap flex space-x-2">
                                    {(opportunity.can_edit) && (
                                        <Link
                                            href="#"
                                            className="px-2 py-1 text-base font-medium text-blue-600 hover:text-blue-800"
                                        >
                                            Edit
                                        </Link>
                                    )}
                                    <Link
                                        href={route('partner.opportunity.show', opportunity.id)}
                                        className="px-2 py-1 text-base font-medium text-green-600 hover:text-green-800"
                                    >
                                        View
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </FrontendLayout>
    )
}