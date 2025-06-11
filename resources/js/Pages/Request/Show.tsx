import { Head, usePage, Link } from '@inertiajs/react';
import FrontendLayout from '@/Layouts/FrontendLayout';
import { OCDRequest, OCDRequestGrid, DocumentList } from '@/types';
import AttachementsSection from '@/Pages/Request/Components/AttachementsSection';
import RequestDetailsSection from '@/Pages/Request/Components/RequestDetailsSection';


export default function ShowRequest() {
  const OcdRequest = usePage().props.request as OCDRequest;
  const RequestPageDetails = usePage().props.requestDetail as OCDRequestGrid;
  const documents = usePage().props.documents as DocumentList;

  return (
    <FrontendLayout>
      <Head title={`Request: ${OcdRequest.id}`} />

      <RequestDetailsSection OcdRequest={OcdRequest} />
      <AttachementsSection OcdRequest={OcdRequest} documents={documents} />

      {/* Separator */}
      <div className="border-t border-gray-200 my-6" />

      {/* Actions */}
      <div className="mt-8 flex space-x-4">

        {RequestPageDetails.actions.canExportPdf && (
          <Link
            href={route('user.request.myrequests')}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            Export the Request as PDF
          </Link>
        )}

        {RequestPageDetails.actions.canEdit && (
          <Link
            href={route('user.request.myrequests')}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            Edit
          </Link>
        )}

        {RequestPageDetails.actions.canDelete && (
          <Link
            href={route('user.request.myrequests')}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            Delete
          </Link>
        )}

        {RequestPageDetails.actions.canDelete && (
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
