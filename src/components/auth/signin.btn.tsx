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
      className="border-solid border-1 border-black"
      onClick={login}
    >
      {`Sign in with ${provider.name}`}
    </button>
  )
}