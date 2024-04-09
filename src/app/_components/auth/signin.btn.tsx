"use client";

import { ClientSafeProvider, signIn } from "next-auth/react";
import { IconBrandGoogle } from "@tabler/icons-react";

function ProviderIcon({ provider }: { provider: ClientSafeProvider }) {
  return <>{provider.name === "Google" ? <IconBrandGoogle /> : <></>}</>;
}

export default function SignInBtn({
  provider,
}: {
  provider: ClientSafeProvider;
}) {
  function login() {
    signIn(provider.id);
  }

  return (
    <button
      className="border-4 border-t-amber-100 bg-zinc-500 p-2"
      onClick={login}
    >
      {`Sign in with ${provider.name}`}
    </button>
  );
}
