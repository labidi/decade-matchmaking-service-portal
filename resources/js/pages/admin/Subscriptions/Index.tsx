import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { SidebarLayout } from '@layouts/index';
import { Heading } from '@ui/primitives/heading';
import { Button } from '@ui/primitives/button';
import { Text } from '@ui/primitives/text';
import { Divider } from '@ui/primitives/divider';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@ui/primitives/table';
import { Badge } from '@ui/primitives/badge';
import { Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle } from '@ui/primitives/dialog';
import { RequestSubscription, SubscriptionStats, PageProps } from '@/types';
import { PlusIcon, EyeIcon, TrashIcon, UsersIcon } from '@heroicons/react/16/solid';
import { subscribeFormFields } from '@features/subscriptions/config';
import { useSubscribeForm } from '@features/subscriptions';
import { FieldRenderer } from '@ui/organisms/forms';

interface AdminSubscriptionsIndexProps extends PageProps {
    subscriptions: {
        data: RequestSubscription[];
        links: any;
        meta: any;
    };
    stats: SubscriptionStats;
    users: Array<{ value: number; label: string }>;
    requests: Array<{ value: number; label: string }>;
}

export default function AdminSubscriptionsIndex({ subscriptions, stats, users, requests }: AdminSubscriptionsIndexProps) {
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [subscriptionToDelete, setSubscriptionToDelete] = useState<RequestSubscription | null>(null);

    // Use the new form hook
    const subscribeForm = useSubscribeForm({
        onSuccess: () => {
            router.reload();
            setShowCreateDialog(false);
        }
    });

    // Merge options into form fields
    const formFieldsWithOptions = {
        ...subscribeFormFields[0].fields,
        user_id: {
            ...subscribeFormFields[0].fields.user_id,
            options: users
        },
        request_id: {
            ...subscribeFormFields[0].fields.request_id,
            options: requests
        }
    };

    const handleDeleteSubscription = (subscription: RequestSubscription) => {
        setSubscriptionToDelete(subscription);
        setShowDeleteDialog(true);
    };

    const confirmDelete = () => {
        if (!subscriptionToDelete) return;

        // Use Inertia's router.post - handles CSRF automatically
        router.post(route('admin.subscriptions.unsubscribe-user'), {
            user_id: subscriptionToDelete.user_id,
            request_id: subscriptionToDelete.request_id,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setShowDeleteDialog(false);
                setSubscriptionToDelete(null);
            },
        });
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <SidebarLayout>
            <Head title="Subscription Management" />

            <div className="px-4 py-8 sm:px-6 lg:px-8">
                <div className="sm:flex sm:items-center">
                    <div className="sm:flex-auto">
                        <Heading>Subscription Management</Heading>
                        <Text className="mt-2">
                            Manage user subscriptions to capacity development requests.
                        </Text>
                    </div>
                    <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                        <Button onClick={() => setShowCreateDialog(true)}>
                            <PlusIcon data-slot="icon" />
                            Subscribe User
                        </Button>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <UsersIcon className="h-6 w-6 text-gray-400" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">
                                            Total Subscriptions
                                        </dt>
                                        <dd className="text-lg font-medium text-gray-900">
                                            {stats.total_subscriptions}
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">
                                            Admin Created
                                        </dt>
                                        <dd className="text-lg font-medium text-gray-900">
                                            {stats.admin_created_subscriptions}
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">
                                            Subscribed Requests
                                        </dt>
                                        <dd className="text-lg font-medium text-gray-900">
                                            {stats.unique_subscribed_requests}
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <Divider className="my-8" />

                {/* Subscriptions Table */}
                <div className="mt-8">
                    <Table className="[--gutter:--spacing(6)] sm:[--gutter:--spacing(8)]">
                        <TableHead>
                            <TableRow>
                                <TableHeader>User</TableHeader>
                                <TableHeader>Request</TableHeader>
                                <TableHeader>Type</TableHeader>
                                <TableHeader>Created</TableHeader>
                                <TableHeader>Admin User</TableHeader>
                                <TableHeader className="text-right">Actions</TableHeader>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {subscriptions.data.map((subscription) => (
                                <TableRow key={subscription.id}>
                                    <TableCell>
                                        <div>
                                            <Text className="font-medium text-gray-900">
                                                {subscription.user?.name || 'Unknown User'}
                                            </Text>
                                            <Text className="text-sm text-gray-500">
                                                {subscription.user?.email}
                                            </Text>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <Text className="font-medium text-gray-900">
                                                {subscription.request?.detail.capacity_development_title || `Request #${subscription.request_id}`}
                                            </Text>
                                            <Text className="text-sm text-gray-500">
                                                {subscription.request?.user?.name || 'Unknown Requester'}
                                            </Text>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Text className="text-sm text-gray-900">
                                            {formatDate(subscription.created_at)}
                                        </Text>
                                    </TableCell>
                                    <TableCell>
                                        {subscription.admin_user ? (
                                            <Text className="text-sm text-gray-900">
                                                {subscription.admin_user.name}
                                            </Text>
                                        ) : (
                                            <Text className="text-sm text-gray-500">-</Text>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                color="red"
                                                onClick={() => handleDeleteSubscription(subscription)}
                                            >
                                                <TrashIcon data-slot="icon" />
                                                Remove
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {/* Create Subscription Dialog */}
                <Dialog open={showCreateDialog} onClose={() => setShowCreateDialog(false)}>
                    <DialogTitle>Subscribe User to Request</DialogTitle>
                    <DialogDescription>
                        Subscribe a user to receive updates about a specific capacity development request.
                    </DialogDescription>
                    <DialogBody>
                        <div className="space-y-4">
                            {Object.entries(formFieldsWithOptions).map(([name, field]) => (
                                <FieldRenderer
                                    key={name}
                                    name={name}
                                    field={field}
                                    value={subscribeForm.form.data[name as keyof typeof subscribeForm.form.data]}
                                    error={subscribeForm.form.errors[name as keyof typeof subscribeForm.form.errors]}
                                    onChange={subscribeForm.handleFieldChange}
                                    formData={subscribeForm.form.data}
                                />
                            ))}
                            {(subscribeForm.form.errors as any).general && (
                                <Text className="text-red-600 text-sm">
                                    {(subscribeForm.form.errors as any).general}
                                </Text>
                            )}
                        </div>
                    </DialogBody>
                    <DialogActions>
                        <Button
                            plain
                            onClick={() => {
                                setShowCreateDialog(false);
                                subscribeForm.form.reset();
                            }}
                            disabled={subscribeForm.form.processing}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={subscribeForm.handleSubmit}
                            disabled={subscribeForm.form.processing || !subscribeForm.form.data.user_id || !subscribeForm.form.data.request_id}
                        >
                            {subscribeForm.form.processing ? 'Creating...' : 'Create Subscription'}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Delete Confirmation Dialog */}
                <Dialog open={showDeleteDialog} onClose={() => setShowDeleteDialog(false)}>
                    <DialogTitle>Remove Subscription</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to remove this subscription? The user will no longer receive updates about this request.
                    </DialogDescription>
                    <DialogBody>
                        {subscriptionToDelete && (
                            <div className="space-y-2">
                                <Text>
                                    <strong>User:</strong> {subscriptionToDelete.user?.name}
                                </Text>
                                <Text>
                                    <strong>Request:</strong> {subscriptionToDelete.request?.detail.capacity_development_title || `Request #${subscriptionToDelete.request_id}`}
                                </Text>
                            </div>
                        )}
                    </DialogBody>
                    <DialogActions>
                        <Button
                            plain
                            onClick={() => setShowDeleteDialog(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            color="red"
                            onClick={confirmDelete}
                        >
                            Remove Subscription
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        </SidebarLayout>
    );
}
