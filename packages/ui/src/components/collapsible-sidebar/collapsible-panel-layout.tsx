"use client";

import * as React from "react";

import { Footer } from "./footer";
import { Group } from "../../types/menu";
import { Sidebar } from "./sidebar";
import { cn } from "../../utils/cn";
import { useSidebarToggle } from "../../hooks/use-sidebar-toggle";
import { useStore } from "../../hooks/use-store";

export default function CollapsiblePanelLayout({
  children,
  menu,
  footerMessage,
  defaultCollapsed,
  sidebarContent,
  mainContent,
  className,
}: {
  children: React.ReactNode;
  menu: Group<string>[];
  footerMessage: string;
  defaultCollapsed: boolean;
  sidebarContent: React.ReactNode;
  mainContent: React.ReactNode;
  className?: string;
}) {
  const sidebar = useStore(useSidebarToggle, (state) => state);

  if (!sidebar) return null;

  return (
    <>
      <Sidebar menu={menu} />
      <main
        className={cn(
          "min-h-[calc(100vh_-_56px)] bg-zinc-50 transition-[margin-left] duration-300 ease-in-out dark:bg-zinc-900",
          sidebar?.isOpen === false ? "lg:ml-[90px]" : "lg:ml-72",
        )}
      >
        {children}
      </main>
      <footer
        className={cn(
          "transition-[margin-left] duration-300 ease-in-out",
          sidebar?.isOpen === false ? "lg:ml-[90px]" : "lg:ml-72",
        )}
      >
        <Footer description={footerMessage} />
      </footer>
    </>
  );
}
