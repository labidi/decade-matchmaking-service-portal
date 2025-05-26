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
                <div className='flex justify-between items-center mb-6'>
                    <Link
                        href={route('request.create')}    
                        className="px-4 py-2 bg-firefly-600 text-white rounded hover:bg-firefly-700"
                        >
                        Create new request
                    </Link>
                </div>
                <table className="min-w-full table-auto bg-white">
                    <thead className="bg-gray-50">
                        <tr>

                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                ID
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                Submission Date
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                Status
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {requests.map((req: OCDRequest) => (
                            <tr key={req.id} className="hover:bg-gray-100">
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                    {req.id}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                    {new Date(req.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                    {req.status.status_label}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap flex space-x-2">
                                    {(req.status.status_code === 'draft' || req.status.status_code === 'in_implementation') && (
                                        <Link
                                            href={route('request.edit', req.id)}
                                            className="px-2 py-1 text-sm font-medium text-blue-600 hover:text-blue-800"
                                        >
                                            Edit
                                        </Link>
                                    )}
                                    <Link
                                        href={route('request.show', req.id)}
                                        className="px-2 py-1 text-sm font-medium text-green-600 hover:text-green-800"
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