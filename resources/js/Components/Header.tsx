import { usePage } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import LoginDialog from '@/Components/Dialog/SignInDialog';
import type { Auth } from '@/types';
import UserNav from '@/Components/UserNav';

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
            <UserNav />
          )}
        </nav>
      </div>
    </header>
  );
}
