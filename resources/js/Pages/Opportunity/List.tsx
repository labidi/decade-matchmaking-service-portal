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


export default function OpportunitiesList() {
    const opportunitiesList = usePage().props.opportunities as OCDOpportunitiesList;
    const { auth } = usePage<{ auth: Auth }>().props;
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
                tagSeverity = 'success';
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
            {(rowData.can_edit) && (
                <Link
                    href="#"
                    className="px-2 py-1 text-base font-medium text-blue-600 hover:text-blue-800"
                >
                    Edit
                </Link>
            )}

            <Link
                href={route('user.request.show', rowData.id)}
                className="flex items-center text-green-600 hover:text-green-800"
            >
                <i className="pi pi-eye mr-1" aria-hidden="true" />
                View
            </Link>

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
                    value={opportunitiesList}
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