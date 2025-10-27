import { usePage } from '@inertiajs/react';
import { ApplicationLogo } from '@shared/components';
import { SignInDialog } from '@features/auth';
import type { Auth } from '@/types';
import { NavigationMenu } from '@layouts/components';

export default function Header() {
  const { auth } = usePage<{ auth: Auth }>().props;
  return (
    <header className="bg-firefly-900 dark:bg-firefly-950 text-white py-2 px-4 shadow">
      <div className="container mx-auto flex items-center justify-between">
        <ApplicationLogo />
        <nav className="relative">
          {!auth.user ? (
            <SignInDialog />
          ) : (
            <NavigationMenu />
          )}
        </nav>
      </div>
    </header>
  );
}
