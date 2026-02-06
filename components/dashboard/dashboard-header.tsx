"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { UserButton } from "@clerk/nextjs";

export function DashboardHeader({ title }: { title?: string }) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-4">
      <SidebarTrigger />
      <Separator orientation="vertical" className="h-6" />
      {title && (
        <h1 className="text-lg font-semibold truncate">{title}</h1>
      )}
      <div className="ml-auto flex items-center gap-2">
        <UserButton afterSignOutUrl="/" />
      </div>
    </header>
  );
}
