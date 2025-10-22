import { usePage } from '@inertiajs/react';
import ApplicationLogo from '@/components/common/ApplicationLogo';
import LoginDialog from '@/components/dialogs/SignInDialog';
import type { Auth } from '@/types';
import NavigationMenu from '@/components/layouts/NavigationMenu';

export default function Header() {
  const { auth } = usePage<{ auth: Auth }>().props;
  return (
    <header className="bg-firefly-900 dark:bg-firefly-950 text-white py-2 px-4 shadow">
      <div className="container mx-auto flex items-center justify-between">
        <ApplicationLogo />
        <nav className="relative">
          {!auth.user ? (
            <LoginDialog />
          ) : (
            <NavigationMenu />
          )}
        </nav>
      </div>
    </header>
  );
}
