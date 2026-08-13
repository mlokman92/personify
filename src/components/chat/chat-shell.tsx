"use client";

import { startTransition, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
  LogOut,
  Menu,
  MessageSquare,
  Monitor,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Sparkles,
  Sun,
  Trash2,
} from "lucide-react";

import { signOutAction } from "@/app/(auth)/actions";
import { deleteConversationAction } from "@/app/chat/actions";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { Conversation } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Remembered across reloads so the sidebar never flashes open then shut. */
const SIDEBAR_COOKIE = "personify_sidebar";

const THEMES = [
  { value: "system", label: "Default", icon: Monitor },
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
];

type SidebarData = {
  conversations: Conversation[];
  email: string;
  name: string;
};

function UserMenu({
  name,
  email,
  collapsed,
}: {
  name: string;
  email: string;
  collapsed: boolean;
}) {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            aria-label="Account and appearance"
            className={cn(
              "h-auto w-full py-2",
              collapsed ? "justify-center px-0" : "justify-start",
            )}
          />
        }
      >
        <span className="bg-muted text-foreground flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-medium uppercase">
          {name.charAt(0) || "U"}
        </span>
        {collapsed ? null : (
          <span className="flex min-w-0 flex-col items-start">
            <span className="w-full truncate text-sm font-medium">{name}</span>
            <span className="text-muted-foreground w-full truncate text-xs">
              {email}
            </span>
          </span>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" side="top" className="w-56">
        {/* Base UI requires a menu label to sit inside a group, unlike Radix. */}
        <DropdownMenuRadioGroup
          value={theme ?? "system"}
          onValueChange={(value) => setTheme(String(value))}
        >
          <DropdownMenuLabel>Appearance</DropdownMenuLabel>
          {THEMES.map(({ value, label, icon: Icon }) => (
            <DropdownMenuRadioItem key={value} value={value}>
              <Icon /> {label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          variant="destructive"
          onClick={() => startTransition(() => signOutAction())}
        >
          <LogOut /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function SidebarContent({
  conversations,
  email,
  name,
  collapsed = false,
  onToggle,
  onNavigate,
}: SidebarData & {
  collapsed?: boolean;
  onToggle?: () => void;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col gap-3 p-3">
      <div
        className={cn(
          "flex items-center gap-1",
          collapsed ? "flex-col" : "justify-between",
        )}
      >
        <Link
          href="/"
          onClick={onNavigate}
          aria-label="Personify AI home"
          className="flex items-center gap-2 px-1 py-1 font-semibold"
        >
          <span className="bg-primary text-primary-foreground flex size-7 shrink-0 items-center justify-center rounded-lg">
            <Sparkles className="size-3.5" />
          </span>
          {collapsed ? null : (
            <span className="tracking-tight">Personify AI</span>
          )}
        </Link>

        {onToggle ? (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onToggle}
            title={collapsed ? "Expand sidebar" : "Minimize sidebar"}
            aria-label={collapsed ? "Expand sidebar" : "Minimize sidebar"}
          >
            {collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
          </Button>
        ) : null}
      </div>

      {collapsed ? (
        <Button
          nativeButton={false}
          variant="outline"
          size="icon"
          title="New analysis"
          aria-label="New analysis"
          render={<Link href="/chat" onClick={onNavigate} />}
        >
          <Plus />
        </Button>
      ) : (
        <Button
          nativeButton={false}
          variant="outline"
          className="w-full justify-start"
          render={<Link href="/chat" onClick={onNavigate} />}
        >
          <Plus /> New analysis
        </Button>
      )}

      {collapsed ? (
        <div className="flex-1" />
      ) : (
        <ScrollArea className="-mx-1 flex-1 px-1">
          <p className="text-muted-foreground px-2 py-2 text-xs font-medium">
            Recent
          </p>

          {conversations.length === 0 ? (
            <p className="text-muted-foreground px-2 text-sm">
              No analyses yet. Upload an ad copy to get started.
            </p>
          ) : (
            <ul className="flex flex-col gap-0.5">
              {conversations.map((conversation) => {
                const active = pathname === `/chat/${conversation.id}`;

                return (
                  <li key={conversation.id} className="group/item relative">
                    <Link
                      href={`/chat/${conversation.id}`}
                      onClick={onNavigate}
                      className={cn(
                        "hover:bg-accent flex items-center gap-2 rounded-md px-2 py-2 pr-9 text-sm transition-colors",
                        active && "bg-accent font-medium",
                      )}
                    >
                      <MessageSquare className="text-muted-foreground size-3.5 shrink-0" />
                      <span className="truncate">{conversation.title}</span>
                    </Link>

                    <form action={deleteConversationAction}>
                      <input
                        type="hidden"
                        name="conversationId"
                        value={conversation.id}
                      />
                      <input
                        type="hidden"
                        name="isActive"
                        value={String(active)}
                      />
                      <Button
                        type="submit"
                        variant="ghost"
                        size="icon"
                        aria-label={`Delete ${conversation.title}`}
                        className="text-muted-foreground hover:text-destructive absolute top-1/2 right-1 size-7 -translate-y-1/2 opacity-0 group-hover/item:opacity-100 focus-visible:opacity-100"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </form>
                  </li>
                );
              })}
            </ul>
          )}
        </ScrollArea>
      )}

      <UserMenu name={name} email={email} collapsed={collapsed} />
    </div>
  );
}

export function ChatShell({
  children,
  defaultCollapsed = false,
  ...sidebar
}: SidebarData & {
  children: ReactNode;
  defaultCollapsed?: boolean;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  function toggleSidebar() {
    const next = !collapsed;
    setCollapsed(next);
    document.cookie = `${SIDEBAR_COOKIE}=${next ? "collapsed" : "expanded"}; path=/; max-age=31536000; samesite=lax`;
  }

  return (
    <div className="flex h-dvh overflow-hidden">
      <aside
        className={cn(
          "bg-sidebar hidden shrink-0 border-r transition-[width] duration-200 ease-out md:block",
          collapsed ? "w-16" : "w-72",
        )}
      >
        <SidebarContent
          {...sidebar}
          collapsed={collapsed}
          onToggle={toggleSidebar}
        />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-3 md:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" aria-label="Open menu" />
              }
            >
              <Menu />
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SheetTitle className="sr-only">Conversations</SheetTitle>
              <SidebarContent
                {...sidebar}
                onNavigate={() => setMobileOpen(false)}
              />
            </SheetContent>
          </Sheet>
          <span className="font-semibold tracking-tight">Personify AI</span>
        </header>

        <main className="flex min-h-0 flex-1 flex-col">{children}</main>
      </div>
    </div>
  );
}
