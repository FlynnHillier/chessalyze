import { getServerSession } from "next-auth";
import { ReactNode } from "react";
import { authOptions } from "~/server/auth";
import { redirect } from "next/navigation";

export default async function RestrictedLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/login")
  }

  return (
    <>
      {children}
    </>
  )
}