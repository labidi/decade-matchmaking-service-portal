// resources/js/Components/Breadcrumb.tsx
import React from 'react';
import { Link } from '@inertiajs/react';
import { usePage } from '@inertiajs/react'

export interface BreadcrumbItem {
  name: string;
  url?: string;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
}
export default function Breadcrumb(){
  const defaultItems = usePage().props.breadcrumbs as BreadcrumbItem[] ||  [];
  if (defaultItems.length === 0) return null;
  return (
    <div className='flex-grow container mx-auto py-4'>
      <nav aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2 text-gray-600 text-base">
        {defaultItems.map((item, idx) => (
          <li key={idx} className="flex items-center">
            {idx > 0 && (
              <span className="mx-2" aria-hidden="true">
                &gt;
              </span>
            )}
            {item.url ? (
              <Link
                href={item.url}
                className="hover:underline"
              >
                {item.name}
              </Link>
            ) : (
              <span className="font-semibold text-gray-800">
                {item.name}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
    </div>

  );
};