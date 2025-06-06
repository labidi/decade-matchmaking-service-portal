// resources/js/Pages/Requests/Show.tsx
import React from 'react';
import { Head, usePage, Link } from '@inertiajs/react';
import FrontendLayout from '@/Layouts/FrontendLayout';
import { OCDRequest } from '@/types';
import { UIRequestForm } from '@/Forms/UIRequestForm';


export default function ShowRequest() {
  const OcdRequest = usePage().props.request as OCDRequest;

  return (
    <FrontendLayout>
      <Head title={`Request: ${OcdRequest.id}`} />


      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <div className="max-w-screen-xl mx-auto px-5 bg-white min-h-sceen">
            <div className="grid divide-y divide-neutral-200 mx-auto">
              {UIRequestForm.map(step => (
                <div className="py-5" key={step.label}>
                  <details className="group">
                    <summary className="flex justify-between items-center font-medium cursor-pointer list-none">
                      <span>{step.label}</span>
                      <span className="transition group-open:rotate-180">
                        <svg
                          fill="none"
                          height="24"
                          shapeRendering="geometricPrecision"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.5"
                          viewBox="0 0 24 24"
                          width="24"
                        >
                          <path d="M6 9l6 6 6-6"></path>
                        </svg>
                      </span>
                    </summary>
                    <ul className="text-neutral-600 mt-3 group-open:animate-fadeIn list-disc">
                      {Object.entries(step.fields).map(([key, field]) => {
                        if (!field.label || field.type === 'hidden') return null;
                        if (field.show && !field.show(OcdRequest.request_data)) return null;
                        const value = (OcdRequest.request_data as any)[key];
                        if (value === undefined || value === '') return null;
                        const formatted = Array.isArray(value) ? value.join(', ') : value;
                        return (
                          <li key={key}>
                            <span className="font-medium">{field.label}: </span>
                            {formatted}
                          </li>
                        );
                      })}
                    </ul>
                  </details>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div>
          <div>
            <h2 className="text-xl font-semibold text-gray-500">Submission Date</h2>
            <p className="mt-1 text-lg text-gray-900">
              {new Date(OcdRequest.created_at).toLocaleDateString()}
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-500">Partner?</h2>
            <p className="mt-1 text-gray-900">{OcdRequest.request_data.is_partner}</p>
          </div>
          {OcdRequest.request_data.is_partner === 'Yes' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-500">Unique Partner ID</h2>
              <p className="mt-1 text-gray-900">{OcdRequest.request_data.unique_id}</p>
            </div>
          )}
          <div>
            <h2 className="text-xl font-semibold text-gray-500">Name</h2>
            <p className="mt-1 text-gray-900">
              {OcdRequest.request_data.first_name} {OcdRequest.request_data.last_name}
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-500">Email</h2>
            <p className="mt-1 text-gray-900">{OcdRequest.request_data.email}</p>
          </div>
        </div>

      </div>



      {/* Separator */}
      <div className="border-t border-gray-200 my-6" />


      {/* Actions */}
      <div className="mt-8 flex space-x-4">
        <Link
          href={route('user.request.myrequests')}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
        >
          Export the Request as PDF
        </Link>
      </div>
    </FrontendLayout>
  );
}
