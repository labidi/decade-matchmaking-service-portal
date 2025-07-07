import React, {useState} from 'react';
import {Head, Link} from '@inertiajs/react';
import BackendLayout from '@/Layouts/BackendLayout';
import {OCDRequest, OCDRequestList, OCDRequestGrid} from '@/types';
import {usePage} from '@inertiajs/react';
import {DataTable} from 'primereact/datatable';
import {Column} from 'primereact/column';
import {Tag} from 'primereact/tag';
import {FilterMatchMode, FilterOperator} from 'primereact/api';
import {InputText} from 'primereact/inputtext';
import {Button} from 'primereact/button';
import {Dropdown} from 'primereact/dropdown';
import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import axios from 'axios';
import XHRAlertDialog from "@/Components/Dialogs/XHRAlertDialog";
import OffersDialog from "@/Components/Dialogs/OffersDialog";
import { useOffersDialog } from "@/hooks/useOffersDialog";

export default function List() {
    const requests = usePage().props.requests as OCDRequestList;
    console.log('Requests:', requests);
    const [requestList, setRequestList] = React.useState<OCDRequestList>(requests);
    const [filters, setFilters] = useState({
        global: {value: null, matchMode: FilterMatchMode.CONTAINS},
        'request_data.capacity_development_title': {value: null, matchMode: FilterMatchMode.CONTAINS},
        'status.status_code': {value: null, matchMode: FilterMatchMode.EQUALS},
        'user.name': {value: null, matchMode: FilterMatchMode.CONTAINS},
    } as any);

    const [expressInterestDialog, setExpressInterestDialog] = useState(false);
    const { offersDialogVisible, selectedRequest, openOffersDialog, closeOffersDialog } = useOffersDialog();

    const statuses = [
        {label: 'All Statuses', value: null},
        {label: 'Draft', value: 'draft'},
        {label: 'Under Review', value: 'under_review'},
        {label: 'Validated', value: 'validated'},
        {label: 'Offer Made', value: 'offer_made'},
        {label: 'In Implementation', value: 'in_implementation'},
        {label: 'Rejected', value: 'rejected'},
        {label: 'Unmatched', value: 'unmatched'},
        {label: 'Closed', value: 'closed'},
    ];

    const handleStatusChange = (id: string, status: string) => {
        axios.patch(route('user.request.status', id), {status})
            .then(res => {
                setRequestList(prev => prev.map(req =>
                    req.id === id
                        ? {...req, status: {...req.status, ...res.data.status}}
                        : req
                ));
            });
    };

    const handleDelete = (id: string) => {
        if (!confirm('Are you sure you want to delete this request?')) {
            return;
        }
        axios.delete(route('user.request.destroy', id))
            .then(() => {
                setRequestList(prev => prev.filter(req => req.id !== id));
            });
    };

    const titleBodyTemplate = (rowData: OCDRequest) => (
        <div className="font-medium text-gray-900">
            {rowData.request_data.capacity_development_title ?? 'N/A'}
        </div>
    );

    const submitterBodyTemplate = (rowData: OCDRequest) => (
        <div className="text-gray-700">
            {rowData.user?.name ?? 'N/A'}
        </div>
    );

    const submissionDateTemplate = (rowData: OCDRequest) => (
        <div className="text-gray-600">
            {new Date(rowData.created_at).toLocaleDateString()}
        </div>
    );

    const statusBodyTemplate = (rowData: OCDRequest) => {
        const code = rowData.status.status_code;
        const label = rowData.status.status_label;

        let severity: 'success' | 'info' | 'warning' | 'danger' | undefined = undefined;
        let icon = 'pi pi-info-circle';

        switch (code) {
            case 'draft':
                severity = 'warning';
                icon = 'pi pi-file-edit';
                break;
            case 'under_review':
                severity = 'info';
                icon = 'pi pi-clock';
                break;
            case 'validated':
                severity = 'success';
                icon = 'pi pi-check-circle';
                break;
            case 'offer_made':
                severity = 'info';
                icon = 'pi pi-briefcase';
                break;
            case 'in_implementation':
                severity = 'success';
                icon = 'pi pi-rocket';
                break;
            case 'rejected':
            case 'unmatched':
                severity = 'danger';
                icon = 'pi pi-times-circle';
                break;
            case 'closed':
                severity = undefined;
                icon = 'pi pi-lock';
                break;
        }

        return (
            <Tag
                value={label}
                severity={severity}
                icon={<i className={icon}/>}
                className="cursor-default"
            />
        );
    };

    const actionsBodyTemplate = (rowData: OCDRequest) => (
        <div className="flex space-x-2">
            <Link
                href={'#'}
                className="p-button p-button-sm p-button-outlined p-button-primary"
            >
                <i className="pi pi-eye mr-1"></i>
                View
            </Link>
            <Button
                icon="pi pi-briefcase"
                size="small"
                outlined
                onClick={() => openOffersDialog(rowData)}
                tooltip="View Offers"
            />
            <Button
                icon="pi pi-trash"
                severity="danger"
                size="small"
                outlined
                onClick={() => handleDelete(rowData.id)}
                tooltip="Delete Request"
            />
            <select
                className="border rounded px-2 py-1"
                value={rowData.status.status_code}
                onChange={e => handleStatusChange(rowData.id, e.currentTarget.value)}
            >
                {statuses.map(s => (
                    <option key={s.label} value={s.value || ''}>{s.label.replace(/_/g, ' ')}</option>
                ))}
            </select>
        </div>
    );

    const statusFilterTemplate = () => {
        return (
            <Dropdown
                value={filters['status.status_code'].value}
                options={statuses}
                onChange={(e) => setFilters({
                    ...filters,
                    'status.status_code': {value: e.value, matchMode: FilterMatchMode.EQUALS}
                })}
                placeholder="Select Status"
                className="p-inputtext-sm"
                showClear
            />
        );
    };

    return (
        <BackendLayout>
            <Head title="Admin Requests List"/>
            <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">Requests Management</h2>
                    <p className="text-sm text-gray-600 mt-1">Manage and monitor all requests in the system</p>
                </div>
                <div className="p-6">
                    <DataTable
                        value={requestList}
                        filters={filters}
                        globalFilterFields={['id', 'request_data.capacity_development_title', 'user.name', 'status.status_code']}
                        paginator
                        rows={10}
                        rowsPerPageOptions={[10, 25, 50, 100]}
                        showGridlines
                        emptyMessage="No requests found."
                        className="p-datatable-sm"
                        filterDisplay="menu"
                        scrollable
                        stripedRows
                    >
                        <Column
                            field="id"
                            header="ID"
                            sortable
                            style={{width: '80px'}}
                            className="text-center"
                        />
                        <Column
                            field="request_data.capacity_development_title"
                            header="Title"
                            body={titleBodyTemplate}
                            sortable
                            filter
                            filterPlaceholder="Search by title..."
                            style={{minWidth: '200px'}}
                        />
                        <Column
                            field="user.name"
                            header="Submitted By"
                            body={submitterBodyTemplate}
                            sortable
                            filter
                            filterPlaceholder="Search by submitter..."
                            style={{minWidth: '150px'}}
                        />
                        <Column
                            field="created_at"
                            header="Submission Date"
                            body={submissionDateTemplate}
                            sortable
                            style={{width: '150px'}}
                        />
                        <Column
                            field="status.status_code"
                            header="Status"
                            body={statusBodyTemplate}
                            sortable
                            filter
                            filterElement={statusFilterTemplate}
                            style={{width: '180px'}}
                        />
                        <Column
                            header="Actions"
                            body={actionsBodyTemplate}
                            style={{width: '150px'}}
                            className="text-center"
                        />
                    </DataTable>
                </div>
            </div>

            {/* Offers Dialog */}
            {selectedRequest && (
                <OffersDialog
                    visible={offersDialogVisible}
                    onHide={closeOffersDialog}
                    requestId={selectedRequest.id}
                    requestTitle={selectedRequest.request_data.capacity_development_title || 'Untitled Request'}
                />
            )}
        </BackendLayout>
    );
}
