import {Head, Link} from '@inertiajs/react';
import FrontendLayout from '@/components/ui/layouts/frontend-layout';
import PortalGuideSection from "@/components/ui/pages/index/portal-guide-section";
import {PortalGuide} from '@/types';
import OrganizationsDialog from '@/components/dialogs/OrganizationsDialog';
import IOCPlatformsDialog from '@/components/dialogs/IOCPlatformsDialog';
import React, { useState } from "react";

interface IndexPageProps {
    portalGuide?: PortalGuide | null;
}

export default function Index({portalGuide}: Readonly<IndexPageProps>) {
    const [showOrganizationsDialog, setShowOrganizationsDialog] = useState(false);
    const [showIOCPlatformsDialog, setShowIOCPlatformsDialog] = useState(false);

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
                                Click to view CDF Partners supporting capacity development through Ocean connector.<br/>
                            </h4>
                        </Link>
                        <Link
                            id="iocplatform"
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                setShowIOCPlatformsDialog(true);
                            }}
                            className="p-12 bg-firefly-600 shadow hover:bg-firefly-700 transition-colors cursor-pointer"
                        >
                            <h4 className="text-xl font-semibold text-white mb-2">
                                Click to view IOC Platforms Directory.
                            </h4>
                        </Link>
                    </div>
                </div>
            </section>

            <OrganizationsDialog
                open={showOrganizationsDialog}
                onClose={() => setShowOrganizationsDialog(false)}
            />

            <IOCPlatformsDialog
                open={showIOCPlatformsDialog}
                onClose={() => setShowIOCPlatformsDialog(false)}
            />
        </FrontendLayout>
    );
}
