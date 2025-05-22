// resources/js/Components/RequestsList.tsx
import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Table } from '@radix-ui/themes';
import FrontendLayout from '@/Layouts/FrontendLayout';

type Request = {
    id: string;
    type: string;
    submissionDate: string;
    status: string;
};

interface Props {
    data: [Request[]];
}


export const exampleRequests: Request[] = [
  {
    id: 'req-001',
    type: 'Workshop Funding',
    submissionDate: '2025-05-10',
    status: 'Pending',
  },
  {
    id: 'req-002',
    type: 'Technical Training',
    submissionDate: '2025-05-12',
    status: 'Approved',
  },
  {
    id: 'req-003',
    type: 'Curriculum Development',
    submissionDate: '2025-05-15',
    status: 'In Review',
  },
  {
    id: 'req-004',
    type: 'Data Management Support',
    submissionDate: '2025-05-18',
    status: 'Rejected',
  },
];

const RequestsList: React.FC<Props> = ({ data }) => (
    <FrontendLayout>
        <Head title="Welcome" />
        
<Table.Root
      className="w-full table-auto min-w-full divide-y divide-gray-200 bg-white"
    >
      <Table.Header className="bg-gray-50">
        <Table.Row>
          <Table.ColumnHeaderCell className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
            Request Type
          </Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
            Submission Date
          </Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
            Status
          </Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
            Actions
          </Table.ColumnHeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {data.map((req) => (
          <Table.Row
            key={req.id}
            className="hover:bg-gray-100"
          >
            <Table.RowHeaderCell className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
              {req.type}
            </Table.RowHeaderCell>
            <Table.Cell className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
              {new Date(req.submissionDate).toLocaleDateString()}
            </Table.Cell>
            <Table.Cell className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
              {req.status}
            </Table.Cell>
            <Table.Cell className="px-4 py-2 whitespace-nowrap">
              <Button
                as="a"
                href={`/requests/${req.id}/edit`}
                variant="ghost"
                size="1"
                className="mr-2 px-2 py-1 text-blue-600 hover:text-blue-800"
              >
                Edit
              </Button>
              <Button
                as="a"
                href={`/requests/${req.id}`}
                variant="ghost"
                size="1"
                className="px-2 py-1 text-green-600 hover:text-green-800"
              >
                View
              </Button>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>

    </FrontendLayout>
);

export default RequestsList;
