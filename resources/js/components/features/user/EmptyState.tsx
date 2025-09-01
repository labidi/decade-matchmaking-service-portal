import React from 'react';
import { Text } from '@/components/ui/text';
import { BellSlashIcon } from '@heroicons/react/24/outline';

export default function EmptyState() {
    return (
        <div className="text-center py-12">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                <BellSlashIcon className="h-8 w-8 text-zinc-400" />
            </div>
            <div className="mt-6 space-y-2">
                <Text className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
                    No notification preferences set
                </Text>
                <Text className="text-zinc-600 dark:text-zinc-400 max-w-md mx-auto">
                    You haven't configured any notification preferences yet. Add your first preference 
                    to start receiving email notifications about requests that match your interests.
                </Text>
            </div>
            <div className="mt-8 space-y-3">
                <Text className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    Get started by adding preferences for:
                </Text>
                <div className="flex flex-wrap justify-center gap-2 max-w-lg mx-auto">
                    {[
                        'Ocean Science Topics',
                        'Geographic Regions', 
                        'Target Audiences',
                        'Support Types',
                        'Funding Ranges'
                    ].map((item) => (
                        <span 
                            key={item}
                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                        >
                            {item}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}