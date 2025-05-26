// resources/js/Pages/Requests/Show.tsx
import React from 'react';
import { Head, usePage } from '@inertiajs/react';
import FrontendLayout from '@/Layouts/FrontendLayout';
import { OCDRequest } from '@/types';

interface RequestDetails {
  id: string;
  type: string;
  submissionDate: string;
  status: string;
  // add any other fields your request has:
  unique_id?: string;
  activity_name?: string;
  gap_description?: string;
  support_types?: string[];
  subthemes?: string[];
  needs_financial_support?: string;
  budget_breakdown?: string;
  // …etc.
}

interface Props {
  request: RequestDetails;
}

export default function ShowRequest() {
  const request = usePage().props.request as OCDRequest;

  return (
    <FrontendLayout>
      <Head title={`Request: ${request.id}`} />

      <div className="max-w-3xl mx-auto p-6 bg-white shadow rounded-md mt-6">
        <h1 className="text-2xl font-bold mb-4">Request Details</h1>

        {/* Basic Info */}
        <div className="space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-gray-500">Request Type</h2>
            <p className="mt-1 text-lg text-gray-900">{request.type}</p>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-gray-500">Submission Date</h2>
            <p className="mt-1 text-lg text-gray-900">
              {new Date(request.submissionDate).toLocaleDateString()}
            </p>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-gray-500">Status</h2>
            <p className="mt-1 inline-block px-2 py-1 text-sm font-medium rounded-full 
              {request.status === 'Approved' ? 'bg-green-100 text-green-800' :
               request.status === 'Pending'  ? 'bg-yellow-100 text-yellow-800' :
               request.status === 'Rejected' ? 'bg-red-100 text-red-800' :
               'bg-gray-100 text-gray-800'}">
              {request.status}
            </p>
          </div>
        </div>

        {/* Separator */}
        <div className="border-t border-gray-200 my-6" />

        {/* Extended Details */}
        <div className="space-y-6">
          {request.unique_id && (
            <div>
              <h2 className="text-sm font-semibold text-gray-500">Unique Partner ID</h2>
              <p className="mt-1 text-gray-900">{request.unique_id}</p>
            </div>
          )}

          {request.activity_name && (
            <div>
              <h2 className="text-sm font-semibold text-gray-500">Activity / Programme</h2>
              <p className="mt-1 text-gray-900">{request.activity_name}</p>
            </div>
          )}

          {request.subthemes && request.subthemes.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-500">Sub-themes</h2>
              <ul className="mt-1 list-disc list-inside text-gray-900">
                {request.subthemes.map(t => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
          )}

          {request.support_types && request.support_types.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-500">Requested Support</h2>
              <ul className="mt-1 list-disc list-inside text-gray-900">
                {request.support_types.map(s => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
          )}

          {request.gap_description && (
            <div>
              <h2 className="text-sm font-semibold text-gray-500">Capacity Gap</h2>
              <p className="mt-1 text-gray-900 whitespace-pre-line">{request.gap_description}</p>
            </div>
          )}

          {request.needs_financial_support && (
            <div>
              <h2 className="text-sm font-semibold text-gray-500">Financial Support Needed</h2>
              <p className="mt-1 text-gray-900">{request.needs_financial_support}</p>
            </div>
          )}

          {request.budget_breakdown && (
            <div>
              <h2 className="text-sm font-semibold text-gray-500">Budget Breakdown (USD)</h2>
              <p className="mt-1 text-gray-900 whitespace-pre-line">{request.budget_breakdown}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-8 flex space-x-4">
          <a
            href={`/requests/${request.id}/edit`}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Edit Request
          </a>
          <a
            href="/requests"
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            Back to List
          </a>
        </div>
      </div>
    </FrontendLayout>
  );
}
