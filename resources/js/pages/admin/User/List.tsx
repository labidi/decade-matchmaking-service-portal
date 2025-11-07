import React, { useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import {SidebarLayout} from '@layouts/index';
import axios from 'axios';
import { Role, UserWithRoles } from '@/types';
import {Button, Heading} from "@ui/primitives";
import {PlusIcon} from "@heroicons/react/16/solid";

export default function UserRolesList() {
    const users = usePage().props.users as UserWithRoles[];
    const roles = usePage().props.roles as Role[];

    const [userRoles, setUserRoles] = useState<Record<number, string[]>>(() => {
        const map: Record<number, string[]> = {};
        users.forEach((u) => {
            map[u.id] = u.roles.map((r) => r.name);
        });
        return map;
    });

    const toggleRole = (userId: number, role: string) => {
        const existing = userRoles[userId] || [];
        const updated = existing.includes(role)
            ? existing.filter((r) => r !== role)
            : [...existing, role];
        setUserRoles({ ...userRoles, [userId]: updated });
        axios.post(route('admin.users.roles.update', userId), { roles: updated }).catch(() => {
            setUserRoles({ ...userRoles, [userId]: existing });
        });
    };

    return (
        <SidebarLayout>
            <Head title="Manage User Roles" />
            <div className="mx-auto">
                <Heading level={1}>
                    Requests List
                </Heading>
                <hr className="my-2 border-zinc-200 dark:border-zinc-700"/>
            </div>
            <div className="flex items-center justify-between">
                <div>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        View and manage all requests submitted by users.
                    </p>
                </div>
                <Button href={route('admin.offer.create')}>
                    <PlusIcon data-slot="icon"/>
                    Export Requests
                </Button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full table-auto bg-white">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-2 text-left text-xl font-medium text-gray-500 uppercase">ID</th>
                            <th className="px-4 py-2 text-left text-xl font-medium text-gray-500 uppercase">Name</th>
                            <th className="px-4 py-2 text-left text-xl font-medium text-gray-500 uppercase">Email</th>
                            {roles.map((role) => (
                                <th key={role.id} className="px-4 py-2 text-left text-xl font-medium text-gray-500 uppercase">
                                    {role.name}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-100">
                                <td className="px-4 py-2 whitespace-nowrap text-base text-gray-900">{user.id}</td>
                                <td className="px-4 py-2 whitespace-nowrap text-base text-gray-900">{user.name}</td>
                                <td className="px-4 py-2 whitespace-nowrap text-base text-gray-900">{user.email}</td>
                                {roles.map((role) => (
                                    <td key={role.id} className="px-4 py-2 text-center">
                                        <input
                                            type="checkbox"
                                            checked={userRoles[user.id]?.includes(role.name)}
                                            onChange={() => toggleRole(user.id, role.name)}
                                        />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </SidebarLayout>
    );
}
