import React, { useState } from 'react';
import { Sidebar as PrimeSidebar } from 'primereact/sidebar';
import { PanelMenu } from 'primereact/panelmenu';
import { Link } from '@inertiajs/react';

// PrimeReact CSS should be imported globally, but if not, import here:
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

const Sidebar: React.FC = () => {
    const [visible, setVisible] = useState(true);

    const items = [
        {
            label: 'Portal',
            icon: 'pi pi-cog',
            items: [
                {
                    label: 'Portal configurations',
                    icon: 'pi pi-sliders-h',
                    template: (item: any, options: any) => (
                        <Link className="text-firefly-700 hover:underline" href={route('admin.portal.settings')}>{item.label}</Link>
                    )
                }
            ]
        },
        {
            label: 'Notifications',
            icon: 'pi pi-bell',
            items: [
                {
                    label: 'List Notifications',
                    icon: 'pi pi-list',
                    template: (item: any, options: any) => (
                        <Link className="text-firefly-700 hover:underline" href="#">{item.label}</Link>
                    )
                }
            ]
        },
        {
            label: 'Requests',
            icon: 'pi pi-inbox',
            items: [
                {
                    label: 'Manage Requests',
                    icon: 'pi pi-cog',
                    template: (item: any, options: any) => (
                        <Link className="text-firefly-700 hover:underline" href={route('admin.request.list')}>{item.label}</Link>
                    )
                }
            ]
        },
        {
            label: 'Users',
            icon: 'pi pi-users',
            items: [
                {
                    label: 'Manage Users',
                    icon: 'pi pi-user-edit',
                    template: (item: any, options: any) => (
                        <Link className="text-firefly-700 hover:underline" href={route('admin.users.roles.list')}>{item.label}</Link>
                    )
                }
            ]
        },
        {
            label: 'Opportunities',
            icon: 'pi pi-briefcase',
            items: [
                {
                    label: 'Dashboard',
                    icon: 'pi pi-th-large',
                    template: (item: any, options: any) => (
                        <Link className="text-firefly-700 hover:underline" href="#">{item.label}</Link>
                    )
                }
            ]
        }
    ];

    return (
        <PanelMenu model={items} className="w-full md:w-20rem" />
    );
};

export default Sidebar;
