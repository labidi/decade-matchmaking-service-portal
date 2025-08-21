import {UIField} from '@/types';
import {UIStep} from "@/components/forms/UIOfferForm";


export const UISettingsForm: UIStep[] = [
    {
        label: 'General Settings',
        fields: {
            site_name: {
                id: 'site_name',
                type: 'text',
                required: false,
                label: 'Site Name',
                placeholder: 'Enter the site name',
            },
            site_description: {
                id: 'site_description',
                type: 'textarea',
                required: false,
                label: 'Site Description',
                placeholder: 'Enter a brief description of the site',
            },
            logo: {
                id: 'logo',
                type: 'file',
                required: false,
                label: 'Site Logo',
                description: 'Upload a logo for the site (PNG, JPG)',
                accept: 'image/png, image/jpeg',
            },
            homepage_youtube_video: {
                id: 'homepage_youtube_video',
                type: 'textarea',
                required: false,
                label: 'Homepage YouTube Video',
                placeholder: 'Enter the YouTube video URL for the homepage',
            }
        }
    },
    {
        label: 'Guides',
        fields:{
            portal_guide: {
                id: 'portal_guide',
                type: 'file',
                required: false,
                label: 'Portal Guide',
                description: 'Upload a PDF guide for the portal (PDF)',
                accept: 'application/pdf',
            },
            user_guide: {
                id: 'user_guide',
                type: 'file',
                required: false,
                label: 'User Guide',
                description: 'Upload a PDF User guide (PDF)',
                accept: 'application/pdf',
            },
            partner_guide: {
                id: 'partner_guide',
                type: 'file',
                required: true,
                label: 'Partner Guide',
                description: 'Upload a PDF User guide (PDF)',
                accept: 'application/pdf',
            }
        }
    },
    {
        label: 'Data Management',
        fields: {
            organizations_csv: {
                id: 'organizations_csv',
                type: 'csv-upload',
                required: false,
                label: 'Organizations CSV Import',
                description: 'Upload a CSV file containing organization data. The file should have 3 columns: organization name, description, and website link.',
                accept: '.csv,text/csv,application/csv',
            }
        }
    }
]
