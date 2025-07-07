import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import FrontendLayout from '@/Layouts/FrontendLayout';
import DataTableDialog from '@/Components/Dialogs/DataTableDialog';

const columnsCDF = [
    { key: 'id', label: 'Org name' },
    { key: 'name', label: 'Level Of Operation' },
    { key: 'country', label: 'Specific Countries/Regions' },
    { key: 'link', label: 'Link' },
];

const columnsOP = [
    { key: 'title', label: 'title' },
    { key: 'description', label: 'description' },
    { key: 'organizer', label: 'Organizer' },
    { key: 'activityLink', label: 'Activity Link' },
];


const data = [{ id: "Partner 1", name: "Global", country: "Norway", link: "https://www.uuuu.com" },
{ id: "Partner 2", name: "National", country: "Central African Republic", link: "https://www.uuuu.com" },
{ id: "Partner 3", name: "Global", country: "Peru", link: "https://www.fffppp.com" },
{ id: "Partner 4", name: "Regional", country: "Palau", link: "https://www.uuqsduau.com" },
{ id: "Partner 5", name: "Regional", country: "China", link: "https://www.uuuu.com" }];



const dataOP = [{ title: "Marketing Manager", description: "Insertion of  Device...", organizer: "Mynte", activityLink: "http://netlog.com/libero/non/mattis.htm$m" },
{ title: "Sales Associate", description: "Repair Right Metatarsal-...", organizer: "Plambee", activityLink: "https://java.com/convunc&nascetur=proin&ridiculus=at&mus=turpis&etiam=a&vel=pede&a" },
{ title: "Staff Accountant III", description: "Division of Left Pelvic...", organizer: "Npath", activityLink: "https://howstuffworks.com/dud=tempus&augue=semper&aliquam=esat=nullam" },
{ title: "Structural Analysis Engineer", description: "Drainage of R Int Jugular..", organizer: "Oyope", activityLink: "http://unblog.fr/ipsumnn=sem&quis=fusce" },
{ title: "Technical Writer", description: "Destruction of Coccygeal Glomus, Perc Endo Approach", organizer: "Skippad", activityLink: "https://pbs.org/condimentum/curabiis&hac=mattis" }];

export default function Welcome({
}: PageProps<{ laravelVersion: string; phpVersion: string }>) {
    return (
        <FrontendLayout>
            <Head title="Welcome" />
            <section id="features" className="py-20 px-4">
                <div className="max-w-6xl mx-auto text-center">
                    <div className="grid md:grid-cols-2 gap-8">
                        <Link href="#" onClick={e=>e.preventDefault()} className="p-12 bg-firefly-600 shadow">
                            <h4 className="text-xl font-semibold mb-2 text-white">
                                Click to view CDF Partners supporting capacity development through the Matchmaking Platform.<br />
                                <DataTableDialog triggerLabel="Show Records" />
                            </h4>
                        </Link>
                        <a target="_blank" href="https://www.oceancd.org/landingpage" className="p-12 bg-firefly-600 shadow">
                            <h4 className="text-xl font-semibold text-white mb-2">
                                Search across Ocean CD Hub for available capacity development opportunities in one place.<br />
                            </h4>
                        </a>
                    </div>
                </div>
            </section>
        </FrontendLayout>
    );
}
