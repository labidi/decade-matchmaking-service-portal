import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import FrontendLayout from '@/Layouts/FrontendLayout';

export default function Welcome({
}: PageProps<{ laravelVersion: string; phpVersion: string }>) {
    return (
        <>
            <Head title="Welcome" />

            <div className="bg-white text-gray-900">
                <header className="bg-firefly-950 text-white py-6 px-4 shadow">
                    <div className="container mx-auto flex items-center justify-between">
                        <h1 className="text-2xl font-bold">Ocean Portal</h1>
                        <nav className="space-x-6">
                            <a href="#features" className="hover:underline">Register</a>
                            <a href="#about" className="hover:underline">Login</a>
                        </nav>
                    </div>
                </header>
            </div>

            <section className="bg-firefly-700 py-20 px-4 text-center text-white">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-5xl font-bold mb-6">Connect for a Sustainable Ocean</h2>
                    <p className="text-xl mb-8">
                        Join researchers, innovators, and stakeholders to accelerate progress through collaboration.
                    </p>
                    <div class="aspect-w-16 aspect-h-9">
                        <iframe src="https://www.youtube.com/embed/nfpELa_Jqb0?si=nrLj0Z1H-cFSHW1C" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                    </div>
                </div>
            </section>

            <section id="features" className="py-20 px-4">
                <div className="max-w-6xl mx-auto text-center">
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="p-6 bg-gray-50 rounded-xl shadow">
                            <h4 className="text-xl font-semibold mb-2">
                                List of service providers partner with CDF
                            </h4>
                        </div>
                        <div className="p-6 bg-gray-50 rounded-xl shadow">
                            <h4 className="text-xl font-semibold mb-2">
                                List of Capacity Development Opportunities
                            </h4>
                        </div>
                    </div>
                </div>
            </section>

            <section id="footer" className="bg-gray-800 py-20 px-4">
            </section>
        </>
    );
}
