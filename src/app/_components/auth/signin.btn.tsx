"use client"

import { ClientSafeProvider, signIn } from "next-auth/react"
import { IconBrandGoogle } from "@tabler/icons-react"

function ProviderIcon({ provider }: { provider: ClientSafeProvider }) {
  return (
    <>
      {
        provider.name === "Google"
          ? <IconBrandGoogle />
          : <></>
      }
    </>
  )
}




export default function SignInBtn({ provider }: { provider: ClientSafeProvider }) {

  function login() {
    signIn(provider.id)
  }


  return (
    <button
      className="p-2 bg-zinc-500 border-t-amber-100 border-4"
      onClick={login}
    >
      {`Sign in with ${provider.name}`}
    </button>
  )
}