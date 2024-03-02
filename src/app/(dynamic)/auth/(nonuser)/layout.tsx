import { redirect } from "next/navigation";
import { ReactNode } from "react";
import { getServerAuthSession } from "~/server/auth";


export default async function Layout({ children }: { children: ReactNode }) {
  const session = await getServerAuthSession()

  if (session) {
    redirect("/protected")
  }

  return (
    <>
      {children}
    </>
  )
}