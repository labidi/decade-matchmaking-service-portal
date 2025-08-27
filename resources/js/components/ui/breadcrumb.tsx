import React from 'react'
import { usePage } from '@inertiajs/react'
import clsx from 'clsx'
import { ChevronRightIcon } from '@heroicons/react/16/solid'
import { Link } from '@/components/ui/link'
import { Text } from '@/components/ui/text'

export interface BreadcrumbItem {
  title: string;
  url?: string;
}

interface BreadcrumbProps {
  className?: string;
  items?: BreadcrumbItem[];
}

export function Breadcrumb({ className, items }: Readonly<BreadcrumbProps>) {
  const defaultItems = (usePage().props.breadcrumbs as BreadcrumbItem[]) || []
    const breadcrumbItems = items || defaultItems
    console.log('Rendering Breadcrumb with items:', breadcrumbItems);

  if (breadcrumbItems.length === 0) return null

  return (
    <nav
      aria-label="Breadcrumb"
      className={clsx(className, 'flex-grow container mx-auto py-4')}
    >
      <ol className="flex items-center gap-2">
        {breadcrumbItems.map((item, idx) => (
          <li key={`breadcrumb-${idx}`} className="flex items-center gap-2">
            {idx > 0 && (
              <ChevronRightIcon
                data-slot="icon"
                className="size-4 shrink-0 fill-zinc-400 dark:fill-zinc-500"
                aria-hidden="true"
              />
            )}
            {item.url ? (
              <Link
                href={item.url}
                className={clsx(
                  'text-sm/6 font-medium text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white',
                  'transition-colors duration-200'
                )}
              >
                {item.title}
              </Link>
            ) : (
              <Text
                className={clsx(
                  'text-sm/6 font-semibold text-zinc-950 dark:text-white',
                  'truncate'
                )}
                aria-current="page"
              >
                {item.title}
              </Text>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

// Default export for backward compatibility
export default Breadcrumb
