// resources/js/Components/RequestsList.tsx
import React from 'react';
import { Head, Link } from '@inertiajs/react';
import FrontendLayout from '@/Layouts/FrontendLayout';
import { OCDRequest, OCDRequestList } from '@/types';
import { usePage } from '@inertiajs/react';

export default function RequestsList() {
    const requests = usePage().props.requests as OCDRequestList;
    return (
        <FrontendLayout>
            <Head title="Welcome" />
            <div className="overflow-x-auto">
                <table className="min-w-full table-auto bg-white">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-2 text-left text-xl font-medium text-gray-500 uppercase">
                                ID
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
                        {requests.map((req: OCDRequest) => (
                            <tr key={req.id} className="hover:bg-gray-100">
                                <td className="px-4 py-2 whitespace-nowrap text-base text-gray-900">
                                    {req.id}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-base text-gray-900">
                                    {new Date(req.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-base text-gray-900">
                                    {req.status.status_label}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap flex space-x-2">

                                    <Link
                                        href={route('request.show', req.id)}
                                        className="px-2 py-1 text-base font-medium text-green-600 hover:text-green-800"
                                    >
                                        View
                                    </Link>
                                    <Link
                                        href={route('request.show', req.id)}
                                        className="px-2 py-1 text-base font-medium text-green-600 hover:text-green-800"
                                    >
                                        Express interest
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
