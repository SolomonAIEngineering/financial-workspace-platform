import * as React from "react";

import { Group } from "../../types/menu";
import { ModeToggle } from "./mode-toggle";
import { SheetMenu } from "./sheet-menu";
import { UserNav } from "./user-nav";

interface NavbarProps {
  title: string;
  menu: Group<string>[];
  children?: React.ReactNode;
}

export function Navbar({ title, menu, children }: NavbarProps) {
  return (
    <header className="sticky top-0 z-10 w-full bg-background/95 shadow backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:shadow-secondary">
      <div className="mx-4 flex h-14 items-center sm:mx-8">
        <div className="flex items-center space-x-4 lg:space-x-0">
          <SheetMenu menu={menu} />
          <h1 className="font-bold">{title}</h1>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <ModeToggle />
          <UserNav />
          {children}
        </div>
      </div>
    </header>
  );
}
