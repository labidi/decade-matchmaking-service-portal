import { useForm } from '@inertiajs/react';
import { OfferProps } from '@/types';

export default function OfferSection({ OcdRequest, offers }: OfferProps) {
    const form = useForm<{ description: string; partner_id: string; file: File | null }>({
        description: '',
        partner_id: '',
        file: null,
    });
    return (
        <section id="attachements">
            <div className="grid grid-cols-1">
                <div>
                    <h1 className="border-b-2 border-black-500 pb-4 text-2xl font-semibold tracking-tight text-pretty text-firefly-900 sm:text-3xl">
                        Offer
                    </h1>
                </div>
            </div>
            <div className="grid grid-cols-1">
                <form
                    onSubmit={e => {
                        e.preventDefault();
                        form.post(route('partner.request.offer.store', { request: OcdRequest.id }), {
                            forceFormData: true,
                            onSuccess: () => form.reset(),
                        });
                    }}
                >
                    <div className="flex flex-col space-y-2">
                        <input
                            type="text"
                            className="border rounded px-2 py-1"
                            placeholder="Partner ID"
                            value={form.data.partner_id}
                            onChange={e => form.setData('partner_id', e.currentTarget.value)}
                        />
                        <textarea
                            className="border rounded px-2 py-1"
                            placeholder="Description"
                            value={form.data.description}
                            onChange={e => form.setData('description', e.currentTarget.value)}
                        />
                        <input
                            type="file"
                            accept="application/pdf"
                            className="border rounded px-2 py-1"
                            onChange={e => form.setData('file', e.currentTarget.files ? e.currentTarget.files[0] : null)}
                        />
                        <button
                            type="submit"
                            className="px-4 py-1 bg-firefly-600 text-white rounded disabled:opacity-50"
                            disabled={form.processing || !form.data.file || !form.data.partner_id}
                        >
                            Submit Offer
                        </button>
                    </div>
                </form>

                {offers.length > 0 && (
                    <table className="mt-4 w-full text-left border">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="p-2">Description</th>
                                <th className="p-2">Partner</th>
                                <th className="p-2">File</th>
                                <th className="p-2">Submitted At</th>
                            </tr>
                        </thead>
                        <tbody>
                            {offers.map(offer => (
                                <tr key={offer.id} className="border-t">
                                    <td className="p-2">{offer.description}</td>
                                    <td className="p-2">{offer.matched_partner_id}</td>
                                    <td className="p-2">
                                        {offer.documents && offer.documents[0] && (
                                            <a href={`/storage/${offer.documents[0].path}`} className="text-blue-600 underline">
                                                {offer.documents[0].name}
                                            </a>
                                        )}
                                    </td>
                                    <td className="p-2">{new Date(offer.created_at).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </section>

    );
}
