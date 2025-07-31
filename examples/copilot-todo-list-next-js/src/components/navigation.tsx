"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { List, Layout, CheckSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavigationProps {
  currentView: "list" | "kanban";
}

export function Navigation({ currentView }: NavigationProps) {
  const views = [
    {
      id: "list" as const,
      label: "List View",
      icon: List,
      href: "/list",
    },
    {
      id: "kanban" as const,
      label: "Kanban Board",
      icon: Layout,
      href: "/kanban",
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/95 ">
      <div className="container flex h-16 items-center justify-between mx-auto">
        <div className="flex items-center gap-6">
          {/* Logo */}
          <Link href="/kanban" className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg">
              <CheckSquare className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-xl">TaskFlow</span>
          </Link>

          {/* View Switcher */}
          <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
            {views.map((view) => {
              const Icon = view.icon;
              const isActive = currentView === view.id;

              return (
                <Link key={view.id} href={view.href}>
                  <button className={cn("gap-2 flex items-center self-center rounded-md py-1 px-2 text-sm", isActive && "bg-background shadow-sm")}>
                    <Icon className="h-4 w-4" />
                    {view.label}
                  </button>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Theme Switcher */}
          {/* <ThemeSwitcher /> */}
        </div>
      </div>
    </header>
  );
}
