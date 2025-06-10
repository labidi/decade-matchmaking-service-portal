// resources/js/Pages/Requests/Show.tsx
import React, { useState } from 'react';
import { Head, usePage, Link, useForm } from '@inertiajs/react';
import jsPDF from 'jspdf';
import FrontendLayout from '@/Layouts/FrontendLayout';
import { OCDRequest, OCDRequestGrid,DocumentList} from '@/types';
import { UIRequestForm } from '@/Forms/UIRequestForm';
import Attachements from '@/Pages/Request/Components/Attachements';


export default function ShowRequest() {
  const OcdRequest = usePage().props.request as OCDRequest;
  const RequestDetails = usePage().props.requestDetail as OCDRequestGrid;
  const documents = usePage().props.documents as DocumentList;

  const exportPdf = () => {
    const doc = new jsPDF();
    let y = 10;

    doc.setFontSize(18);
    doc.text(`Request #${OcdRequest.id}`, 10, y);
    y += 10;

    UIRequestForm.forEach(step => {
      doc.setFontSize(14);
      doc.text(step.label, 10, y);
      y += 7;

      Object.entries(step.fields).forEach(([key, field]) => {
        if (!field.label || field.type === 'hidden') return;
        if (field.show && !field.show(OcdRequest.request_data as any)) return;
        const value = (OcdRequest.request_data as any)[key];
        if (value === undefined || value === '') return;
        const formatted = Array.isArray(value) ? value.join(', ') : String(value);

        const lines = doc.splitTextToSize(`${field.label}: ${formatted}`, 180);
        doc.setFontSize(12);
        lines.forEach(line => {
          if (y > 280) {
            doc.addPage();
            y = 10;
          }
          doc.text(line, 10, y);
          y += 6;
        });
      });

      y += 4;
      if (y > 280) {
        doc.addPage();
        y = 10;
      }
    });

    doc.save(`request-${OcdRequest.id}.pdf`);
  };

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
          <Attachements OcdRequest={OcdRequest} documents={documents} />
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
        <div className='row-span-full'>
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
          </table>
        </div>
      </section>



      {/* Separator */}
      <div className="border-t border-gray-200 my-6" />


      {/* Actions */}
      <div className="mt-8 flex space-x-4">

        {RequestDetails.actions.canExportPdf && (
          <button
            type="button"
            onClick={exportPdf}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            Export the Request as PDF
          </button>
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
