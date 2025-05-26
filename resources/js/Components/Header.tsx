// resources/js/Components/Header.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import LoginDialog from '@/Components/Dialog/LoginDialog';
import type { Auth } from '@/types';
import { DropdownMenu } from "radix-ui";
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

  // Close dropdown on outside click []);

  return (
    <header className="bg-firefly-900 text-white py-2 px-4 shadow">
      <div className="container mx-auto flex items-center justify-between">
        <ApplicationLogo />
        <nav className="relative">
          {!auth.user ? (
            <LoginDialog />
          ) : (
            <DropdownMenu.Root>
              <DropdownMenu.Trigger className="inline-flex items-center justify-center whitespace-nowrap rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-300 disabled:pointer-events-none disabled:opacity-50 border border-slate-300 bg-white shadow-sm hover:bg-slate-50 text-slate-500 hover:text-slate-600 h-9 w-9">
                <HamburgerMenuIcon />
              </DropdownMenu.Trigger>

              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  className="z-50 min-w-[12rem] overflow-hidden rounded-lg border border-slate-200 bg-white py-1 text-slate-800 shadow-xl shadow-black/[.08] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
                  align="end"
                  sideOffset={12}
                >
                  <DropdownMenu.Label className="px-4 py-2">
                    <span className="flex items-center gap-3">
                      <span className="flex flex-col">
                        <p className="text-sm text-slate-800 font-medium">
                          {auth.user?.name}
                        </p>
                      </span>
                    </span>
                  </DropdownMenu.Label>
                  <DropdownMenu.Item className={itemClassName}>
                    <Link
                      href={route('request.list')}
                      className="hover:underline"
                    >
                      Manage Request
                    </Link>
                  </DropdownMenu.Item>
                  <DropdownMenu.Item className={itemClassName}>
                    <Link
                      href={route('logout')}
                      className="hover:underline"
                    >
                    Log out
                    </Link>
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          )}
        </nav>
      </div>
    </header>
  );
}
