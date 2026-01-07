import { Head } from '@inertiajs/react';
import { FrontendLayout } from '@layouts/index';
import {
    PortalGuideSection,
    HeroSection,
    AboutSection,
    ActionCard,
    StepCard,
} from '@features/home/components';
import { PortalGuide } from '@/types';
import { OrganizationsDialog, IOCPlatformsDialog } from '@features/settings';
import React, { useState } from 'react';
import { Heading } from '@ui/primitives/heading';
import { Text } from '@ui/primitives/text';
import { Button } from '@ui/primitives/button';
import {
    BuildingOffice2Icon,
    AcademicCapIcon,
    UserCircleIcon,
    MagnifyingGlassIcon,
    UsersIcon,
} from '@heroicons/react/24/outline';

interface IndexPageProps {
    portalGuide?: PortalGuide | null;
}

export default function Index({ portalGuide }: Readonly<IndexPageProps>) {
    const [showOrganizationsDialog, setShowOrganizationsDialog] = useState(false);
    const [showIOCPlatformsDialog, setShowIOCPlatformsDialog] = useState(false);

    return (
        <FrontendLayout>
            <Head title="Welcome" />

            {/* Hero Section */}
            <section className="mb-12">
                <HeroSection
                    title="Ocean Decade Portal"
                    subtitle="Connecting researchers, stakeholders, and initiatives to advance sustainable ocean science through the UN Decade of Ocean Science for Sustainable Development."
                    primaryCTA={{
                        text: 'Get Started',
                        href: route('sign.in'),
                    }}
                    secondaryCTA={{
                        text: 'Learn More',
                        href: '#about',
                    }}
                />
            </section>

            {/* Portal Guide (conditional) */}
            {portalGuide && (
                <section className="mb-12">
                    <PortalGuideSection portalGuide={portalGuide} />
                </section>
            )}

            {/* About Section */}
            <section id="about" className="mb-16">
                <AboutSection
                    title="About the Portal"
                    description="The Ocean Decade Portal serves as a central hub for capacity development in ocean science. It connects researchers seeking support with organizations offering opportunities, fostering collaboration and knowledge exchange across the global ocean science community."
                />
            </section>

            {/* Features Section */}
            <section id="features" className="mb-16 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-10">
                        <Heading
                            level={2}
                            className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4"
                        >
                            Explore Our Network
                        </Heading>
                        <Text className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                            Discover the organizations and platforms supporting capacity development in ocean science.
                        </Text>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        <ActionCard
                            title="CDF Partners Network"
                            description="View organizations supporting capacity development through the Ocean Connector platform."
                            icon={BuildingOffice2Icon}
                            onClick={() => setShowOrganizationsDialog(true)}
                            variant="request"
                        />
                        <ActionCard
                            title="IOC Platforms Directory"
                            description="Explore the directory of IOC platforms supporting capacity development in ocean science."
                            icon={AcademicCapIcon}
                            onClick={() => setShowIOCPlatformsDialog(true)}
                            variant="opportunity"
                        />
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="mb-16 px-4 py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <Heading
                            level={2}
                            className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4"
                        >
                            How It Works
                        </Heading>
                        <Text className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                            Get started with the Ocean Decade Portal in three simple steps.
                        </Text>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 mt-8">
                        <StepCard
                            stepNumber={1}
                            title="Create Your Profile"
                            description="Sign up and complete your profile to join the ocean science community."
                            icon={UserCircleIcon}
                        />
                        <StepCard
                            stepNumber={2}
                            title="Explore Opportunities"
                            description="Browse capacity development requests and partner opportunities."
                            icon={MagnifyingGlassIcon}
                        />
                        <StepCard
                            stepNumber={3}
                            title="Connect & Collaborate"
                            description="Match with partners and start collaborating on ocean science initiatives."
                            icon={UsersIcon}
                        />
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="mb-12 px-4">
                <div className="max-w-4xl mx-auto text-center py-12 px-8 bg-gradient-to-r from-firefly-600 to-bright-turquoise-600 dark:from-firefly-700 dark:to-bright-turquoise-700 rounded-xl shadow-lg">
                    <Heading
                        level={2}
                        className="text-2xl sm:text-3xl font-bold text-white mb-4"
                    >
                        Ready to Make an Impact?
                    </Heading>
                    <Text className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
                        Join the Ocean Decade Portal today and become part of the global effort to advance sustainable ocean science.
                    </Text>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                            href={route('sign.in')}
                            className="bg-white text-firefly-700 hover:bg-gray-100 px-8 py-3 font-semibold"
                        >
                            Sign In
                        </Button>
                    </div>
                </div>
            </section>

            {/* Dialogs */}
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
