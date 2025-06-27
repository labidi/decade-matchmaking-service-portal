import React, {useState} from 'react';
import {Head, Link} from '@inertiajs/react';
import FrontendLayout from '@/Layouts/FrontendLayout';
import {OCDRequest, OCDRequestList, OCDRequestGrid} from '@/types';
import {usePage} from '@inertiajs/react';
import {DataTable} from 'primereact/datatable';
import {Column} from 'primereact/column';
import {Tag} from 'primereact/tag';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import axios from 'axios';
import XHRAlertDialog from "@/Components/Dialog/XHRAlertDialog";

export default function RequestsList() {
    const requests = usePage().props.requests as OCDRequestList;
    const grid = usePage().props.grid as OCDRequestGrid;
    const [requestList, setRequestList] = React.useState<OCDRequestList>(requests);

    const [expressInterestDialog, setExpressInterestDialog] = useState(false);

    const statuses = [
        'draft',
        'under_review',
        'validated',
        'offer_made',
        'in_implementation',
        'rejected',
        'unmatched',
        'closed',
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
    const titleBodyTemplate = (rowData: OCDRequest) => rowData.request_data.capacity_development_title ?? 'N/A';
    const submissionDateTemplate = (rowData: OCDRequest) => new Date(rowData.created_at).toLocaleDateString();

    const actionsTemplate = (rowData: OCDRequest) => (
        <div className="flex space-x-4 items-center">
            {grid.actions.canEdit && rowData.status.status_code === 'draft' && (
                <Link
                    href={route('user.request.edit', rowData.id)}
                    className="flex items-center text-blue-600 hover:text-blue-800"
                >
                    <i className="pi pi-pencil mr-1" aria-hidden="true"/>
                    Edit
                </Link>
            )}
            {grid.actions.canDelete && rowData.status.status_code === 'draft' && (
                <button
                    onClick={() => handleDelete(rowData.id)}
                    className="flex items-center text-red-600 hover:text-red-800"
                >
                    <i className="pi pi-trash mr-1" aria-hidden="true"/>
                    Delete
                </button>
            )}
            {grid.actions.canView && (
                <Link
                    href={route('user.request.show', rowData.id)}
                    className="flex items-center text-green-600 hover:text-green-800"
                >
                    <i className="pi pi-eye mr-1" aria-hidden="true"/>
                    View
                </Link>
            )}
            {grid.actions.canPreview && (
                <Link
                    href={route('request.preview', rowData.id)}
                    className="flex items-center text-green-600 hover:text-green-800"
                >
                    <i className="pi pi-eye mr-1" aria-hidden="true"/>
                    Preview
                </Link>
            )}
            {grid.actions.canExpressInterest && (
                <>
                    <span
                       onClick={() => setExpressInterestDialog(true)}
                       className="flex items-center text-green-700 hover:text-green-800"
                    >
                        <i className="pi pi-star-fill mr-1" aria-hidden="true"/>
                        Express interest
                    </span>
                </>
            )}
            {grid.actions.canChangeStatus && (
                <select
                    className="border rounded px-2 py-1"
                    value={rowData.status.status_code}
                    onChange={e => handleStatusChange(rowData.id, e.currentTarget.value)}
                >
                    {statuses.map(s => (
                        <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                    ))}
                </select>
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
            case 'unmatched':
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
                icon={<i className={`${iconClass} ${iconColor}`}/>}
                className="cursor-default text-white"
                data-pr-tooltip={label}
            />
        );
    };

    return (
        <FrontendLayout>
            <Head title="Welcome"/>
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
                    value={requestList}
                    paginator
                    rows={10}
                    rowsPerPageOptions={[10, 25, 50, 100]}
                    showGridlines
                    emptyMessage="No requests found."
                    className="p-datatable-sm .datatable-rows"
                >
                    <Column field="id" header="ID" sortable/>
                    <Column body={titleBodyTemplate} header="Title"/>
                    <Column field="created_at" body={submissionDateTemplate} header="Submission Date" sortable/>
                    <Column field="status.status_code" body={statusBodyTemplate} header="Status" sortable/>
                    <Column body={actionsTemplate} header="Actions"/>
                </DataTable>
            </div>
            <XHRAlertDialog
                open={expressInterestDialog}
                onOpenChange={setExpressInterestDialog}
                type="info"
                message="This message confirms your interest in delivering services for this request. The CDF Secretariat will follow up within three business days."
            />
        </FrontendLayout>
    );
}
