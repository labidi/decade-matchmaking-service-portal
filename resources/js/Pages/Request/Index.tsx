// resources/js/Pages/Requests/Index.tsx
import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import FrontendLayout from '@/Layouts/FrontendLayout';

interface RequestRecord {
  id: number;
  unique_id: string;
  first_name: string;
  last_name: string;
  email: string;
  created_at: string;
}

interface Props {
  requests: RequestRecord[];
}

export default function RequestsIndex() {
  const { requests } = usePage().props;
  return (
    <FrontendLayout>
      <Head title="Manage Requests" />

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Your Requests</h1>
        <Link
          href={route('requests.create')}
          className="btn btn-primary"
        >
          Add New Request
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="table table-zebra w-full">
          <thead>
            <tr>
              <th>ID</th>
              <th>Unique ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req: RequestRecord) => (
              <tr key={req.id}>
                <td>{req.id}</td>
                <td>{req.unique_id}</td>
                <td>{req.first_name} {req.last_name}</td>
                <td>{req.email}</td>
                <td>{new Date(req.created_at).toLocaleDateString()}</td>
                <td className="space-x-2">
                  <Link
                    href={route('requests.edit', req.id)}
                    className="btn btn-sm btn-outline"
                  >
                    Edit
                  </Link>
                  <Link
                    href={route('requests.destroy', req.id)}
                    method="delete"
                    as="button"
                    data-confirm="Are you sure you want to delete this request?"
                    className="btn btn-sm btn-error btn-outline"
                  >
                    Delete
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </FrontendLayout>
  );
}
