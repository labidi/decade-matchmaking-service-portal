import {useForm} from '@inertiajs/react';
import {OfferProps} from '@/types';
import AttachmentsSection from '@/Pages/Request/Components/AttachmentsSection';

export default function OfferSection({OcdRequest, OcdRequestOffer}: OfferProps) {
    const form = useForm<{ description: string; partner_id: string; file: File | null }>({
        description: '',
        partner_id: '',
        file: null,
    });
    const getInputClass = () => {
        return "mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500";
    }
    return (
        <section id="attachements" className='my-8'>
            <div className="grid grid-cols-1">
                <div>
                    <h1 className="border-b-2 border-black-500 pb-4 text-2xl font-semibold tracking-tight text-pretty text-firefly-900 sm:text-3xl">
                        Offer
                    </h1>
                </div>
            </div>
            <div className="grid grid-cols-1">
                { OcdRequest.status.status_code == "validated" && (
                    <div>
                        <form className="mx-auto bg-white"
                              onSubmit={e => {
                                  e.preventDefault();
                                  form.post(route('admin.request.offer.store', {request: OcdRequest.id}), {
                                      forceFormData: true,
                                      onSuccess: () => form.reset(),
                                  });
                              }}
                        >
                            <div className='mt-8'>
                                <label htmlFor="partner_id" className="block font-medium">
                                    Partner ID
                                </label>
                                <p className="mt-1 text-base text-gray-500">Enter Unique ID (for partner)</p>
                                <input
                                    id="partner_id"
                                    type="text"
                                    className={getInputClass()}
                                    placeholder="Partner ID"
                                    value={form.data.partner_id}
                                    onChange={e => form.setData('partner_id', e.currentTarget.value)}
                                />
                                {form.errors.partner_id && (
                                    <p className="text-red-600 text-base mt-1">{form.errors.partner_id}</p>
                                )}
                            </div>

                            <div className='mt-8'>
                                <label htmlFor="description" className="block font-medium">
                                    Offer Description
                                </label>
                                <p className="mt-1 text-base text-gray-500">Add Offer Description</p>
                                <textarea
                                    id="description"
                                    className={getInputClass()}
                                    placeholder="Offer Description"
                                    value={form.data.description}
                                    onChange={e => form.setData('description', e.currentTarget.value)}
                                />
                                {form.errors.description && (
                                    <p className="text-red-600 text-base mt-1">{form.errors.description}</p>
                                )}
                            </div>

                            <div className='mt-8'>
                                <label htmlFor="file" className="block font-medium">
                                    Offer Document
                                </label>
                                <p className="mt-1 text-base text-gray-500">Add Offer Document</p>
                                <input
                                    id="file"
                                    type="file"
                                    accept="application/pdf"
                                    className={getInputClass()}
                                    onChange={e => form.setData('file', e.currentTarget.files ? e.currentTarget.files[0] : null)}
                                />
                                {form.errors.description && (
                                    <p className="text-red-600 text-base mt-1">{form.errors.description}</p>
                                )}
                            </div>

                            <div className="flex flex-col space-y-2">
                                <button
                                    type="submit"
                                    className="px-4 py-1 bg-firefly-600 text-white rounded disabled:opacity-50"
                                    disabled={form.processing || !form.data.file || !form.data.partner_id}
                                >
                                    Submit Offer
                                </button>
                            </div>
                        </form>
                    </div>
                )}
                {OcdRequestOffer && ['in_implementation','validated','offer_made'].includes(OcdRequest.status.status_code) && (
                    <>
                        <div className='my-5'>
                            <p>{OcdRequestOffer.description}</p>
                        </div>
                        <AttachmentsSection OcdRequest={OcdRequest} documents={OcdRequestOffer.documents}/>
                    </>
                )}
            </div>
        </section>

    );
}
