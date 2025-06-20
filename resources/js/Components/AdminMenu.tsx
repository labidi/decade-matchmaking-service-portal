import React from 'react';
import { Link } from '@inertiajs/react';

const AdminMenu: React.FC = () => {
  return (
    <nav>
      <ul className="space-y-2">
        <li>
          <Link className="text-firefly-700 hover:underline" href={route('admin.users.index')}>
            Manage Users
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default AdminMenu;
