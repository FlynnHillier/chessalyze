"use server";

import { ReactNode } from "react";
import { redirectIfAuthed } from "~/app/_controllers/auth/auth.controllers";

export default async function LoginLayout({
  children,
}: {
  children: ReactNode;
}) {
  await redirectIfAuthed("/");

  return <>{children}</>;
}
