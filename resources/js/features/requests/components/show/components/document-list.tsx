import React from 'react';
import { Document } from '@/types';
import { Button } from '@ui/primitives/button';
import { Badge } from '@ui/primitives/badge';
import { TrashIcon, ArrowDownTrayIcon } from '@heroicons/react/16/solid';

interface DocumentListProps {
    documents: Document[];
    currentUserId: number;
    onDelete: (documentId: number) => void;
    isDeleting?: boolean;
}

export function DocumentList({ documents, currentUserId, onDelete, isDeleting = false }: DocumentListProps) {
    if (documents.length === 0) {
        return (
            <div className="text-center py-8 px-4 bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-blue-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">No documents uploaded yet.</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {documents.map((document) => (
                <div
                    key={document.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 border border-blue-200 dark:border-blue-700 rounded-lg bg-white dark:bg-gray-800"
                >
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{document.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Uploaded {new Date(document.created_at).toLocaleDateString()}
                        </p>
                        {document.document_type && (
                            <Badge color="blue" className="mt-2">
                                {document.document_type.replace(/_/g, ' ').toUpperCase()}
                            </Badge>
                        )}
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Button
                            outline
                            href={route('user.document.download', document.id)}
                            target="_blank"
                            className="flex-1 sm:flex-initial"
                        >
                            <ArrowDownTrayIcon data-slot="icon" />
                            Download
                        </Button>

                        {document.uploader_id === currentUserId && (
                            <Button
                                outline
                                onClick={() => onDelete(document.id)}
                                disabled={isDeleting}
                                className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                aria-label="Delete document"
                            >
                                <TrashIcon data-slot="icon" />
                            </Button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
