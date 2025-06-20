import React from 'react';
import { Link } from '@inertiajs/react';
import { Disclosure } from '@headlessui/react';
import { ChevronDown } from 'lucide-react';

const AdminMenu: React.FC = () => {
    return (
        <nav>
            <ul className="space-y-2">
                <li>
                    <Disclosure>
                        {({ open }) => (
                            <>
                                <Disclosure.Button className="flex w-full items-center justify-between rounded bg-gray-100 px-4 py-2 text-left font-semibold hover:bg-gray-200">
                                    <span>Portal</span>
                                    <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
                                </Disclosure.Button>
                                <Disclosure.Panel as="div" className="mt-2 pl-4">
                                    <ul className="space-y-1">
                                        <li>
                                            <Link className="text-firefly-700 hover:underline" href={route('admin.users.index')}>
                                                Portal configurations
                                            </Link>
                                        </li>
                                    </ul>
                                </Disclosure.Panel>
                            </>
                        )}
                    </Disclosure>
                </li>
                <li>
                    <Disclosure>
                        {({ open }) => (
                            <>
                                <Disclosure.Button className="flex w-full items-center justify-between rounded bg-gray-100 px-4 py-2 text-left font-semibold hover:bg-gray-200">
                                    <span>Users</span>
                                    <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
                                </Disclosure.Button>
                                <Disclosure.Panel as="div" className="mt-2 pl-4">
                                    <ul className="space-y-1">
                                        <li>
                                            <Link className="text-firefly-700 hover:underline" href={route('admin.users.index')}>
                                                Manage Users
                                            </Link>
                                        </li>
                                    </ul>
                                </Disclosure.Panel>
                            </>
                        )}
                    </Disclosure>
                </li>
                <li>
                    <Disclosure>
                        {({ open }) => (
                            <>
                                <Disclosure.Button className="flex w-full items-center justify-between rounded bg-gray-100 px-4 py-2 text-left font-semibold hover:bg-gray-200">
                                    <span>Requests</span>
                                    <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
                                </Disclosure.Button>
                                <Disclosure.Panel as="div" className="mt-2 pl-4">
                                    <ul className="space-y-1">
                                        <li>
                                            <Link className="text-firefly-700 hover:underline" href={route('admin.users.index')}>
                                                Manage Requests
                                            </Link>
                                        </li>
                                    </ul>
                                </Disclosure.Panel>
                            </>
                        )}
                    </Disclosure>
                </li>
                <li>
                    <Disclosure>
                        {({ open }) => (
                            <>
                                <Disclosure.Button className="flex w-full items-center justify-between rounded bg-gray-100 px-4 py-2 text-left font-semibold hover:bg-gray-200">
                                    <span>Opportunities</span>
                                    <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
                                </Disclosure.Button>
                                <Disclosure.Panel as="div" className="mt-2 pl-4">
                                    <ul className="space-y-1">
                                        <li>
                                            <Link className="text-firefly-700 hover:underline" href={'#'}>
                                                Dashboard
                                            </Link>
                                        </li>
                                    </ul>
                                </Disclosure.Panel>
                            </>
                        )}
                    </Disclosure>
                </li>
            </ul>
        </nav>
    );
};

export default AdminMenu;
