import {Head} from '@inertiajs/react';
import { FrontendLayout } from '@layouts/index';
import PortalGuideSection from "@features/home/components/portal-guide-section";
import DirectorySection from "@features/home/components/directory-section";
import {PortalGuide} from '@/types';
import { OrganizationsDialog, IOCPlatformsDialog } from '@features/settings';
import React, {useState} from "react";


interface IndexPageProps {
    portalGuide?: PortalGuide | null;
}

export default function Index({portalGuide}: Readonly<IndexPageProps>) {
    const [showOrganizationsDialog, setShowOrganizationsDialog] = useState(false);
    const [showIOCPlatformsDialog, setShowIOCPlatformsDialog] = useState(false);

    return (
        <FrontendLayout>
            <Head title="Welcome"/>
            <div className="space-y-9">
                {portalGuide && (
                    <PortalGuideSection portalGuide={portalGuide}/>
                )}

                <DirectorySection
                    onShowOrganizations={() => setShowOrganizationsDialog(true)}
                    onShowIOCPlatforms={() => setShowIOCPlatformsDialog(true)}
                />
            </div>

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
