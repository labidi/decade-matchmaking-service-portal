// resources/js/Pages/Requests/Show.tsx
import React, { useState } from 'react';
import { Head, usePage, Link, useForm } from '@inertiajs/react';
import FrontendLayout from '@/Layouts/FrontendLayout';
import { OCDRequest, OCDRequestGrid , DocumentList } from '@/types';
import { UIRequestForm } from '@/Forms/UIRequestForm';


export default function ShowRequest() {
  const OcdRequest = usePage().props.request as OCDRequest;
  const documents = usePage().props.documents as DocumentList;
  const form = useForm<{ file: File | null; document_type: string }>({
    file: null,
    document_type: 'financial_breakdown_report',
  });
  const RequestDetails = usePage().props.requestDetail as OCDRequestGrid;


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
                      <span className="text-2xl text-firefly-800">{step.label}</span>
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
                    <ul className=" group-open:animate-fadeIn list-none">
                      {Object.entries(step.fields).map(([key, field]) => {
                        if (!field.label || field.type === 'hidden') return null;
                        if (field.show && !field.show(OcdRequest.request_data)) return null;
                        const value = (OcdRequest.request_data as any)[key];
                        if (value === undefined || value === '') return null;
                        const formatted = Array.isArray(value) ? value.join(', ') : value;
                        return (
                          <li key={key} className='py-2 text-xl'>
                            <span className="text-firefly-600">{field.label}: </span> <br />
                            {formatted ?? 'N/A'}
                          </li>
                        );
                      })}
                    </ul>
                  </details>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-6">
            <h2 className="text-xl font-semibold text-gray-500 mb-2">Attachments</h2>
            <form
              onSubmit={e => {
                e.preventDefault();
                form.post(route('user.request.document.store', { request: OcdRequest.id }), {
                  forceFormData: true,
                  onSuccess: () => form.reset(),
                });
              }}
            >
              <div className="flex space-x-4 items-end">
                <select
                  className="border rounded px-2 py-1"
                  value={form.data.document_type}
                  onChange={e => form.setData('document_type', e.currentTarget.value)}
                >
                  <option value="financial_breakdown_report">Financial Breakdown Report</option>
                  <option value="lesson_learned_report">Lesson Learned Report</option>
                  <option value="offer_document">Offer Document</option>
                </select>
                <input
                  type="file"
                  className="border rounded px-2 py-1"
                  onChange={e => form.setData('file', e.currentTarget.files ? e.currentTarget.files[0] : null)}
                />
                <button
                  type="submit"
                  className="px-4 py-1 bg-firefly-600 text-white rounded disabled:opacity-50"
                  disabled={form.processing || !form.data.file}
                >
                  Upload
                </button>
              </div>
            </form>
            {documents.length > 0 && (
              <table className="mt-4 w-full text-left border">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2">Name</th>
                    <th className="p-2">Type</th>
                    <th className="p-2">Uploaded At</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map(doc => (
                    <tr key={doc.id} className="border-t">
                      <td className="p-2">
                        <a href={`/storage/${doc.path}`} className="text-blue-600 underline">
                          {doc.name}
                        </a>
                      </td>
                      <td className="p-2">{doc.document_type}</td>
                      <td className="p-2">{new Date(doc.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
        <div>
          <div className='py-2'>
            <h2 className="text-2xl text-firefly-800">Submission Date</h2>
            <p className="mt-1 text-xl text-gray-900">
              {new Date(OcdRequest.created_at).toLocaleDateString()}
            </p>
          </div>
          <div>
            <h2 className="text-2xl text-firefly-800">Status</h2>
            <p className="mt-1 text-xl text-gray-900">
              {OcdRequest.status.status_label}
            </p>
          </div>
        </div>

      </div>

      <section id="offer_container" className='container'>
        <div className='row-span-full
'>
          <table className="table-auto w-full">
            <thead>
              <tr>
                <th>Attachement Type</th>
                <th>File name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
            </tbody>
          </table>u
        </div>

      </section>



      {/* Separator */}
      <div className="border-t border-gray-200 my-6" />


      {/* Actions */}
      <div className="mt-8 flex space-x-4">

        {RequestDetails.actions.canExportPdf && (
          <Link
            href={route('user.request.myrequests')}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            Export the Request as PDF
          </Link>
        )}

        {RequestDetails.actions.canEdit && (
          <Link
            href={route('user.request.myrequests')}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            Edit
          </Link>
        )}

        {RequestDetails.actions.canDelete && (
          <Link
            href={route('user.request.myrequests')}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            Delete
          </Link>
        )}

        {RequestDetails.actions.canDelete && (
          <Link
            href={route('user.request.myrequests')}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            Delete
          </Link>
        )}

      </div>
    </FrontendLayout>
  );
}
