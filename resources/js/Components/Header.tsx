// resources/js/Components/Header.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import LoginDialog from '@/Components/Dialog/SignInDialog';
import type { Auth } from '@/types';
import { DropdownMenu } from "radix-ui";
import UserNav from '@/Components/UserNav';
import {
  HamburgerMenuIcon,
  DotFilledIcon,
  CheckIcon,
  ChevronRightIcon,
} from "@radix-ui/react-icons";

export default function Header() {
  // Typed Inertia props: auth comes from Types.Auth
  const { auth } = usePage<{ auth: Auth }>().props;
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const itemClassName =
    "relative flex cursor-default select-none items-center rounded-sm px-4 py-2 text-sm outline-none transition-colors focus:bg-slate-50 data-[disabled]:pointer-events-none data-[disabled]:opacity-50";


  return (
    <header className="bg-firefly-900 text-white py-2 px-4 shadow">
      <div className="container mx-auto flex items-center justify-between">
        <ApplicationLogo />
        <span className="text-4xl font-semibold text-white flex items-center gap-2">Capacity Development Matchmaking Platform</span>
        
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
