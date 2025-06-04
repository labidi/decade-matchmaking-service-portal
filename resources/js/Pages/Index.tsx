import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import FrontendLayout from '@/Layouts/FrontendLayout';
import DataTableDialog from '@/Components/Dialog/DataTableDialog';

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


const data = [{ id: "Devify", name: "Global", country: "Norway", link: "eklimochkin0@ucla.edu" },
{ id: "Skaboo", name: "National", country: "Central African Republic", link: "ltaft1@google.nl" },
{ id: "Quimm", name: "Global", country: "Peru", link: "orevance2@hatena.ne.jp" },
{ id: "Kare", name: "Regional", country: "Palau", link: "jtaborre3@angelfire.com" },
{ id: "Skippad", name: "Regional", country: "China", link: "mgerhold4@ning.com" }];



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
                        <div className="p-6 bg-firefly-200 rounded-xl shadow">
                            <h4 className="text-xl font-semibold mb-2">
                                Click to view CDF Partners supporting capacity development through the Matchmaking Platform.<br />
                                <DataTableDialog columns={columnsCDF} data={data} triggerLabel="Show Records" />
                            </h4>
                        </div>
                        <div className="p-6 bg-firefly-200 rounded-xl shadow">
                            <h4 className="text-xl font-semibold mb-2">
                                Search across IOC platforms for available capacity development opportunities in one place.<br />
                                <DataTableDialog columns={columnsOP} data={dataOP} triggerLabel="Show Records" />
                            </h4>
                        </div>
                    </div>
                </div>
            </section>
        </FrontendLayout>
    );
}
