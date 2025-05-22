import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import FrontendLayout from '@/Layouts/FrontendLayout';
import DataTableDialog from '@/Components/Dialog/DataTableDialog';

const columnsCDF = [
  { key: 'id', label: 'Org name' },
  { key: 'name', label: 'Level Of Operation' },
  { key: 'status', label: 'Specific Countries/Regions' },
  { key: 'status', label: 'Link' },
];

const columnsOP = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Name' },
  { key: 'status', label: 'Status' },
];

const data = [
  { id: 1, name: 'Test', status: 'Test' },
  { id: 2, name: 'Beta', status: 'Pending' },
  // ...
];

export default function Welcome({
}: PageProps<{ laravelVersion: string; phpVersion: string }>) {
    return (
        <FrontendLayout>
            <Head title="Welcome" />
            <section id="features" className="py-20 px-4">
                <div className="max-w-6xl mx-auto text-center">
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="p-6 bg-gray-50 rounded-xl shadow">
                            <h4 className="text-xl font-semibold mb-2">
                                Click to view CDF Partners supporting capacity development through the Matchmaking Platform.
                                <DataTableDialog columns={columnsCDF} data={data} triggerLabel="Show Records" />
                            </h4>
                        </div>
                        <div className="p-6 bg-gray-50 rounded-xl shadow">
                            <h4 className="text-xl font-semibold mb-2">
                                Search across IOC platforms for available capacity development opportunities in one place.
                                <DataTableDialog columns={columnsOP} data={data} triggerLabel="Show Records" />
                            </h4>
                        </div>
                    </div>
                </div>
            </section>
        </FrontendLayout>
    );
}
