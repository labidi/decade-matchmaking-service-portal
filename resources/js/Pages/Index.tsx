import {Head, Link} from '@inertiajs/react';
import FrontendLayout from '@/components/ui/layouts/frontend-layout';
import PortalGuideSection from "@/components/ui/pages/index/portal-guide-section";
import {PortalGuide} from '@/types';
import OrganizationsDialog from '@/components/dialogs/OrganizationsDialog';
import React, { useState } from "react";

interface IndexPageProps {
    portalGuide?: PortalGuide | null;
}

export default function Index({portalGuide}: Readonly<IndexPageProps>) {
    const [showOrganizationsDialog, setShowOrganizationsDialog] = useState(false);

    return (
        <FrontendLayout>
            <Head title="Welcome"/>
            {portalGuide && (
                <PortalGuideSection portalGuide={portalGuide}/>
            )}
            <section id="features" className="py-20 px-4">
                <div className="max-w-6xl mx-auto text-center">
                    <div className="grid md:grid-cols-2 gap-8">
                        <Link 
                            href="#" 
                            onClick={(e) => {
                                e.preventDefault();
                                setShowOrganizationsDialog(true);
                            }} 
                            className="p-12 bg-firefly-600 shadow hover:bg-firefly-700 transition-colors cursor-pointer"
                        >
                            <h4 className="text-xl font-semibold mb-2 text-white">
                                Click to view CDF Partners supporting capacity development through the Matchmaking
                                Platform.<br/>
                            </h4>
                        </Link>
                        <a target="_blank" href="https://www.oceancd.org/landingpage"
                           className="p-12 bg-firefly-600 shadow">
                            <h4 className="text-xl font-semibold text-white mb-2">
                                Search across Ocean CD Hub for available capacity development opportunities in one
                                place.<br/>
                            </h4>
                        </a>
                    </div>
                </div>
            </section>

            <OrganizationsDialog
                open={showOrganizationsDialog}
                onClose={() => setShowOrganizationsDialog(false)}
            />
        </FrontendLayout>
    );
}
