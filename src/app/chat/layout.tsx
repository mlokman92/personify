import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ChatShell } from "@/components/chat/chat-shell";
import { createClient } from "@/lib/supabase/server";
import type { Conversation } from "@/lib/types";

export default async function ChatLayout({ children }: LayoutProps<"/chat">) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/chat");
  }

  // Read the remembered sidebar state on the server so the first paint is right.
  const cookieStore = await cookies();
  const collapsed = cookieStore.get("personify_sidebar")?.value === "collapsed";

  const { data: conversations } = await supabase
    .from("conversations")
    .select("id, title, created_at, updated_at")
    .order("updated_at", { ascending: false });

  return (
    <ChatShell
      defaultCollapsed={collapsed}
      conversations={(conversations ?? []) as Conversation[]}
      email={user.email ?? ""}
      name={
        (user.user_metadata?.full_name as string | undefined) ??
        user.email?.split("@")[0] ??
        "You"
      }
    >
      {children}
    </ChatShell>
  );
}
