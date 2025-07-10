import {Head, usePage, useForm} from '@inertiajs/react';
import type {Auth, Document} from '@/types';
import {AttachmentsProps} from '@/types';
import React, {useState} from 'react';
import axios from 'axios';

export default function AttachmentsSection({OcdRequest, canEdit = false, documents = []}: AttachmentsProps) {
    const {auth} = usePage<{ auth: Auth }>().props
    const [documentList, setDocumentList] = useState<Document[]>(documents);
    const form = useForm<{ file: File | null; document_type: string }>({
        file: null,
        document_type: 'financial_breakdown_report',
    });
    const handleDelete = (id: number) => {
        axios.delete(route('user.document.destroy', id)).then(() => {
            setDocumentList(prev => prev.filter(d => d.id !== id));
        });
    };
    return (
        <section id="attachements" className='my-8'>
            <div className="grid grid-cols-1">
                <div>
                    <h1 className="border-b-2 border-black-500 pb-4 text-2xl font-semibold tracking-tight text-pretty text-firefly-900 sm:text-3xl">
                        Attachments
                    </h1>
                </div>
            </div>
            <div className="grid grid-cols-1">
                {['in_implementation'].includes(OcdRequest.status.status_code) && (
                    <form
                        onSubmit={e => {
                            e.preventDefault();
                            form.post(route('user.request.document.store', {request: OcdRequest.id}), {
                                forceFormData: true,
                                onSuccess: () => form.reset(),
                            });
                        }}
                    >
                        <div className="flex space-x-4 items-end">
                            <select
                                className="border rounded px-2 py-1"
                                value={form.data.document_type}
                                onChange={e => form.setData('document_type', e.currentTarget.value)}
                            >
                                <option value="financial_breakdown_report">Financial Breakdown Report</option>
                                <option value="lesson_learned_report">Lesson Learned Report</option>
                                <option value="offer_document">Offer Document</option>
                            </select>
                            <input
                                type="file"
                                className="border rounded px-2 py-1"
                                onChange={e => form.setData('file', e.currentTarget.files ? e.currentTarget.files[0] : null)}
                            />
                            <button
                                type="submit"
                                className="px-4 py-1 bg-firefly-600 text-white rounded disabled:opacity-50"
                                disabled={form.processing || !form.data.file}
                            >
                                Upload
                            </button>
                        </div>
                    </form>
                )}

                {documentList.length > 0 && (
                    <table className="mt-4 w-full text-left border">
                        <thead>
                        <tr className="bg-gray-100">
                            <th className="p-2">Name</th>
                            <th className="p-2">Type</th>
                            <th className="p-2">Uploaded At</th>
                            <th className="p-2">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {documentList.map(doc => (
                            <tr key={doc.id} className="border-t">
                                <td className="p-2">
                                    {doc.name}
                                </td>
                                <td className="p-2">{doc.document_type}</td>
                                <td className="p-2">{new Date(doc.created_at).toLocaleDateString()}</td>
                                <td className="p-2 space-x-2">
                                    <a href={route('user.document.download', doc.id)}
                                       className="text-blue-600 underline">Download</a>
                                    {doc.uploader_id === auth.user.id && canEdit && (
                                    <button type="button" onClick={() => handleDelete(doc.id)}
                                            className="text-red-600 underline">Delete
                                    </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </div>
        </section>

    );
}
