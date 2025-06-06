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


      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <div className="max-w-screen-xl mx-auto px-5 bg-white min-h-sceen">
            <div className="grid divide-y divide-neutral-200 mx-auto">
              <div className="py-5">
                <details className="group">
                  <summary className="flex justify-between items-center font-medium cursor-pointer list-none">
                    <span> Details</span>
                    <span className="transition group-open:rotate-180">
                      <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" stroke-linecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path>
                      </svg>
                    </span>
                  </summary>
                  <ul className="text-neutral-600 mt-3 group-open:animate-fadeIn list-disc">
                    <li>
                      We offers a 30-day money-back guarantee for most of its subscription plans. If you are not
                      satisfied with your subscription within the first 30 days, you can request a full refund. Refunds
                      for subscriptions that have been active for longer than 30 days may be considered on a case-by-case
                      basis.
                    </li><li>
                      We offers a 30-day money-back guarantee for most of its subscription plans. If you are not
                      satisfied with your subscription within the first 30 days, you can request a full refund. Refunds
                      for subscriptions that have been active for longer than 30 days may be considered on a case-by-case
                      basis.
                    </li><li>
                      We offers a 30-day money-back guarantee for most of its subscription plans. If you are not
                      satisfied with your subscription within the first 30 days, you can request a full refund. Refunds
                      for subscriptions that have been active for longer than 30 days may be considered on a case-by-case
                      basis.
                    </li>
                  </ul>
                </details>
              </div>
              <div className="py-5">
                <details className="group">
                  <summary className="flex justify-between items-center font-medium cursor-pointer list-none">
                    <span>Capacity & Partners</span>
                    <span className="transition group-open:rotate-180">
                      <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path>
                      </svg>
                    </span>
                  </summary>
                  <p className="text-neutral-600 mt-3 group-open:animate-fadeIn">
                    To cancel your We subscription, you can log in to your account and navigate to the
                    subscription management page. From there, you should be able to cancel your subscription and stop
                    future billing.
                  </p>
                </details>
              </div>
              <div className="py-5">
                <details className="group">
                  <summary className="flex justify-between items-center font-medium cursor-pointer list-none">
                    <span>Service</span>
                    <span className="transition group-open:rotate-180">
                      <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path>
                      </svg>
                    </span>
                  </summary>
                  <p className="text-neutral-600 mt-3 group-open:animate-fadeIn">
                    To cancel your We subscription, you can log in to your account and navigate to the
                    subscription management page. From there, you should be able to cancel your subscription and stop
                    future billing.
                  </p>
                </details>
              </div>
              <div className="py-5">
                <details className="group">
                  <summary className="flex justify-between items-center font-medium cursor-pointer list-none">
                    <span>Risks</span>
                    <span className="transition group-open:rotate-180">
                      <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path>
                      </svg>
                    </span>
                  </summary>
                  <p className="text-neutral-600 mt-3 group-open:animate-fadeIn">
                    To cancel your We subscription, you can log in to your account and navigate to the
                    subscription management page. From there, you should be able to cancel your subscription and stop
                    future billing.
                  </p>
                </details>
              </div>
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
