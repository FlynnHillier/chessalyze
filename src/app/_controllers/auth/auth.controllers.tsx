"use server";

import { redirect } from "next/navigation";
import { getServerSession } from "~/lib/lucia/util.lucia";

export async function redirectIfAuthed(to: string) {
  const { user } = await getServerSession();

  if (user) redirect(to);
}

export async function redirectIfNotAuthed(to: string) {
  const { user } = await getServerSession();

  if (!user) redirect(to);
}
