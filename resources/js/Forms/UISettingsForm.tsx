import {UIField} from '@/types';
import {UIStep} from "@/Forms/UIOfferForm";


export const UISettingsForm: UIStep[] = [
    {
        label: 'General Settings',
        fields: {
            site_name: {
                id: 'site_name',
                type: 'text',
                required: true,
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
                type: 'text',
                required: false,
                label: 'Homepage YouTube Video',
                placeholder: 'Enter the YouTube video URL for the homepage',
            }
        }
    }
]
