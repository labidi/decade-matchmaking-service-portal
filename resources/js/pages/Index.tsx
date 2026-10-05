import {Head} from '@inertiajs/react';
import { FrontendLayout } from '@layouts/index';
import PortalGuideSection from "@features/home/components/portal-guide-section";
import DirectorySection from "@features/home/components/directory-section";
import { ODCTravelSupportSection } from "@features/odc-travel-support";
import {PortalGuide} from '@/types';
import { Opportunity, OpportunityFormOptions } from '@features/opportunities/types';
import { OrganizationsDialog, IOCPlatformsDialog } from '@features/settings';
import React, {useState} from "react";


interface IndexPageProps {
    portalGuide?: PortalGuide | null;
    /** Active ODC travel support opportunities, sorted by closing date. Provided by the backend to signed-in users only (issue #218). */
    odcTravelSupport?: Opportunity[];
    /** Select options for the ODC travel support upload form. Provided by the backend (issue #218). */
    formOptions?: OpportunityFormOptions;
}

export default function Index({portalGuide, odcTravelSupport, formOptions}: Readonly<IndexPageProps>) {
    const [showOrganizationsDialog, setShowOrganizationsDialog] = useState(false);
    const [showIOCPlatformsDialog, setShowIOCPlatformsDialog] = useState(false);

    return (
        <FrontendLayout>
            <Head title="Welcome"/>
            <div className="space-y-9">
                <ODCTravelSupportSection opportunities={odcTravelSupport} formOptions={formOptions} />

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
