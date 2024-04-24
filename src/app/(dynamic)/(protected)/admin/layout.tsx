import { redirect } from "next/navigation";
import { ReactNode } from "react";

import { getServerSession } from "~/lib/lucia/util.lucia";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { user } = await getServerSession();

  if (!user || user.permissions < 1) {
    redirect("/");
  }

  return <>{children}</>;
}
