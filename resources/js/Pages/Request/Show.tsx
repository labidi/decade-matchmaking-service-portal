// resources/js/Pages/Requests/Show.tsx
import React from 'react';
import { Head, usePage, Link } from '@inertiajs/react';
import FrontendLayout from '@/Layouts/FrontendLayout';
import { OCDRequest } from '@/types';


export default function ShowRequest() {
  const OcdRequest = usePage().props.request as OCDRequest;

  return (
    <FrontendLayout>
      <Head title={`Request: ${OcdRequest.id}`} />

      <h1 className="text-2xl font-bold mb-4">Request Details</h1>

      {/* Basic Info */}
      <div className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-gray-500">Submission Date</h2>
          <p className="mt-1 text-lg text-gray-900">
            {new Date(OcdRequest.created_at).toLocaleDateString()}
          </p>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-gray-500">Status</h2>
          <p className="mt-1 inline-block px-2 py-1 text-sm font-medium rounded-full 
              {OcdRequest.status.status_code === 'Approved' ? 'bg-green-100 text-green-800' :
               OcdRequest.status.status_code === 'Pending'  ? 'bg-yellow-100 text-yellow-800' :
               OcdRequest.status.status_code === 'Rejected' ? 'bg-red-100 text-red-800' :
               'bg-gray-100 text-gray-800'}">
            {OcdRequest.status.status_label}
          </p>
        </div>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-sm font-semibold text-gray-500">Partner?</h2>
            <p className="mt-1 text-gray-900">{OcdRequest.request_data.is_partner}</p>
          </div>
          {OcdRequest.request_data.is_partner === 'Yes' && (
            <div>
              <h2 className="text-sm font-semibold text-gray-500">Unique Partner ID</h2>
              <p className="mt-1 text-gray-900">{OcdRequest.request_data.unique_id}</p>
            </div>
          )}
          <div>
            <h2 className="text-sm font-semibold text-gray-500">Name</h2>
            <p className="mt-1 text-gray-900">
              {OcdRequest.request_data.first_name} {OcdRequest.request_data.last_name}
            </p>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-500">Email</h2>
            <p className="mt-1 text-gray-900">{OcdRequest.request_data.email}</p>
          </div>
        </section>

      

      {/* Separator */}
      <div className="border-t border-gray-200 my-6" />


      {/* Actions */}
      <div className="mt-8 flex space-x-4">
        <Link
          href={route('user.request.list')}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
        >
          Export the Request as PDF
        </Link>
      </div>
    </FrontendLayout>
  );
}
