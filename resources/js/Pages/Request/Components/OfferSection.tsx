import { Head, usePage, Link, useForm } from '@inertiajs/react';
import type { Auth } from '@/types';
import { AttachementsProps } from '@/types';

export default function OfferSection({ OcdRequest, canEdit = false, documents = [] }: AttachementsProps) {
    const form = useForm<{ file: File | null; document_type: string }>({
        file: null,
        document_type: 'offer',
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
            </div>
        </section>

    );
}
