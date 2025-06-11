import { Head, usePage, Link } from '@inertiajs/react';
import FrontendLayout from '@/Layouts/FrontendLayout';
import { OCDRequest, OCDRequestGrid, DocumentList, RequestOffer } from '@/types';
import OfferSection from '@/Pages/Request/Components/OfferSection';
import RequestDetailsSection from '@/Pages/Request/Components/RequestDetailsSection';


export default function ShowRequest() {
  const OcdRequest = usePage().props.request as OCDRequest;
  const RequestPageDetails = usePage().props.requestDetail as OCDRequestGrid;
  const OcdRequestOffer = usePage().props.offer as RequestOffer;

  return (
    <FrontendLayout>
      <Head title={`Request: ${OcdRequest.id}`} />

      <RequestDetailsSection OcdRequest={OcdRequest} />
      <OfferSection OcdRequest={OcdRequest} OcdRequestOffer={OcdRequestOffer} />

      {/* Separator */}
      <div className="border-t border-gray-200 my-6" />

      {/* Actions */}
      <div className="mt-8 flex space-x-4">

        {RequestPageDetails.actions.canExportPdf && (
          <Link
            href={route('user.request.myrequests')}
            className="px-4 py-2 bg-firefly-200 text-gray-800 rounded hover:bg-firefly-300"
          >
            Export the Request as PDF
          </Link>
        )}

        {RequestPageDetails.actions.canEdit && (
          <Link
            href={route('user.request.myrequests')}
            className="px-4 py-2 bg-firefly-200 text-gray-800 rounded hover:bg-firefly-300"
          >
            Edit
          </Link>
        )}

        {RequestPageDetails.actions.canDelete && (
          <Link
            href={route('user.request.myrequests')}
            className="px-4 py-2 bg-firefly-200 text-gray-800 rounded hover:bg-firefly-300"
          >
            Delete
          </Link>
        )}


        {RequestPageDetails.actions.canAcceptOffer && (
          <Link
            href={route('user.request.myrequests')}
            className="px-4 py-2 bg-firefly-200 text-gray-800 rounded hover:bg-firefly-300"
          >
            Accept Offer
          </Link>
        )}

        {RequestPageDetails.actions.canRequestClarificationForOffer && (
          <Link
            href={route('user.request.myrequests')}
            className="px-4 py-2 bg-firefly-200 text-gray-800 rounded hover:bg-firefly-300"
          >
            Request clarification from IOC
          </Link>
        )}



      </div>
    </FrontendLayout>
  );
}
