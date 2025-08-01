// resources/js/Components/RequestsList.tsx
import 'primeicons/primeicons.css';
import 'primereact/resources/primereact.min.css';
import 'primereact/resources/themes/saga-blue/theme.css';
import FrontendLayout from '@/components/ui/layouts/frontend-layout';
import React from 'react';
import axios from 'axios';
import {Auth, OCDOpportunity, OCDOpportunitiesList, OCDOpportunitiesListPageActions} from '@/types';
import {Column} from 'primereact/column';
import {DataTable} from 'primereact/datatable';
import {Head, Link, usePage} from '@inertiajs/react';
import {Tag} from 'primereact/tag';


export default function OpportunitiesList() {
    const page = usePage();
    const opportunitiesList = page.props.opportunities as OCDOpportunitiesList;
    const pageActions = page.props.pageActions as OCDOpportunitiesListPageActions;
    const locationData = (page.props.locationData as any) || {
        countries: [],
        regions: [],
        oceans: [],
        targetAudiences: []
    };

    const {auth} = page.props;
    const [opportunityList, setOpportunityList] = React.useState<OCDOpportunitiesList>(opportunitiesList);

    const statuses = [
        {value: '1', label: 'ACTIVE'},
        {value: '2', label: 'Closed'},
        {value: '3', label: 'Rejected'},
        {value: '4', label: 'Pending review'},
    ];

    const handleStatusChange = (id: string, status: string) => {
        axios.patch(route('partner.opportunity.status', id), {status})
            .then(res => {
                setOpportunityList(prev => prev.map(op =>
                    op.id === id
                        ? {...op, status: res.data.status.status_code, status_label: res.data.status.status_label}
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

    const ImplementationLocationTemplate = (rowData: OCDOpportunity) => {
        const implementationLocation = rowData.implementation_location;
        const coverageActivity = rowData.coverage_activity;

        if (!implementationLocation) {
            return 'N/A';
        }

        // Define the options based on coverage activity (same logic as Create form)
        let options: { value: string; label: string }[] = [];

        switch (coverageActivity) {
            case 'country':
                options = locationData.countries;
                break;
            case 'Regions':
                options = locationData.regions;
                break;
            case 'Ocean-based':
                options = locationData.oceans;
                break;
            case 'Global':
                options = [{value: 'Global', label: 'Global'}];
                break;
            default:
                return implementationLocation; // Return as-is if no matching coverage activity
        }

        // Find the matching option and return the label
        const option = options.find(opt => opt.value === implementationLocation);
        return option ? option.label : implementationLocation;
    };
    const statusBodyTemplate = (rowData: OCDOpportunity) => {
        const code = rowData.status
        const label = rowData.status_label

        let iconClass = '';
        let tagSeverity: 'success' | 'info' | 'warning' | 'danger' | undefined = undefined;
        let iconColor = '';
        console.log(code);
        switch (code) {
            case 1:
                iconClass = 'pi pi-file-edit';
                tagSeverity = 'success';
                iconColor = 'mr-1';
                break;
            case 2:
                iconClass = 'pi pi-clock';
                tagSeverity = 'info';
                iconColor = 'mr-1';
                break;
            case 3:
                iconClass = 'pi pi-check-circle';
                tagSeverity = 'danger';
                iconColor = 'mr-1';
                break;
            case 4:
                iconClass = 'pi pi-times-circle';
                tagSeverity = 'info';
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
                icon={<i className={`${iconClass} ${iconColor}`}/>}
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
                    <i className="pi pi-pencil mr-1" aria-hidden="true"/>
                    Edit
                </Link>
            )}
            {pageActions.canDelete && (
                <button
                    onClick={() => handleDelete(rowData.id)}
                    className="flex items-center text-red-600 hover:text-red-800"
                >
                    <i className="pi pi-trash mr-1" aria-hidden="true"/>
                    Delete
                </button>
            )}

            {pageActions.canChangeStatus && (
                <button
                    onClick={() => handleDelete(rowData.id)}
                    className="flex items-center text-red-600 hover:text-red-800"
                >
                    <i className="pi pi-trash mr-1" aria-hidden="true"/>
                    Delete
                </button>
            )}

            <Link
                href={route('opportunity.show', rowData.id)}
                className="flex items-center text-green-600 hover:text-green-800"
            >
                <i className="pi pi-eye mr-1" aria-hidden="true"/>
                View
            </Link>
            {pageActions.canChangeStatus && (
                <select
                    className="border rounded px-2 py-1"
                    value={rowData.status}
                    onChange={e => handleStatusChange(rowData.id, e.currentTarget.value)}
                >
                    {statuses.map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                </select>
            )}
        </div>
    );

    return (
        <FrontendLayout>
            <Head title="Welcome"/>
            <div className="overflow-x-auto">
                <div className='flex justify-between items-center mb-6'>
                    {auth.user.is_partner && pageActions.canSubmitNew && (
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
                    <Column field="id" header="ID" sortable/>
                    <Column body={titleBodyTemplate} header="Title"/>
                    <Column field="type_label" header="Type"/>
                    <Column field="created_at" body={ApplicationClosingDate} header="Application closing date"
                            sortable/>
                    <Column field="status.status_code" body={statusBodyTemplate} header="Status" sortable/>
                    <Column field="coverage_activity" header="Coverage of CD Activity" sortable/>
                    <Column body={ImplementationLocationTemplate} header="Implementation location" sortable/>
                    <Column body={actionsTemplate} header="Actions"/>
                </DataTable>
            </div>
        </FrontendLayout>
    )
}
