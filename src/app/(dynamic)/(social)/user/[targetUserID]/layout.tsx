"use client";

import { ReactNode } from "react";
import { ProfileViewProvider } from "./_components/ProfileView.context";

export default function ViewUserProfileLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <ProfileViewProvider> {children}</ProfileViewProvider>;
}
