import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { SidebarLayout } from '@/components/ui/layouts/sidebar-layout';
import { Heading } from '@/components/ui/heading';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Divider } from '@/components/ui/divider';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Field, Label } from '@/components/ui/fieldset';
import { RequestSubscription, SubscriptionStats, PageProps } from '@/types';
import { PlusIcon, EyeIcon, TrashIcon, UsersIcon } from '@heroicons/react/16/solid';

interface AdminSubscriptionsIndexProps extends PageProps {
    subscriptions: {
        data: RequestSubscription[];
        links: any;
        meta: any;
    };
    stats: SubscriptionStats;
}

export default function AdminSubscriptionsIndex({ subscriptions, stats }: AdminSubscriptionsIndexProps) {
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [subscriptionToDelete, setSubscriptionToDelete] = useState<RequestSubscription | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        user_id: '',
        request_id: '',
    });

    const handleCreateSubscription = async () => {
        setIsSubmitting(true);

        try {
            const response = await fetch(route('admin.subscriptions.subscribe-user'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (data.success) {
                router.reload();
                setShowCreateDialog(false);
                setFormData({ user_id: '', request_id: '' });
            } else {
                console.error('Failed to create subscription:', data.message);
            }
        } catch (error) {
            console.error('Create subscription error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteSubscription = (subscription: RequestSubscription) => {
        setSubscriptionToDelete(subscription);
        setShowDeleteDialog(true);
    };

    const confirmDelete = async () => {
        if (!subscriptionToDelete) return;

        setIsSubmitting(true);

        try {
            const response = await fetch(route('admin.subscriptions.unsubscribe-user'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    user_id: subscriptionToDelete.user_id,
                    request_id: subscriptionToDelete.request_id,
                }),
            });

            const data = await response.json();

            if (data.success) {
                router.reload();
            } else {
                console.error('Failed to delete subscription:', data.message);
            }
        } catch (error) {
            console.error('Delete subscription error:', error);
        } finally {
            setIsSubmitting(false);
            setShowDeleteDialog(false);
            setSubscriptionToDelete(null);
        }
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
                <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
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
                                            User Created
                                        </dt>
                                        <dd className="text-lg font-medium text-gray-900">
                                            {stats.user_created_subscriptions}
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
                                            Unique Subscribers
                                        </dt>
                                        <dd className="text-lg font-medium text-gray-900">
                                            {stats.unique_subscribers}
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
                                        {subscription.subscribed_by_admin ? (
                                            <Badge color="purple">Admin Created</Badge>
                                        ) : (
                                            <Badge color="blue">User Created</Badge>
                                        )}
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
                                                href={route('admin.subscriptions.request-subscribers', subscription.request_id)}
                                            >
                                                <EyeIcon data-slot="icon" />
                                                View Request
                                            </Button>
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
                            <Field>
                                <Label>User ID</Label>
                                <Input
                                    type="number"
                                    value={formData.user_id}
                                    onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                                    placeholder="Enter user ID"
                                />
                            </Field>
                            <Field>
                                <Label>Request ID</Label>
                                <Input
                                    type="number"
                                    value={formData.request_id}
                                    onChange={(e) => setFormData({ ...formData, request_id: e.target.value })}
                                    placeholder="Enter request ID"
                                />
                            </Field>
                        </div>
                    </DialogBody>
                    <DialogActions>
                        <Button
                            plain
                            onClick={() => setShowCreateDialog(false)}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleCreateSubscription}
                            disabled={isSubmitting || !formData.user_id || !formData.request_id}
                        >
                            {isSubmitting ? 'Creating...' : 'Create Subscription'}
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
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            color="red"
                            onClick={confirmDelete}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Removing...' : 'Remove Subscription'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        </SidebarLayout>
    );
}
