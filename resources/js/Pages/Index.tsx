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
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-5xl font-bold mb-6">Connect for a Sustainable Ocean</h2>
                    <p className="text-xl mb-8">
                        Join researchers, innovators, and stakeholders to accelerate progress through collaboration.
                    </p>
                    <a
                        href="#get-started"
                        className="bg-blue-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-700 transition"
                    >
                        Get Started
                    </a>
                </div>
            </section>

            <section id="features" className="py-20 px-4">
                <div className="max-w-6xl mx-auto text-center">
                    <h3 className="text-3xl font-bold mb-12">What You Can Do</h3>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="p-6 bg-gray-50 rounded-xl shadow">
                            <h4 className="text-xl font-semibold mb-2">Discover Initiatives</h4>
                            <p className="text-gray-600">
                                Explore ongoing ocean science projects and find opportunities to contribute.
                            </p>
                        </div>
                        <div className="p-6 bg-gray-50 rounded-xl shadow">
                            <h4 className="text-xl font-semibold mb-2">Connect with Experts</h4>
                            <p className="text-gray-600">
                                Engage with scientists, institutions, and stakeholders around the globe.
                            </p>
                        </div>
                        <div className="p-6 bg-gray-50 rounded-xl shadow">
                            <h4 className="text-xl font-semibold mb-2">Collaborate Easily</h4>
                            <p className="text-gray-600">
                                Match with relevant contacts and projects aligned with your mission.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section id="about" className="bg-gray-100 py-20 px-4 text-center">
                <div className="max-w-3xl mx-auto">
                    <h3 className="text-3xl font-bold mb-4">About the Portal</h3>
                    <p className="text-gray-700">
                        This portal supports the UN Decade of Ocean Science for Sustainable Development by facilitating collaboration across disciplines, sectors, and borders.
                    </p>
                </div>
            </section>
        </>
    );
}
