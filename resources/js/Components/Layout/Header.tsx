import { usePage } from '@inertiajs/react';
import ApplicationLogo from '@/Components/Common/ApplicationLogo';
import LoginDialog from '@/Components/Dialogs/SignInDialog';
import type { Auth } from '@/types';
import NavigationMenu from '@/Components/Layout/NavigationMenu';

export default function Header() {
  const { auth } = usePage<{ auth: Auth }>().props;
  return (
    <header className="bg-firefly-900 text-white py-2 px-4 shadow">
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
