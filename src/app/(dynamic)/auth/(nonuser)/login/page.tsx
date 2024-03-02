import { getProviders } from "next-auth/react";
import SignInBtn from "~/components/auth/signin.btn";

export default async function SignIn() {
  const providers = await getProviders()

  return (
    <>
      {Object.values(providers ?? {}).map((provider) => {
        return (
          <div key={provider.name}>
            <SignInBtn provider={provider} />
          </div>
        )
      })}
    </>
  )

}

