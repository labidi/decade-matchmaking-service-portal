import React from 'react';
import { Head, Link } from '@inertiajs/react';
import FrontendLayout from '@/Layouts/FrontendLayout';
import { OCDRequest, OCDRequestList, OCDRequestGrid } from '@/types';
import { usePage } from '@inertiajs/react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

export default function RequestsList() {
    const requests = usePage().props.requests as OCDRequestList;
    const grid = usePage().props.grid as OCDRequestGrid;
    const titleBodyTemplate = (rowData: OCDRequest) => rowData.request_data.capacity_development_title ?? 'N/A';
    const submissionDateTemplate = (rowData: OCDRequest) => new Date(rowData.created_at).toLocaleDateString();

    const actionsTemplate = (rowData: OCDRequest) => (
        <div className="flex space-x-4">
            {grid.actions.canEdit && rowData.status.status_code === 'draft' && (
                <Link
                    href={route('user.request.edit', rowData.id)}
                    className="flex items-center text-blue-600 hover:text-blue-800"
                >
                    <i className="pi pi-pencil mr-1" aria-hidden="true" />
                    Edit
                </Link>
            )}
            {grid.actions.canView && (
                <Link
                    href={route('user.request.show', rowData.id)}
                    className="flex items-center text-green-600 hover:text-green-800"
                >
                    <i className="pi pi-eye mr-1" aria-hidden="true" />
                    View
                </Link>
            )}
            {grid.actions.canExpressInterrest && (
                <Link
                    href={route('user.request.show', rowData.id)}
                    className="flex items-center text-green-700 hover:text-green-800"
                >
                    <i className="pi pi-star-fill mr-1" aria-hidden="true" />
                    Express interrest
                </Link>
            )}
        </div>
    );

    const statusBodyTemplate = (rowData: OCDRequest) => {
        const code = rowData.status.status_code;
        const label = rowData.status.status_label;

        let iconClass = '';
        let tagSeverity: 'success' | 'info' | 'warning' | 'danger' | undefined = undefined;
        let iconColor = '';

        switch (code) {
            case 'draft':
                iconClass = 'pi pi-file-edit';
                tagSeverity = 'warning';
                iconColor = 'mr-1';
                break;
            case 'under_review':
                iconClass = 'pi pi-clock';
                tagSeverity = 'info';
                iconColor = 'mr-1';
                break;
            case 'validated':
                iconClass = 'pi pi-check-circle';
                tagSeverity = 'success';
                iconColor = 'mr-1';
                break;
            case 'rejected':
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

    return (
        <FrontendLayout>
            <Head title="Welcome" />
            <div>
                {grid.actions.canCreate && (
                    <div className='flex justify-between items-center mb-6'>
                        <Link
                            href={route('user.request.create')}
                            className="px-4 py-2 text-xl bg-firefly-600 text-white rounded hover:bg-firefly-700"
                        >
                            Create new request
                        </Link>
                    </div>
                )}

                <DataTable
                    value={requests}
                    paginator
                    rows={10}
                    rowsPerPageOptions={[10, 25, 50, 100]}
                    showGridlines
                    emptyMessage="No requests found."
                    className="p-datatable-sm .datatable-rows"
                >
                    <Column field="id" header="ID" sortable />
                    <Column body={titleBodyTemplate} header="Title" />
                    <Column field="created_at" body={submissionDateTemplate} header="Submission Date" sortable />
                    <Column field="status.status_code" body={statusBodyTemplate} header="Status" sortable />
                    <Column body={actionsTemplate} header="Actions" />
                </DataTable>
            </div>
        </FrontendLayout>
    );
}