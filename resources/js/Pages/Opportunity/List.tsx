// resources/js/Components/RequestsList.tsx
import React from 'react';
import { Head, Link } from '@inertiajs/react';
import FrontendLayout from '@/Layouts/FrontendLayout';
import { OCDOpportunity, OCDOpportunitiesList } from '@/types';
import { usePage } from '@inertiajs/react';
import { Auth, User } from '@/types';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import axios from 'axios';


export default function OpportunitiesList() {
    const opportunitiesList = usePage().props.opportunities as OCDOpportunitiesList;
    const { auth } = usePage<{ auth: Auth }>().props;
    const [opportunityList, setOpportunityList] = React.useState<OCDOpportunitiesList>(opportunitiesList);
    const statuses = [
        { value: '1', label: 'ACTIVE' },
        { value: '2', label: 'Closed' },
        { value: '3', label: 'Rejected' },
        { value: '4', label: 'Pending review' },
    ];

    const handleStatusChange = (id: string, status: string) => {
        axios.patch(route('partner.opportunity.status', id), { status })
            .then(res => {
                setOpportunityList(prev => prev.map(op =>
                    op.id === id
                        ? { ...op, status: res.data.status.status_code, status_label: res.data.status.status_label }
                        : op
                ));
            });
    };

    const handleDelete = (id: string) => {
        if (!confirm('Are you sure you want to delete this opportunity?')) {
            return;
        }
        axios.delete(route('partner.opportunity.destroy', id))
            .then(() => {
                setOpportunityList(prev => prev.filter(op => op.id !== id));
            });
    };
    const titleBodyTemplate = (rowData: OCDOpportunity) => rowData.title ?? 'N/A';
    const ApplicationClosingDate = (rowData: OCDOpportunity) => new Date(rowData.closing_date).toLocaleDateString();
    const statusBodyTemplate = (rowData: OCDOpportunity) => {
        const code = rowData.status
        const label = rowData.status_label

        let iconClass = '';
        let tagSeverity: 'success' | 'info' | 'warning' | 'danger' | undefined = undefined;
        let iconColor = '';

        switch (code) {
            case '1':
                iconClass = 'pi pi-file-edit';
                tagSeverity = 'info';
                iconColor = 'mr-1';
                break;
            case '2':
                iconClass = 'pi pi-clock';
                tagSeverity = 'info';
                iconColor = 'mr-1';
                break;
            case '3':
                iconClass = 'pi pi-check-circle';
                tagSeverity = 'danger';
                iconColor = 'mr-1';
                break;
            case '4':
                iconClass = 'pi pi-times-circle';
                tagSeverity = 'danger';
                iconColor = 'mr-1';
                break;
            default:
                iconClass = 'pi pi-info-circle';
                tagSeverity = undefined;
                iconColor = 'mr-1';
        }

        return (
            <Tag
                value={label}
                severity={tagSeverity}
                icon={<i className={`${iconClass} ${iconColor}`} />}
                className="cursor-default text-white"
                data-pr-tooltip={label}
            />
        );
    };

    const actionsTemplate = (rowData: OCDOpportunity) => (
        <div className="flex space-x-4 items-center">
            {rowData.can_edit && (
                <Link
                    href={route('opportunity.edit', rowData.id)}
                    className="px-2 py-1 text-base font-medium text-blue-600 hover:text-blue-800"
                >
                    <i className="pi pi-pencil mr-1" aria-hidden="true" />
                    Edit
                </Link>
            )}

            {rowData.can_edit && (
                <button
                    onClick={() => handleDelete(rowData.id)}
                    className="flex items-center text-red-600 hover:text-red-800"
                >
                    <i className="pi pi-trash mr-1" aria-hidden="true" />
                    Delete
                </button>
            )}

            <Link
                href={route('opportunity.show', rowData.id)}
                className="flex items-center text-green-600 hover:text-green-800"
            >
                <i className="pi pi-eye mr-1" aria-hidden="true" />
                View
            </Link>

            <select
                className="border rounded px-2 py-1"
                value={rowData.status}
                onChange={e => handleStatusChange(rowData.id, e.currentTarget.value)}
            >
                {statuses.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                ))}
            </select>

        </div>
    );

    return (
        <FrontendLayout>
            <Head title="Welcome" />
            <div className="overflow-x-auto">
                <div className='flex justify-between items-center mb-6'>
                    {auth.user.is_partner && (
                        <Link
                            href={route('partner.opportunity.create')}
                            className="px-4 text-xl py-2 bg-firefly-600 text-white rounded hover:bg-firefly-700"
                        >
                            Submit New Opportunity
                        </Link>
                    )}
                </div>
                <DataTable
                    value={opportunityList}
                    paginator
                    rows={10}
                    rowsPerPageOptions={[10, 25, 50, 100]}
                    showGridlines
                    emptyMessage="No Opportunities found."
                    className="p-datatable-sm .datatable-rows"
                >
                    <Column field="id" header="ID" sortable />
                    <Column body={titleBodyTemplate} header="Title" />
                    <Column field="type" header="Type" />
                    <Column field="created_at" body={ApplicationClosingDate} header="Application closing date" sortable />
                    <Column field="status.status_code" body={statusBodyTemplate} header="Status" sortable />
                    <Column field="coverage_activity" header="Coverage of CD Activity" sortable />
                    <Column field="implementation_location" header="Implementation location" sortable />
                    <Column body={actionsTemplate} header="Actions" />
                </DataTable>
            </div>
        </FrontendLayout>
    )
}