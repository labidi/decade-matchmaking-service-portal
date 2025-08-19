import React from 'react';
import { router } from '@inertiajs/react';
import { Dialog, DialogBody, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { OCDRequest } from '@/types';
import { EyeIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/16/solid';

interface RequestDetailsDialogProps {
    isOpen: boolean;
    onClose: () => void;
    request: OCDRequest | null;
}

export function RequestDetailsDialog({
    isOpen,
    onClose,
    request
}: Readonly<RequestDetailsDialogProps>) {
    if (!request) {
        return null;
    }

    const handleViewFullDetails = () => {
        onClose();
        router.visit(route('admin.request.show', { id: request.id }));
    };

    return (
        <Dialog open={isOpen} onClose={onClose} size="4xl">
            <DialogTitle>Request Preview</DialogTitle>
            <DialogBody>
                <div className="space-y-6">
                    {/* Request Header */}
                    <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            {request.detail.capacity_development_title}
                        </h3>
                        <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                            <span>Submitted: {new Date(request.submissionDate).toLocaleDateString()}</span>
                            <span>Status: {request.status?.status_label}</span>
                            <span>By: {request.user?.name}</span>
                        </div>
                    </div>

                    {/* Request Details Preview */}
                    {request.detail && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Basic Information */}
                            <div>
                                <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-3">
                                    Basic Information
                                </h4>
                                <div className="space-y-2 text-sm">
                                    <div>
                                        <span className="font-medium text-gray-700 dark:text-gray-300">Contact:</span>
                                        <span className="ml-2 text-gray-600 dark:text-gray-400">
                                            {request.detail.first_name} {request.detail.last_name}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-700 dark:text-gray-300">Email:</span>
                                        <span className="ml-2 text-gray-600 dark:text-gray-400">
                                            {request.detail.email}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-700 dark:text-gray-300">Project Stage:</span>
                                        <span className="ml-2 text-gray-600 dark:text-gray-400">
                                            {request.detail.project_stage}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-700 dark:text-gray-300">Related Activity:</span>
                                        <span className="ml-2 text-gray-600 dark:text-gray-400">
                                            {request.detail.related_activity}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Support Details */}
                            <div>
                                <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-3">
                                    Support Details
                                </h4>
                                <div className="space-y-2 text-sm">
                                    <div>
                                        <span className="font-medium text-gray-700 dark:text-gray-300">Support Types:</span>
                                        <div className="mt-1">
                                            {request.detail.support_types?.length > 0 ? (
                                                <div className="flex flex-wrap gap-1">
                                                    {request.detail.support_types.map((type, index) => (
                                                        <span
                                                            key={index}
                                                            className="inline-block px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded"
                                                        >
                                                            {type}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-gray-500 dark:text-gray-400">None specified</span>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-700 dark:text-gray-300">Duration:</span>
                                        <span className="ml-2 text-gray-600 dark:text-gray-400">
                                            {request.detail.support_months} months
                                        </span>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-700 dark:text-gray-300">Completion Date:</span>
                                        <span className="ml-2 text-gray-600 dark:text-gray-400">
                                            {request.detail.completion_date}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Gap Description */}
                    {request.detail?.gap_description && (
                        <div>
                            <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-2">
                                Gap Description
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                                {request.detail.gap_description.length > 200
                                    ? `${request.detail.gap_description.substring(0, 200)}...`
                                    : request.detail.gap_description
                                }
                            </p>
                        </div>
                    )}

                    {/* Subthemes */}
                    {request.detail?.subthemes && request.detail.subthemes.length > 0 && (
                        <div>
                            <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-2">
                                Subthemes
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {request.detail.subthemes.map((theme, index) => (
                                    <span
                                        key={index}
                                        className="inline-block px-3 py-1 text-sm bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-full"
                                    >
                                        {theme}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Offers Count */}
                    {request.offers && (
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Offers Received:
                                </span>
                                <span className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                                    {request.offers.length}
                                </span>
                            </div>
                            {request.active_offer && (
                                <div className="mt-2 text-sm text-green-600 dark:text-green-400">
                                    ✓ Has active offer
                                </div>
                            )}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <Button
                            type="button"
                            outline
                            onClick={onClose}
                        >
                            Close
                        </Button>
                        <Button
                            type="button"
                            onClick={handleViewFullDetails}
                        >
                            <EyeIcon data-slot="icon" />
                            View Full Details
                            <ArrowTopRightOnSquareIcon data-slot="icon" />
                        </Button>
                    </div>
                </div>
            </DialogBody>
        </Dialog>
    );
}
